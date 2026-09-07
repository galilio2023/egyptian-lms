import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { checkRateLimit } from "@/lib/security/rate-limiter";

const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET || "";

/**
 * Paymob Webhook HMAC SHA-512 Verification
 *
 * Validates the webhook callback signature by concatenating the 20 specified
 * transaction fields in Paymob's required lexicographical order, computing
 * HMAC-SHA512 with the merchant's HMAC secret, and comparing via timing-safe
 * equality to prevent both spoofing and timing-based side-channel attacks.
 *
 * Reference: https://docs.paymob.com/docs/transaction-webhooks
 */
function verifyPaymobHmac(
  obj: Record<string, unknown>,
  providedHmac: string
): boolean {
  if (!PAYMOB_HMAC_SECRET) {
    console.error(
      "⚠️ CRITICAL: PAYMOB_HMAC_SECRET is not configured. Webhook verification cannot proceed."
    );
    return false;
  }

  if (!providedHmac) {
    return false;
  }

  // Extract nested fields safely
  const order = (obj.order as Record<string, unknown>) || {};
  const sourceData = (obj.source_data as Record<string, unknown>) || {};

  // Concatenate the 20 fields in Paymob's strict lexicographical order
  // Each value is converted to string exactly as Paymob sends it
  const concatenated = [
    String(obj.amount_cents ?? ""),
    String(obj.created_at ?? ""),
    String(obj.currency ?? ""),
    String(obj.error_occured ?? "false"),
    String(obj.has_parent_transaction ?? "false"),
    String(obj.id ?? ""),
    String(obj.integration_id ?? ""),
    String(obj.is_3d_secure ?? "false"),
    String(obj.is_auth ?? "false"),
    String(obj.is_capture ?? "false"),
    String(obj.is_refunded ?? "false"),
    String(obj.is_standalone_payment ?? "true"),
    String(obj.is_voided ?? "false"),
    String(order.id ?? ""),
    String(obj.owner ?? ""),
    String(obj.pending ?? "false"),
    String(sourceData.pan ?? ""),
    String(sourceData.sub_type ?? ""),
    String(sourceData.type ?? ""),
    String(obj.success ?? "false"),
  ].join("");

  // Compute HMAC-SHA512
  const computedHmac = crypto
    .createHmac("sha512", PAYMOB_HMAC_SECRET)
    .update(concatenated)
    .digest("hex");

  // Timing-safe comparison to prevent timing attacks
  try {
    const computedBuffer = Buffer.from(computedHmac, "hex");
    const providedBuffer = Buffer.from(providedHmac, "hex");

    if (computedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, providedBuffer);
  } catch {
    // If Buffer conversion fails (e.g., invalid hex), fall back to string comparison
    return computedHmac === providedHmac;
  }
}

/**
 * Paymob Webhook Handler with HMAC SHA-512 Verification & Strict Idempotency Protection
 * Handles automated payment notifications from Paymob (Credit Card, Meeza, Mobile Wallets)
 */
