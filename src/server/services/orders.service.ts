import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt, sql } from "drizzle-orm";
import { validateEgyptianPhone } from "@/lib/utils";
import { INITIAL_UNITS } from "@/lib/db/mock-data";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { initiatePaymobPayment } from "@/lib/api/paymob";
import {
  normalizeReceiptReference,
  verifyEgyptianPaymentReceipt,
} from "@/lib/ai/receipt-verifier";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
import { DomainError, NotFoundError, ConflictError, UnauthorizedError } from "@/server/errors";
import crypto from "crypto";

export interface SubmitOrderPayload {
  unitId: string;
  paymentMethod: string;
  referenceNumber?: string;
  receiptImageUrl?: string;
  studentPhone?: string;
  idempotencyKey?: string;
  couponCode?: string;
}

export interface SubmitOrderResult {
  success: boolean;
  orderId?: string;
  paymobCheckoutUrl?: string;
  status: string;
  isAutoApproved?: boolean;
  isIdempotentReplay?: boolean;
  message: string;
  orderDetails: {
    id: string;
    unitTitle: string;
    amountEgp: number;
    paymentMethod: string;
    referenceNumber?: string;
    createdAt: string;
  };
}

/**
 * Handles course order placement, server-side price calculation, idempotency protection,
 * duplicate receipt fraud detection, AI receipt verification, and gateway/manual fulfillment.
 */
