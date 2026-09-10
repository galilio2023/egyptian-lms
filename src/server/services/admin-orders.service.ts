import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { validateEgyptianPhone } from "@/lib/utils";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
import { DomainError, ConflictError } from "@/server/errors";

export interface ApproveOrderPayload {
  orderId?: string;
  studentName?: string;
  parentPhone?: string;
  unitId?: string;
  userId?: string;
  studentPhone?: string;
}

export interface RejectOrderPayload {
  orderId?: string;
  reason?: string;
  parentPhone?: string;
}

export async function getAdminOrders(limit = 100) {
  try {
    const dbOrders = await db
      .select({
        id: schema.order.id,
        userId: schema.order.userId,
        studentName: schema.user.name,
        studentPhone: schema.user.phoneNumber,
        parentPhone: schema.studentProfile.parentPhoneNumber,
        unitId: schema.order.unitId,
        unitTitle: schema.courseUnit.title,
        amountEgp: schema.order.amountEgp,
        paymentMethod: schema.order.paymentMethod,
        status: schema.order.paymentStatus,
        referenceNumber: schema.order.referenceNumber,
        receiptImageUrl: schema.order.receiptImageUrl,
        ocrData: schema.order.ocrData,
        createdAt: schema.order.createdAt,
      })
      .from(schema.order)
      .leftJoin(schema.user, eq(schema.order.userId, schema.user.id))
      .leftJoin(schema.studentProfile, eq(schema.order.userId, schema.studentProfile.userId))
      .leftJoin(schema.courseUnit, eq(schema.order.unitId, schema.courseUnit.id))
      .orderBy(desc(schema.order.createdAt))
      .limit(limit);

    return dbOrders.map((o) => ({
      id: o.id,
      studentName: o.studentName || "طالب بأكاديمية إيليت",
      studentPhone: o.studentPhone || "010xxxxxxxx",
      parentPhone: o.parentPhone || "010xxxxxxxx",
      unitTitle: o.unitTitle || "وحدة دراسية",
      unitId: o.unitId,
      gradeTitle: "منهج إيليت",
      amountEgp: o.amountEgp,
      paymentMethod: o.paymentMethod,
      status: o.status,
      referenceNumber: o.referenceNumber || "-",
      receiptImageUrl: o.receiptImageUrl || undefined,
      ocrData: (o.ocrData as { confidenceScore: number; isSuspectedDuplicate?: boolean; duplicateOrderId?: string }) || undefined,
      createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString("ar-EG") : new Date().toLocaleString("ar-EG"),
    }));
  } catch (err) {
    console.warn("Orders fetch DB note:", err);
    return [];
  }
}

export async function approveOrder(payload: ApproveOrderPayload) {
  const { orderId, studentName, parentPhone, unitId, userId, studentPhone } = payload;

  let targetUserId = userId;
  let effectiveUnitId = unitId;

  if (orderId && typeof orderId === "string") {
    const [orderRecord] = await db
      .select({
        id: schema.order.id,
        userId: schema.order.userId,
        unitId: schema.order.unitId,
      })
      .from(schema.order)
      .where(eq(schema.order.id, orderId))
      .limit(1);

    if (orderRecord) {
      if (!targetUserId) targetUserId = orderRecord.userId;
      if (!effectiveUnitId) effectiveUnitId = orderRecord.unitId;
    }
  }

  if (!targetUserId && studentPhone) {
    const [userRecord] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.phoneNumber, studentPhone))
      .limit(1);
    if (userRecord) targetUserId = userRecord.id;
  }

  if (!targetUserId || !effectiveUnitId) {
    throw new DomainError("تعذر تحديد حساب الطالب أو الوحدة الدراسية المرتبطة بهذا الطلب.");
  }

  // Fetch unit title for customized parent notification
  let resolvedUnitTitle = "الوحدة الدراسية";
  try {
    const [unitRec] = await db
      .select({ title: schema.courseUnit.title })
      .from(schema.courseUnit)
      .where(eq(schema.courseUnit.id, effectiveUnitId))
      .limit(1);
    if (unitRec?.title) resolvedUnitTitle = unitRec.title;
  } catch {
    // Fallback
  }

  // Atomic transaction: mark order completed and activate enrollment
  await db.transaction(async (tx) => {
    if (orderId && typeof orderId === "string") {
      const updatedOrders = await tx
        .update(schema.order)
        .set({ paymentStatus: "completed", updatedAt: new Date() })
        .where(
          and(
            eq(schema.order.id, orderId),
            inArray(schema.order.paymentStatus, ["manual_review", "pending"])
          )
        )
        .returning({ id: schema.order.id });

      if (updatedOrders.length === 0) {
        throw new ConflictError("الطلب غير موجود أو تمت معالجته بالفعل مسبقاً.");
      }
    }

    await tx
      .insert(schema.enrollment)
      .values({
        userId: targetUserId,
        unitId: effectiveUnitId,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.enrollment.userId, schema.enrollment.unitId],
        set: { isActive: true, enrolledAt: new Date() },
      });
  });

  // Automated WhatsApp confirmation to parent
  let targetParentPhone = parentPhone;
  if (!targetParentPhone && targetUserId) {
    const [profile] = await db
      .select({ parentPhoneNumber: schema.studentProfile.parentPhoneNumber })
      .from(schema.studentProfile)
      .where(eq(schema.studentProfile.userId, targetUserId))
      .limit(1);
    if (profile?.parentPhoneNumber) targetParentPhone = profile.parentPhoneNumber;
  }

  let parentNotified = false;
  const cleanPhone = targetParentPhone ? validateEgyptianPhone(targetParentPhone) : null;
  if (cleanPhone) {
    try {
      const settings = await getPlatformSettings();
      const waRes = await sendAutomatedWhatsAppNotification({
        to: cleanPhone,
        message: `🎉 *${settings.academyNameArabic} - تأكيد تفعيل الاشتراك*\n` +
          `ولي أمر البطل / ${studentName || "المشترك"} 🌟\n` +
          `تم بنجاح تأكيد سداد الرسوم وتفعيل اشتراك (${resolvedUnitTitle}) في حساب الطالب.\n` +
          `يمكن للطالب الآن الدخول للمنصة والبدء في مشاهدة الحصص وحل التمارين فوراً!\n` +
          `نتمنى له دوام التوفيق والنجاح والتفوق دائماً.\n` +
          `👨‍🏫 *المشرف الأكاديمي:* ${settings.teacherNameArabic}`,
      });
      parentNotified = Boolean(waRes.success);
    } catch (e) {
      console.warn("Approve order WhatsApp dispatch note:", e);
    }
  }

  return {
    success: true,
    parentNotified,
    message: parentNotified
      ? `تم تفعيل اشتراك الطالب (${studentName || "المشترك"}) بنجاح وإشعار ولي الأمر عبر واتساب.`
      : `تم تفعيل اشتراك الطالب (${studentName || "المشترك"}) بنجاح في قاعدة البيانات وتحديث حالة الطلب إلى مكتمل.`,
  };
}