export async function POST(request: NextRequest) {
  try {
    // Extract HMAC from query parameters (Paymob sends it as ?hmac=<hash>)
    const { searchParams } = new URL(request.url);
    const providedHmac = searchParams.get("hmac") || "";

    const body = await request.json();
    const { obj } = body as {
      obj?: {
        id: number | string; // Paymob Transaction ID
        amount_cents?: number;
        created_at?: string;
        currency?: string;
        error_occured?: boolean;
        has_parent_transaction?: boolean;
        integration_id?: number | string;
        is_3d_secure?: boolean;
        is_auth?: boolean;
        is_capture?: boolean;
        is_refunded?: boolean;
        is_standalone_payment?: boolean;
        is_voided?: boolean;
        owner?: number | string;
        pending?: boolean;
        success: boolean;
        order?: {
          id: number | string;
          merchant_order_id?: string;
        };
        source_data?: {
          pan?: string;
          sub_type?: string;
          type?: string;
        };
        data?: {
          message?: string;
        };
      };
    };

    if (!obj || !obj.id) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // ──────────────────────────────────────────────────────────
    // HMAC SHA-512 Signature Verification (P0 Security Fix)
    // ──────────────────────────────────────────────────────────
    const isHmacValid = verifyPaymobHmac(
      obj as unknown as Record<string, unknown>,
      providedHmac
    );

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!isHmacValid) {
      // CWE-400 DoS Protection: Rate limit failed HMAC audit inserts to prevent DB capacity exhaustion
      const hmacRateKey = `paymob-invalid-hmac:${clientIp}`;
      const rateCheck = checkRateLimit(hmacRateKey, "paymobInvalidHmac");
      if (rateCheck.success) {
        logSecurityEvent({
          eventType: "rate_limit_triggered",
          severity: "critical",
          description: `🚨 Paymob webhook HMAC verification FAILED — potential spoofing attack. Transaction ID: ${obj.id}`,
          ipAddress: clientIp,
          details: {
            transactionId: String(obj.id),
            providedHmac: providedHmac ? `${providedHmac.slice(0, 12)}...` : "(empty)",
            orderId: obj.order?.merchant_order_id,
          },
        });
      }

      return NextResponse.json(
        { error: "HMAC signature verification failed. Request rejected." },
        { status: 403 }
      );
    }

    const transactionId = String(obj.id);
    const isSuccess = Boolean(obj.success && !obj.is_voided && !obj.is_refunded);
    const merchantOrderId = obj.order?.merchant_order_id;
    const gatewayOrderId = obj.order?.id ? String(obj.order.id) : null;

    // 1. Idempotency Guard: Check if transaction has already been processed
    try {
      const [existingCompletedOrder] = await db
        .select()
        .from(schema.order)
        .where(eq(schema.order.gatewayTransactionId, transactionId))
        .limit(1);

      if (existingCompletedOrder) {
        // Idempotent return: acknowledge receipt to gateway without re-executing business logic
        return NextResponse.json(
          {
            success: true,
            message: "Transaction already processed idempotently.",
            orderId: existingCompletedOrder.id,
            alreadyProcessed: true,
          },
          { status: 200 }
        );
      }
    } catch (lookupErr) {
      console.warn("Idempotency transaction check note:", lookupErr);
    }

    // 2. Locate target order
    // SECURITY (CWE-347): Paymob HMAC signs obj.order.id (gatewayOrderId), NOT merchant_order_id.
    // To prevent parameter tampering where merchant_order_id is modified to point to another order:
    // 1) First lookup using HMAC-signed gatewayOrderId.
    // 2) If looking up by merchantOrderId, require signed gatewayOrderId to be present and strictly match stored gatewayOrderId.
    let targetOrder: typeof schema.order.$inferSelect | undefined;
    if (gatewayOrderId) {
      const [foundByGatewayId] = await db
        .select()
        .from(schema.order)
        .where(eq(schema.order.gatewayOrderId, gatewayOrderId))
        .limit(1);
      targetOrder = foundByGatewayId;
    }

    if (!targetOrder && merchantOrderId) {
      if (!gatewayOrderId) {
        console.warn("Paymob webhook: reject merchant_order_id fallback without signed gatewayOrderId");
        return NextResponse.json(
          { error: "Missing signed gatewayOrderId for merchant order fallback" },
          { status: 403 }
        );
      }

      const [foundByMerchantId] = await db
        .select()
        .from(schema.order)
        .where(eq(schema.order.id, merchantOrderId))
        .limit(1);

      if (foundByMerchantId) {
        // Enforce that if order already has a gatewayOrderId recorded, it must match the signed gatewayOrderId
        if (foundByMerchantId.gatewayOrderId && foundByMerchantId.gatewayOrderId !== gatewayOrderId) {
          logSecurityEvent({
            eventType: "unauthorized_portal_access",
            severity: "critical",
            description: `🚨 Paymob webhook order mismatch: signed gatewayOrderId ${gatewayOrderId} does not match stored ${foundByMerchantId.gatewayOrderId} for order ${foundByMerchantId.id}`,
            details: {
              merchantOrderId,
              gatewayOrderId,
              storedGatewayOrderId: foundByMerchantId.gatewayOrderId,
            },
          });
          return NextResponse.json(
            { error: "Order gateway ID mismatch" },
            { status: 403 }
          );
        }
        targetOrder = foundByMerchantId;
      }
    }

    if (!targetOrder) {
      console.warn("Paymob webhook received for unrecognized order:", { transactionId, merchantOrderId, gatewayOrderId });
      return NextResponse.json({ success: true, note: "Order not found or demo mode" }, { status: 200 });
    }

    // 3. Process Transaction Outcome
    if (isSuccess) {
      // FinTech Price & Currency Verification: Ensure amount_cents matches recorded unit price
      const expectedCents = Math.round(targetOrder.amountEgp * 100);
      const receivedCents = Number(obj.amount_cents);
      const receivedCurrency = obj.currency ? String(obj.currency).toUpperCase() : "EGP";

      if (receivedCents !== expectedCents || receivedCurrency !== "EGP") {
        logSecurityEvent({
          eventType: "rate_limit_triggered",
          severity: "critical",
          description: `🚨 Paymob payment amount mismatch: Expected ${expectedCents} cents, received ${receivedCents} ${receivedCurrency}`,
          details: { orderId: targetOrder.id, expectedCents, receivedCents, currency: receivedCurrency },
        });

        await db
          .update(schema.order)
          .set({
            paymentStatus: "manual_review",
            reviewerNotes: `تنبيه أمني: المبلغ المدفوع (${receivedCents / 100} ${receivedCurrency}) لا يطابق سعر الكورس المطلوب (${targetOrder.amountEgp} ج.م).`,
            gatewayTransactionId: transactionId,
            updatedAt: new Date(),
          })
          .where(eq(schema.order.id, targetOrder.id));

        return NextResponse.json(
          { error: "Amount or currency mismatch. Flagged for manual review." },
          { status: 400 }
        );
      }

      // Atomic transaction: update order status and activate enrollment
      await db.transaction(async (tx) => {
        await tx
          .update(schema.order)
          .set({
            paymentStatus: "completed",
            gatewayTransactionId: transactionId,
            gatewayOrderId: gatewayOrderId || targetOrder.gatewayOrderId,
            updatedAt: new Date(),
          })
          .where(eq(schema.order.id, targetOrder.id));

        await tx
          .insert(schema.enrollment)
          .values({
            userId: targetOrder.userId,
            unitId: targetOrder.unitId,
            isActive: true,
          })
          .onConflictDoUpdate({
            target: [schema.enrollment.userId, schema.enrollment.unitId],
            set: { isActive: true, enrolledAt: new Date() },
          });
      });

      logSecurityEvent({
        eventType: "voucher_redeem_success",
        severity: "low",
        userId: targetOrder.userId,
        description: `تم إتمام دفع الكورس بنجاح عبر بوابة باي موب (HMAC Verified + Idempotent): معاملة رقم ${transactionId}`,
        details: { transactionId, orderId: targetOrder.id, amountEgp: targetOrder.amountEgp },
      });

      return NextResponse.json({
        success: true,
        processed: true,
        orderId: targetOrder.id,
        enrollmentActivated: true,
      });
    } else {
      // Payment Failed or Rejected
      await db
        .update(schema.order)
        .set({
          paymentStatus: "failed",
          gatewayTransactionId: transactionId,
          reviewerNotes: obj.data?.message || "فشلت عملية الدفع الإلكتروني عبر بوابة باي موب.",
          updatedAt: new Date(),
        })
        .where(eq(schema.order.id, targetOrder.id));

      return NextResponse.json({
        success: true,
        processed: true,
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Paymob webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing error", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
