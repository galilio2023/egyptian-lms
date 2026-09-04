import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security/audit-logger";

/**
 * Paymob Webhook Handler with Strict Idempotency Protection
 * Handles automated payment notifications from Paymob (Credit Card, Meeza, Mobile Wallets)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { obj } = body as {
      obj?: {
        id: number | string; // Paymob Transaction ID
        success: boolean;
        is_voided?: boolean;
        is_refunded?: boolean;
        order?: {
          id: number | string;
          merchant_order_id?: string;
        };
        data?: {
          message?: string;
        };
      };
    };

    if (!obj || !obj.id) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
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
        description: `تم إتمام دفع الكورس بنجاح عبر بوابة باي موب (Idempotent): معالمة رقم ${transactionId}`,
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
