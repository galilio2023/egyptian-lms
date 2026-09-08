import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt, sql } from "drizzle-orm";
import { validateEgyptianPhone } from "@/lib/utils";
import { INITIAL_UNITS } from "@/lib/db/mock-data";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { initiatePaymobPayment } from "@/lib/api/paymob";
import {
  normalizeReceiptReference,
  verifyEgyptianPaymentReceipt,
} from "@/lib/ai/receipt-verifier";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
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
      couponCode,
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

    // Server-Side Promo Coupon Verification & Discount Calculation
    if (couponCode && typeof couponCode === "string") {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const PROMO_DISCOUNTS: Record<string, { percent?: number; fixedEgp?: number }> = {
        WELCOME20: { percent: 20 },
        SUPER50: { fixedEgp: 50 },
        ELITE100: { fixedEgp: 100 },
        OCTOBER26: { percent: 25 },
      };

      const promo = PROMO_DISCOUNTS[cleanCoupon];
      if (promo) {
        if (promo.percent) {
          const discount = Math.round((verifiedPrice * promo.percent) / 100);
          verifiedPrice = Math.max(0, verifiedPrice - discount);
        } else if (promo.fixedEgp) {
          verifiedPrice = Math.max(0, verifiedPrice - promo.fixedEgp);
        }
      }
    }

    // Financial Idempotency Key Computation
    // Standard RFC header "Idempotency-Key" or deterministic hash
    const headerKey = reqHeaders.get("idempotency-key");
    const cleanRef = normalizeReceiptReference(referenceNumber);
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

    // 2. Duplicate Reference Number Fraud Prevention
    if (cleanRef && isUUID) {
      try {
        const [duplicateRef] = await db
          .select({ id: schema.order.id })
          .from(schema.order)
          .where(sql`upper(regexp_replace(coalesce(${schema.order.referenceNumber}, ''), '\\s+', '', 'g')) = ${cleanRef}`)
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
        console.error("Duplicate reference lookup failed:", refCheckErr);
        return NextResponse.json(
          { error: "تعذر التحقق من الرقم المرجعي حالياً. يرجى المحاولة مرة أخرى." },
          { status: 503 }
        );
      }
    }

    let insertedOrderId: string | null = null;
    const fallbackOrderId = `ord-${Date.now().toString().slice(-6)}`;

    // Intelligent AI & OCR Receipt Verification for manual transfers
    let computedReceiptHash: string | null = null;
    let ocrScanData: Record<string, unknown> | null = null;
    let receiptAutoApprovalEligible = false;
    let autoApprovalMessage = "";
    let persistedReference = cleanRef;

    if (paymentMethod.includes("manual")) {
      const receiptPayload = receiptImageUrl || cleanRef || "";
      if (receiptPayload) {
        const verification = await verifyEgyptianPaymentReceipt({
          receiptImageOrText: receiptPayload,
          expectedAmountEgp: verifiedPrice,
          findExistingReceipt: async (hashOrReference) => {
            const [existingOrder] = await db
              .select({ id: schema.order.id })
              .from(schema.order)
              .where(
                or(
                  eq(schema.order.receiptHash, hashOrReference),
                  sql`upper(regexp_replace(coalesce(${schema.order.referenceNumber}, ''), '\\s+', '', 'g')) = ${hashOrReference}`
                )
              )
              .limit(1);
            return existingOrder?.id;
          },
        });

        computedReceiptHash = verification.receiptHash;
        ocrScanData = verification as unknown as Record<string, unknown>;
        persistedReference = verification.extractedReference || cleanRef;

        if (verification.isDuplicate) {
          return NextResponse.json(
            { error: verification.summaryArabic },
            { status: 400 }
          );
        }

        if (verification.autoApprovalEligible) {
          receiptAutoApprovalEligible = true;
          autoApprovalMessage = verification.summaryArabic;
        }
      }
    }

    // Try database insertion
    let enrollmentActivated = false;
    const shouldAutoFulfill = Boolean(
      receiptAutoApprovalEligible &&
      session?.user?.id &&
      session.user.id === userId &&
      isUUID
    );
    try {
      if (userId && isUUID) {
        const initialStatus = paymentMethod.startsWith("paymob")
          ? "pending"
          : shouldAutoFulfill
          ? "completed"
          : "manual_review";

        const orderInsert = db.insert(schema.order).values({
          userId: userId,
          unitId: unitId,
          amountEgp: verifiedPrice, // Always server verified!
          paymentMethod: paymentMethod as (typeof schema.paymentMethodEnum.enumValues)[number],
          paymentStatus: initialStatus,
          referenceNumber: persistedReference || `REF-${Date.now()}`,
          receiptImageUrl: receiptImageUrl || null,
          receiptHash: computedReceiptHash,
          ocrData: ocrScanData,
          idempotencyKey: effectiveIdempotencyKey,
        }).returning({ id: schema.order.id });

        if (shouldAutoFulfill) {
          const enrollmentInsert = db
            .insert(schema.enrollment)
            .values({
              userId,
              unitId,
              isActive: true,
              enrolledAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [schema.enrollment.userId, schema.enrollment.unitId],
              set: { isActive: true, enrolledAt: new Date() },
            })
            .returning({ id: schema.enrollment.id });
          const [insertedOrders, activatedEnrollments] = await db.batch([
            orderInsert,
            enrollmentInsert,
          ]);
          insertedOrderId = insertedOrders[0]?.id || null;
          enrollmentActivated = Boolean(activatedEnrollments[0]?.id);
        } else {
          const [insertedOrder] = await orderInsert;
          insertedOrderId = insertedOrder?.id || null;
        }

        if (!insertedOrderId || (shouldAutoFulfill && !enrollmentActivated)) {
          return NextResponse.json(
            { error: "تعذر تسجيل الطلب وتفعيل الاشتراك. يرجى المحاولة مرة أخرى." },
            { status: 500 }
          );
        }
      }
    } catch (dbErr) {
      console.error("Order DB insert error:", dbErr);
      if (userId && isUUID) {
        return NextResponse.json(
          { error: "حدث خطأ أثناء حفظ الطلب في قاعدة البيانات. يرجى التحقق من صحة البيانات أو مراجعة الدعم." },
          { status: 500 }
        );
      }
    }

    // Paymob checkout requires a valid persisted database order
    if (paymentMethod.startsWith("paymob") && !insertedOrderId) {
      return NextResponse.json(
        { error: "تعذر بدء عملية الدفع عبر باي موب لعدم حفظ الطلب في قاعدة البيانات. يرجى تسجيل الدخول وإعادة المحاولة." },
        { status: 400 }
      );
    }

    const orderIdToReturn = insertedOrderId || fallbackOrderId;
    const isAutoApproved = Boolean(
      shouldAutoFulfill && insertedOrderId && enrollmentActivated
    );
    let paymobCheckoutUrl: string | undefined;

    // Trigger outbound Paymob session if selected payment method is Paymob
    if (paymentMethod.startsWith("paymob") && insertedOrderId) {
      try {
        const paymobResult = await initiatePaymobPayment({
          orderId: insertedOrderId,
          amountEgp: verifiedPrice,
          unitTitle: verifiedTitle,
          studentName: session?.user?.name || undefined,
          studentPhone: cleanStd || undefined,
          studentEmail: session?.user?.email || undefined,
          paymentMethod: paymentMethod as "paymob_wallet" | "paymob_card",
        });

        if (paymobResult.checkoutUrl) {
          paymobCheckoutUrl = paymobResult.checkoutUrl;
        }

        if (paymobResult.gatewayOrderId && insertedOrderId) {
          await db
            .update(schema.order)
            .set({ gatewayOrderId: paymobResult.gatewayOrderId })
            .where(eq(schema.order.id, insertedOrderId));
        }
      } catch (paymobErr) {
        console.warn("Paymob initiation note:", paymobErr);
      }
    }

    // Automated WhatsApp confirmation to parent upon AI Auto-Approval
    if (isAutoApproved && userId) {
      try {
        const [profile] = await db
          .select({ parentPhoneNumber: schema.studentProfile.parentPhoneNumber })
          .from(schema.studentProfile)
          .where(eq(schema.studentProfile.userId, userId))
          .limit(1);

        const cleanParentPhone = profile?.parentPhoneNumber ? validateEgyptianPhone(profile.parentPhoneNumber) : null;
        if (cleanParentPhone) {
          const settings = await getPlatformSettings();
          const studentName = session?.user?.name || "البطل";
          await sendAutomatedWhatsAppNotification({
            to: cleanParentPhone,
            message: `🎉 *${settings.academyNameArabic} - تم قبول إيصال التحويل بالذكاء الاصطناعي*\n` +
              `ولي أمر البطل / ${studentName} 🌟\n` +
              `تم بنجاح التحقق الذكي من إيصال التحويل (${persistedReference || "إيصال التحويل"}) وتفعيل اشتراك (${verifiedTitle}) في حساب الطالب فوراً!\n` +
              `يمكن للطالب الآن الدخول للمنصة ومتابعة الحصص فوراً دون انتظار.\n` +
              `نتمنى له دوام التوفيق والنجاح والتفوق دائماً.\n` +
              `👨‍🏫 *المشرف الأكاديمي:* ${settings.teacherNameArabic}`,
          });
        }
      } catch (waErr) {
        console.warn("Auto-approval WhatsApp dispatch note:", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderIdToReturn,
      paymobCheckoutUrl,
      status: paymentMethod.startsWith("paymob")
        ? "pending"
        : isAutoApproved
        ? "completed"
        : "manual_review",
      isAutoApproved,
      message: paymentMethod.startsWith("paymob")
        ? "جاري التحويل إلى بوابة باي موب للدفع الآمن..."
        : isAutoApproved
        ? `🎉 تم التحقق الذكي من إيصال التحويل بالذكاء الاصطناعي (${autoApprovalMessage}) وتفعيل الكورس للطالب فوراً!`
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
