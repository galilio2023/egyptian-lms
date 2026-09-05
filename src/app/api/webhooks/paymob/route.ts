import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security/audit-logger";

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
    // If HMAC secret is not configured, skip verification in dev mode only
    if (process.env.NODE_ENV === "production") {
      console.error(
        "⚠️ CRITICAL: PAYMOB_HMAC_SECRET is not configured in production. Webhook verification cannot proceed."
      );
      return false;
    }
    console.warn(
      "⚠️ PAYMOB_HMAC_SECRET not set — skipping HMAC verification (dev mode only)."
    );
    return true;
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

    if (!isHmacValid) {
      logSecurityEvent({
        eventType: "rate_limit_triggered",
        severity: "critical",
        description: `🚨 Paymob webhook HMAC verification FAILED — potential spoofing attack. Transaction ID: ${obj.id}`,
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown",
        details: {
          transactionId: String(obj.id),
          providedHmac: providedHmac ? `${providedHmac.slice(0, 12)}...` : "(empty)",
          orderId: obj.order?.merchant_order_id,
        },
      });

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
    let targetOrder: typeof schema.order.$inferSelect | undefined;
    if (merchantOrderId) {
      const [found] = await db
        .select()
        .from(schema.order)
        .where(eq(schema.order.id, merchantOrderId))
        .limit(1);
      targetOrder = found;
    }

    if (!targetOrder && gatewayOrderId) {
      const [found] = await db
        .select()
        .from(schema.order)
        .where(eq(schema.order.gatewayOrderId, gatewayOrderId))
        .limit(1);
      targetOrder = found;
    }

    if (!targetOrder) {
      console.warn("Paymob webhook received for unrecognized order:", { transactionId, merchantOrderId, gatewayOrderId });
      return NextResponse.json({ success: true, note: "Order not found or demo mode" }, { status: 200 });
    }

    // 3. Process Transaction Outcome
    if (isSuccess) {
      // Atomic status update
      await db
        .update(schema.order)
        .set({
          paymentStatus: "completed",
          gatewayTransactionId: transactionId,
          gatewayOrderId: gatewayOrderId || targetOrder.gatewayOrderId,
          updatedAt: new Date(),
        })
        .where(eq(schema.order.id, targetOrder.id));

      // Activate Course Enrollment
      const [existingEnrollment] = await db
        .select()
        .from(schema.enrollment)
        .where(
          and(
            eq(schema.enrollment.userId, targetOrder.userId),
            eq(schema.enrollment.unitId, targetOrder.unitId)
          )
        )
        .limit(1);

      if (!existingEnrollment) {
        await db.insert(schema.enrollment).values({
          userId: targetOrder.userId,
          unitId: targetOrder.unitId,
          isActive: true,
        });
      } else if (!existingEnrollment.isActive) {
        await db
          .update(schema.enrollment)
          .set({ isActive: true })
          .where(eq(schema.enrollment.id, existingEnrollment.id));
      }

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
