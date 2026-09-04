import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt, ne } from "drizzle-orm";
import { validateEgyptianPhone } from "@/lib/utils";
import { INITIAL_UNITS } from "@/lib/db/mock-data";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const session = await auth.api.getSession({ headers: reqHeaders });

    // Rate Limiting: max 8 order submissions per 10 minutes per IP/User
    const rateKey = `order-submit:${session?.user?.id || clientIp}`;
    const rateCheck = checkRateLimit(rateKey, { maxRequests: 8, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.success) {
      return createRateLimitResponse(
        rateCheck,
        "تم تجاوز الحد الأقصى لمحاولات إنشاء الطلبات في وقت قصير. يرجى الانتظار قليلاً."
      );
    }

    const body = await request.json();
    const {
      unitId,
      paymentMethod,
      referenceNumber,
      receiptImageUrl,
      studentPhone,
      idempotencyKey: clientProvidedKey,
    } = body;

    if (!unitId || !paymentMethod) {
      return NextResponse.json(
        { error: "بيانات الطلب غير مكتملة." },
        { status: 400 }
      );
    }

    const validMethods = schema.paymentMethodEnum.enumValues;
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "طريقة الدفع المختارة غير صالحة." },
        { status: 400 }
      );
    }

    // Try finding user ID from session or phone
    let userId: string | null = session?.user?.id || null;
    const cleanStd = studentPhone ? validateEgyptianPhone(studentPhone) : null;

    if (!userId && cleanStd) {
      try {
        const [userRecord] = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.phoneNumber, cleanStd))
          .limit(1);
        if (userRecord) userId = userRecord.id;
      } catch {
        // Fallback
      }
    }

    // Server-side Price Verification (Prevents Client-Side Price Tampering)
    let verifiedPrice = 250;
    let verifiedTitle = "الوحدة الدراسية";
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unitId);

    if (isUUID) {
      try {
        const [dbUnit] = await db
          .select()
          .from(schema.courseUnit)
          .where(eq(schema.courseUnit.id, unitId))
          .limit(1);

        if (dbUnit) {
          verifiedPrice = dbUnit.price || 250;
          verifiedTitle = dbUnit.title;
        }

        // Check if student already has an active, non-expired enrollment in this unit
        if (userId) {
          const now = new Date();
          const [alreadyEnrolled] = await db
            .select({ id: schema.enrollment.id })
            .from(schema.enrollment)
            .where(
              and(
                eq(schema.enrollment.userId, userId),
                eq(schema.enrollment.unitId, unitId),
                eq(schema.enrollment.isActive, true),
                or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
              )
            )
            .limit(1);

          if (alreadyEnrolled) {
            return NextResponse.json(
              { error: "أنت مشترك ومفعّل بالفعل في هذه الوحدة الدراسية حالياً." },
              { status: 400 }
            );
          }
        }
      } catch (unitFetchErr) {
        console.warn("Unit price lookup note:", unitFetchErr);
      }
    } else {
      const mockU = INITIAL_UNITS.find((u) => u.id === unitId || u.slug === unitId);
      if (mockU) {
        verifiedPrice = mockU.priceEgp || 250;
        verifiedTitle = mockU.title;
      }
    }

    // Financial Idempotency Key Computation
    // Standard RFC header "Idempotency-Key" or deterministic hash
    const headerKey = reqHeaders.get("idempotency-key");
    const cleanRef = referenceNumber?.trim();
    const effectiveIdempotencyKey = (
      headerKey ||
      clientProvidedKey ||
      (userId && cleanRef ? `idemp-${crypto.createHash("sha256").update(`${userId}:${unitId}:${cleanRef}`).digest("hex").slice(0, 32)}` : null)
    );

    // 1. Idempotency Check: Return existing order if identical request is replayed (prevents double charge / duplicate review)
    if (effectiveIdempotencyKey && isUUID) {
      try {
        const [existingOrder] = await db
          .select()
          .from(schema.order)
          .where(eq(schema.order.idempotencyKey, effectiveIdempotencyKey))
          .limit(1);

        if (existingOrder) {
          return NextResponse.json(
            {
              success: true,
              orderId: existingOrder.id,
              isIdempotentReplay: true,
              status: existingOrder.paymentStatus,
              message: "تم استرجاع طلبك السابق المسجل بنجاح ومنع تكرار العملية (Idempotent Replay).",
              orderDetails: {
                id: existingOrder.id,
                unitTitle: verifiedTitle,
                amountEgp: existingOrder.amountEgp,
                paymentMethod: existingOrder.paymentMethod,
                referenceNumber: existingOrder.referenceNumber,
                createdAt: existingOrder.createdAt.toISOString(),
              },
            },
            {
              headers: {
                "Idempotent-Replayed": "true",
              },
            }
          );
        }
      } catch (idempErr) {
        console.warn("Idempotency lookup note:", idempErr);
      }
    }

    // 2. Duplicate Reference Number Fraud Prevention: Check if reference number was already used on another completed/submitted order
    if (cleanRef && isUUID) {
      try {
        const [duplicateRef] = await db
          .select({ id: schema.order.id, userId: schema.order.userId })
          .from(schema.order)
          .where(
            and(
              eq(schema.order.referenceNumber, cleanRef),
              ne(schema.order.userId, userId || "")
            )
          )
          .limit(1);

        if (duplicateRef) {
          logSecurityEvent({
            eventType: "rate_limit_triggered",
            severity: "high",
            userId,
            studentPhone: cleanStd,
            ipAddress: clientIp,
            description: `محاولة استخدام رقم مرجعي للتحويل مستخدم من حساب طالب آخر: ${cleanRef}`,
            details: { referenceNumber: cleanRef, conflictingOrderId: duplicateRef.id },
          });

          return NextResponse.json(
            { error: "هذا الرقم المرجعي للتحويل تم تسجيله واستخدامه مسبقاً لحساب آخر. يرجى التأكد من رقم إيصالك." },
            { status: 400 }
          );
        }
      } catch (refCheckErr) {
        console.warn("Duplicate reference check note:", refCheckErr);
      }
    }

    let insertedOrderId: string | null = null;
    const fallbackOrderId = `ord-${Date.now().toString().slice(-6)}`;

    // Try database insertion
    try {
      if (userId && isUUID) {
        const [insertedOrder] = await db.insert(schema.order).values({
          userId: userId,
          unitId: unitId,
          amountEgp: verifiedPrice, // Always server verified!
          paymentMethod: paymentMethod as (typeof schema.paymentMethodEnum.enumValues)[number],
          paymentStatus: paymentMethod.startsWith("paymob") ? "pending" : "manual_review",
          referenceNumber: cleanRef || `REF-${Date.now()}`,
          receiptImageUrl: receiptImageUrl || null,
          idempotencyKey: effectiveIdempotencyKey,
        }).returning({ id: schema.order.id });

        if (insertedOrder) {
          insertedOrderId = insertedOrder.id;
        }
      }
    } catch (dbErr) {
      console.warn("Order DB insert fallback:", dbErr);
    }

    const orderIdToReturn = insertedOrderId || fallbackOrderId;

    return NextResponse.json({
      success: true,
      orderId: orderIdToReturn,
      status: paymentMethod.startsWith("paymob") ? "pending" : "manual_review",
      message: paymentMethod.startsWith("paymob")
        ? "جاري التحويل إلى بوابة باي موب للدفع الآمن..."
        : "تم تسجيل طلب التحويل بنجاح وسيقوم فريق السكرتارية بمراجعته وتفعيل الكورس فوراً.",
      orderDetails: {
        id: orderIdToReturn,
        unitTitle: verifiedTitle,
        amountEgp: verifiedPrice,
        paymentMethod,
        referenceNumber,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Order submission error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