export async function rejectOrder(payload: RejectOrderPayload) {
  const { orderId, reason, parentPhone } = payload;

  if (!orderId || typeof orderId !== "string") {
    throw new DomainError("معرف الطلب مطلوب.");
  }

  const updatedOrders = await db
    .update(schema.order)
    .set({ 
      paymentStatus: "failed", 
      reviewerNotes: reason || "إيصال غير واضح أو غير مطابق",
      updatedAt: new Date() 
    })
    .where(
      and(
        eq(schema.order.id, orderId),
        inArray(schema.order.paymentStatus, ["manual_review", "pending"])
      )
    )
    .returning({ id: schema.order.id });

  if (updatedOrders.length === 0) {
    throw new ConflictError("الطلب غير موجود أو تمت معالجته بالفعل مسبقاً.");
  }

  let targetParentPhone = parentPhone;
  if (!targetParentPhone) {
    const [orderRecord] = await db
      .select({ userId: schema.order.userId })
      .from(schema.order)
      .where(eq(schema.order.id, orderId))
      .limit(1);
    if (orderRecord?.userId) {
      const [profile] = await db
        .select({ parentPhoneNumber: schema.studentProfile.parentPhoneNumber })
        .from(schema.studentProfile)
        .where(eq(schema.studentProfile.userId, orderRecord.userId))
        .limit(1);
      if (profile?.parentPhoneNumber) targetParentPhone = profile.parentPhoneNumber;
    }
  }

  let parentNotified = false;
  const cleanPhone = targetParentPhone ? validateEgyptianPhone(targetParentPhone) : null;
  if (cleanPhone) {
    try {
      const settings = await getPlatformSettings();
      const waRes = await sendAutomatedWhatsAppNotification({
        to: cleanPhone,
        message: `⚠️ *${settings.academyNameArabic} - تنبيه بخصوص طلب الاشتراك*\n` +
          `نحيطكم علماً بأنه تعذر قبول إيصال التحويل للسبب التالي:\n` +
          `"${reason || "إيصال غير واضح أو المبلغ غير مطابق"}"\n` +
          `يرجى التأكد من بيانات التحويل وإعادة إرسال الإيصال الصحيح عبر المنصة أو التواصل مع الدعم الفني.`,
      });
      parentNotified = Boolean(waRes.success);
    } catch (e) {
      console.warn("Reject order WhatsApp dispatch note:", e);
    }
  }

  return {
    success: true,
    parentNotified,
    message: parentNotified
      ? `تم رفض الطلب وتحديث الحالة وإرسال التنبيه لولي الأمر عبر واتساب بنجاح.`
      : `تم رفض الطلب بنجاح وتحديث الحالة.`,
  };
}