export async function processOrderSubmission(params: {
  payload: SubmitOrderPayload;
  sessionUserId: string | null;
  sessionUserName?: string | null;
  sessionUserEmail?: string | null;
  clientIp: string;
  headerIdempotencyKey?: string | null;
}): Promise<SubmitOrderResult> {
  const { payload, sessionUserId, sessionUserName, sessionUserEmail, clientIp, headerIdempotencyKey } = params;
  const {
    unitId,
    paymentMethod,
    referenceNumber,
    receiptImageUrl,
    studentPhone,
    idempotencyKey: clientProvidedKey,
    couponCode,
  } = payload;

  const validMethods = schema.paymentMethodEnum.enumValues;
  if (!validMethods.includes(paymentMethod as (typeof schema.paymentMethodEnum.enumValues)[number])) {
    throw new Error("طريقة الدفع المختارة غير صالحة.");
  }

  // Resolve user ID
  let userId = sessionUserId;
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

  // Server-side Price Verification (Prevents Price Tampering)
  let verifiedPrice = 250;
  let verifiedTitle = "الوحدة الدراسية";
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unitId);

  if (isUUID) {
    const [dbUnit] = await db
      .select({
        id: schema.courseUnit.id,
        title: schema.courseUnit.title,
        price: schema.courseUnit.price,
      })
      .from(schema.courseUnit)
      .where(eq(schema.courseUnit.id, unitId))
      .limit(1);

    if (!dbUnit) {
      throw new NotFoundError("الوحدة الدراسية المطلوبة غير موجودة في قاعدة البيانات.");
    }

    verifiedPrice = dbUnit.price ?? 250;
    verifiedTitle = dbUnit.title;

    // Check if student already has active enrollment
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
        throw new ConflictError("أنت مشترك ومفعّل بالفعل في هذه الوحدة الدراسية حالياً.");
      }
    }
  } else {
    const mockU = INITIAL_UNITS.find((u) => u.id === unitId || u.slug === unitId);
    if (!mockU) {
      throw new NotFoundError("الوحدة الدراسية المطلوبة غير موجودة.");
    }
    verifiedPrice = mockU.priceEgp || 250;
    verifiedTitle = mockU.title;
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
  const cleanRef = normalizeReceiptReference(referenceNumber);
  const effectiveIdempotencyKey = (
    headerIdempotencyKey ||
    clientProvidedKey ||
    (userId && cleanRef ? `idemp-${crypto.createHash("sha256").update(`${userId}:${unitId}:${cleanRef}`).digest("hex").slice(0, 32)}` : null)
  );

  // 1. Idempotency Check: Return existing order if identical request is replayed
  if (effectiveIdempotencyKey && isUUID) {
    if (!userId) {
      throw new UnauthorizedError("يجب تسجيل الدخول لإتمام الطلب والتحقق من عدم التكرار.");
    }

    const [existingOrder] = await db
      .select()
      .from(schema.order)
      .where(eq(schema.order.idempotencyKey, effectiveIdempotencyKey))
      .limit(1);

    if (existingOrder) {
      if (existingOrder.userId !== userId) {
        throw new ConflictError("مفتاح العملية مستخدم بالفعل لحساب آخر.");
      }

      return {
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
          referenceNumber: existingOrder.referenceNumber || undefined,
          createdAt: existingOrder.createdAt.toISOString(),
        },
      };
    }
  }

  // 2. Duplicate Reference Number Fraud Prevention
  if (cleanRef && isUUID) {
    const [duplicateRef] = await db
      .select({ id: schema.order.id })
      .from(schema.order)
      .where(sql`upper(regexp_replace(coalesce(${schema.order.referenceNumber}, ''), '\\s+', '', 'g')) = ${cleanRef}`)
      .limit(1);

    if (duplicateRef) {
      await logSecurityEvent({
        eventType: "rate_limit_triggered",
        severity: "high",
        userId,
        studentPhone: cleanStd,
        ipAddress: clientIp,
        description: `محاولة استخدام رقم مرجعي للتحويل مستخدم من حساب طالب آخر: ${cleanRef}`,
        details: { referenceNumber: cleanRef, conflictingOrderId: duplicateRef.id },
      });

      throw new ConflictError("هذا الرقم المرجعي للتحويل تم تسجيله واستخدامه مسبقاً لحساب آخر. يرجى التأكد من رقم إيصالك.");
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
        throw new Error(verification.summaryArabic);
      }

      if (verification.autoApprovalEligible) {
        receiptAutoApprovalEligible = true;
        autoApprovalMessage = verification.summaryArabic;
      }
    }
  }

  // Database insertion & automatic fulfillment
  let enrollmentActivated = false;
  const shouldAutoFulfill = Boolean(
    receiptAutoApprovalEligible &&
    sessionUserId &&
    sessionUserId === userId &&
    isUUID
  );

  if (!userId || !isUUID) {
    throw new DomainError("بيانات الطلب غير مكتملة أو المستخدم غير مسجل لحفظ الطلب في قاعدة البيانات.");
  }

  const initialStatus: (typeof schema.paymentStatusEnum.enumValues)[number] = paymentMethod.startsWith("paymob")
    ? "pending"
    : shouldAutoFulfill
    ? "completed"
    : "manual_review";

  const persistedReferenceNumber = persistedReference || `REF-${Date.now()}`;

  const orderValues = {
    userId: userId,
    unitId: unitId,
    amountEgp: verifiedPrice,
    paymentMethod: paymentMethod as (typeof schema.paymentMethodEnum.enumValues)[number],
    paymentStatus: initialStatus,
    referenceNumber: persistedReferenceNumber,
    receiptImageUrl: receiptImageUrl || null,
    receiptHash: computedReceiptHash,
    ocrData: ocrScanData,
    idempotencyKey: effectiveIdempotencyKey,
  };

  if (shouldAutoFulfill) {
    const transactionResult = await db.transaction(async (tx) => {
      const [insertedOrder] = await tx
        .insert(schema.order)
        .values(orderValues)
        .returning({ id: schema.order.id });
      const [activatedEnrollment] = await tx
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

      if (!insertedOrder?.id || !activatedEnrollment?.id) {
        throw new DomainError("فشلت عملية تفعيل الاشتراك وحفظ الطلب. يرجى إعادة المحاولة.");
      }

      return {
        orderId: insertedOrder.id,
        enrollmentId: activatedEnrollment.id,
      };
    });
    insertedOrderId = transactionResult.orderId;
    enrollmentActivated = Boolean(transactionResult.enrollmentId);
  } else {
    const [insertedOrder] = await db
      .insert(schema.order)
      .values(orderValues)
      .returning({ id: schema.order.id });
    insertedOrderId = insertedOrder?.id || null;
  }

  if (!insertedOrderId || (shouldAutoFulfill && !enrollmentActivated)) {
    throw new DomainError("تعذر تسجيل الطلب وتفعيل الاشتراك. يرجى المحاولة مرة أخرى.");
  }

  if (paymentMethod.startsWith("paymob") && !insertedOrderId) {
    throw new DomainError("تعذر بدء عملية الدفع عبر باي موب لعدم حفظ الطلب في قاعدة البيانات. يرجى تسجيل الدخول وإعادة المحاولة.");
  }

  const orderIdToReturn = insertedOrderId;
  const isAutoApproved = Boolean(
    shouldAutoFulfill && insertedOrderId && enrollmentActivated
  );
  let paymobCheckoutUrl: string | undefined;

  // Trigger Paymob session if selected
  if (paymentMethod.startsWith("paymob") && insertedOrderId) {
    try {
      const paymobResult = await initiatePaymobPayment({
        orderId: insertedOrderId,
        amountEgp: verifiedPrice,
        unitTitle: verifiedTitle,
        studentName: sessionUserName || undefined,
        studentPhone: cleanStd || undefined,
        studentEmail: sessionUserEmail || undefined,
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
        const studentName = sessionUserName || "البطل";
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

  return {
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
      referenceNumber: orderValues.referenceNumber,
      createdAt: new Date().toISOString(),
    },
  };
}
