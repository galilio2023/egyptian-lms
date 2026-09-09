import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { validateEgyptianPhone } from "@/lib/utils";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
import { NotFoundError, ConflictError } from "@/server/errors";

export interface RedeemVoucherParams {
  code: string;
  currentUserId: string;
  studentPhone?: string;
  clientIp?: string;
  userAgent?: string;
  studentName?: string;
}

/**
 * Atomically redeems center voucher cards, activates student enrollment, logs security audit events,
 * and sends WhatsApp delivery to the student's guardian.
 */
export async function redeemVoucherCode(params: RedeemVoucherParams) {
  const { code, currentUserId, studentPhone, clientIp, userAgent, studentName } = params;
  const cleanCode = code.trim().toUpperCase();

  const [existingVoucher] = await db
    .select()
    .from(schema.voucherCode)
    .where(eq(schema.voucherCode.code, cleanCode))
    .limit(1);

  if (!existingVoucher) {
    await logSecurityEvent({
      eventType: "voucher_redeem_failed",
      severity: "low",
      userId: currentUserId,
      studentPhone,
      ipAddress: clientIp,
      userAgent,
      description: `محاولة إدخال كود كارت شحن غير صحيح: ${cleanCode}`,
      details: { attemptedCode: cleanCode },
    });

    throw new NotFoundError("كود كارت الشحن غير صحيح أو غير مسجل بالنظام. يرجى التأكد من كتابة الكود كما هو مطبوع على الكارت.");
  }

  // Atomic transaction: mark voucher redeemed and activate course enrollment
  const txResult = await db.transaction(async (tx) => {
    const [redeemedVoucher] = await tx
      .update(schema.voucherCode)
      .set({
        isRedeemed: true,
        redeemedByUserId: currentUserId,
        redeemedAt: new Date(),
      })
      .where(
        and(
          eq(schema.voucherCode.code, cleanCode),
          eq(schema.voucherCode.isRedeemed, false)
        )
      )
      .returning();

    if (!redeemedVoucher) {
      return { success: false, alreadyRedeemed: true, voucher: null };
    }

    await tx
      .insert(schema.enrollment)
      .values({
        userId: currentUserId,
        unitId: redeemedVoucher.unitId,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.enrollment.userId, schema.enrollment.unitId],
        set: { isActive: true, enrolledAt: new Date() },
      });

    return { success: true, alreadyRedeemed: false, voucher: redeemedVoucher };
  });

  if (txResult.alreadyRedeemed || !txResult.voucher) {
    await logSecurityEvent({
      eventType: "voucher_redeem_failed",
      severity: "low",
      userId: currentUserId,
      studentPhone,
      ipAddress: clientIp,
      userAgent,
      description: `محاولة إدخال كود كارت شحن تم تفعيله مسبقاً: ${cleanCode}`,
      details: { attemptedCode: cleanCode },
    });

    throw new ConflictError("هذا الكود تم استخدامه وتفعيله مسبقاً.");
  }

  // Log successful voucher redemption
  await logSecurityEvent({
    eventType: "voucher_redeem_success",
    severity: "low",
    userId: currentUserId,
    studentPhone,
    ipAddress: clientIp,
    userAgent,
    description: `تم شحن كارت الشحن بنجاح وتفعيل الوحدة الدراسية: ${cleanCode}`,
    details: { unitId: txResult.voucher.unitId, batchName: txResult.voucher.batchName },
  });

  // Automated WhatsApp notification to parent
  try {
    const [profile] = await db
      .select({ parentPhoneNumber: schema.studentProfile.parentPhoneNumber })
      .from(schema.studentProfile)
      .where(eq(schema.studentProfile.userId, currentUserId))
      .limit(1);

    const targetParentPhone = profile?.parentPhoneNumber || null;
    const cleanParent = targetParentPhone ? validateEgyptianPhone(targetParentPhone) : null;

    if (cleanParent) {
      const [unitRecord] = await db
        .select({ title: schema.courseUnit.title })
        .from(schema.courseUnit)
        .where(eq(schema.courseUnit.id, txResult.voucher.unitId))
        .limit(1);

      const unitTitle = unitRecord?.title || "الوحدة الدراسية";
      const settings = await getPlatformSettings();
      const resolvedStudentName = studentName || "بطل الأكاديمية";

      await sendAutomatedWhatsAppNotification({
        to: cleanParent,
        message: `🎉 *${settings.academyNameArabic} - تأكيد شحن كارت السنتر*\n` +
          `ولي أمر البطل / ${resolvedStudentName} 🌟\n` +
          `تم بنجاح شحن كارت السنتر (${txResult.voucher.batchName || "كارت الشحن"}) وتفعيل اشتراك (${unitTitle}) في حساب الطالب.\n` +
          `يمكن للطالب الآن الدخول للمنصة وحضور كافة الدروس وحل التمارين فوراً!\n` +
          `نتمنى له دوام التوفيق والنجاح والتفوق دائماً.\n` +
          `👨‍🏫 *المشرف الأكاديمي:* ${settings.teacherNameArabic}`,
      });
    }
  } catch (waErr) {
    console.warn("Voucher redeem WhatsApp dispatch note:", waErr);
  }

  return {
    success: true,
    message: "🎉 تم شحن الكود وتفعيل الوحدة الدراسية بنجاح!",
    unitId: txResult.voucher.unitId,
    batchName: txResult.voucher.batchName,
  };
}
