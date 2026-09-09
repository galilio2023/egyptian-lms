import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { validateEgyptianPhone } from "@/lib/utils";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
import { logSecurityEvent } from "@/lib/security/audit-logger";

export interface ManualEnrollPayload {
  studentId?: string;
  unitId?: string;
  notifyParent?: boolean;
}

export interface ResetDevicePayload {
  studentId?: string;
  studentPhone?: string;
}

export interface ToggleBanPayload {
  studentId?: string;
  studentPhone?: string;
  isBanned?: boolean;
}

export interface BanStudentPayload {
  userId: string;
  reason?: string;
}

export async function getAdminStudents(limit = 200) {
  try {
    const dbStudents = await db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        studentPhone: schema.user.phoneNumber,
        parentPhone: schema.studentProfile.parentPhoneNumber,
        parentName: schema.studentProfile.parentName,
        governorate: schema.studentProfile.governorate,
        gradeLevel: schema.studentProfile.gradeLevel,
        schoolName: schema.studentProfile.schoolName,
        xpPoints: schema.studentProfile.xpPoints,
        isBanned: schema.studentProfile.isBanned,
        createdAt: schema.user.createdAt,
      })
      .from(schema.user)
      .leftJoin(schema.studentProfile, eq(schema.user.id, schema.studentProfile.userId))
      .where(eq(schema.user.role, "student"))
      .orderBy(desc(schema.user.createdAt))
      .limit(limit);

    const studentIds = dbStudents.map((s) => s.id);
    const enrollmentsMap = new Map<string, string[]>();

    if (studentIds.length > 0) {
      try {
        const activeEnrollments = await db
          .select({
            userId: schema.enrollment.userId,
            unitTitle: schema.courseUnit.title,
          })
          .from(schema.enrollment)
          .innerJoin(schema.courseUnit, eq(schema.enrollment.unitId, schema.courseUnit.id))
          .where(
            and(
              inArray(schema.enrollment.userId, studentIds),
              eq(schema.enrollment.isActive, true)
            )
          );

        for (const enr of activeEnrollments) {
          const list = enrollmentsMap.get(enr.userId) || [];
          if (enr.unitTitle && !list.includes(enr.unitTitle)) {
            list.push(enr.unitTitle);
          }
          enrollmentsMap.set(enr.userId, list);
        }
      } catch (enrErr) {
        console.warn("Enrollments aggregation note:", enrErr);
      }
    }

    return dbStudents.map((s) => ({
      id: s.id,
      name: s.name,
      studentPhone: s.studentPhone,
      parentPhone: s.parentPhone || "010xxxxxxxx",
      parentName: s.parentName || "ولي الأمر",
      governorate: s.governorate || "cairo",
      gradeLevel: s.gradeLevel || 1,
      gradeTitle: `Grade ${s.gradeLevel || 1}`,
      schoolName: s.schoolName || "مدرسة لغات",
      xpPoints: s.xpPoints || 0,
      enrolledUnits: enrollmentsMap.get(s.id) || [],
      lastActive: "نشط مؤخراً",
      deviceLocked: Boolean(s.isBanned),
      isBanned: Boolean(s.isBanned),
    }));
  } catch (err) {
    console.warn("Students fetch DB note:", err);
    return [];
  }
}

export async function manualEnrollStudent(payload: ManualEnrollPayload) {
  const { studentId, unitId, notifyParent } = payload;

  if (!studentId || !unitId) {
    throw new Error("يجب تحديد الطالب والوحدة الدراسية المراد تفعيلها.");
  }

  const [studentRecord] = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      phone: schema.user.phoneNumber,
    })
    .from(schema.user)
    .where(eq(schema.user.id, studentId))
    .limit(1);

  if (!studentRecord) {
    throw new Error("لم يتم العثور على حساب الطالب المحدد.");
  }

  const [unitRecord] = await db
    .select({
      id: schema.courseUnit.id,
      title: schema.courseUnit.title,
      price: schema.courseUnit.price,
    })
    .from(schema.courseUnit)
    .where(eq(schema.courseUnit.id, unitId))
    .limit(1);

  if (!unitRecord) {
    throw new Error("لم يتم العثور على الوحدة الدراسية المحددة.");
  }

  await db
    .insert(schema.enrollment)
    .values({
      userId: studentId,
      unitId: unitId,
      isActive: true,
      enrolledAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [schema.enrollment.userId, schema.enrollment.unitId],
      set: { isActive: true, enrolledAt: new Date() },
    });

  let parentNotified = false;
  if (notifyParent !== false) {
    const [profile] = await db
      .select({ parentPhoneNumber: schema.studentProfile.parentPhoneNumber })
      .from(schema.studentProfile)
      .where(eq(schema.studentProfile.userId, studentId))
      .limit(1);

    const cleanParent = profile?.parentPhoneNumber ? validateEgyptianPhone(profile.parentPhoneNumber) : null;
    if (cleanParent) {
      try {
        const settings = await getPlatformSettings();
        const waRes = await sendAutomatedWhatsAppNotification({
          to: cleanParent,
          message: `🎉 *${settings.academyNameArabic} — تأكيد الاشتراك المباشر بالسنتر*\n` +
            `ولي أمر البطل / ${studentRecord.name} 🌟\n` +
            `تم بنجاح تفعيل اشتراك (${unitRecord.title}) في حساب الطالب عبر إدارة السنتر.\n` +
            `نتمنى له دوام التوفيق والنجاح والتفوق دائماً.\n` +
            `👨‍🏫 *المشرف الأكاديمي:* ${settings.teacherNameArabic}`,
        });
        parentNotified = Boolean(waRes.success);
      } catch (waErr) {
        console.warn("Manual enroll WhatsApp note:", waErr);
      }
    }
  }

  return {
    success: true,
    message: `تم تفعيل اشتراك الطالب (${studentRecord.name}) في (${unitRecord.title}) بنجاح!`,
    parentNotified,
  };
}

export async function resetDevice(
  payload: ResetDevicePayload,
  actor: { userId: string; userName: string; userRole: string }
) {
  const { studentId, studentPhone } = payload;
  let targetUserId = studentId;

  if (!targetUserId && studentPhone) {
    const [userRecord] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.phoneNumber, studentPhone))
      .limit(1);
    if (userRecord) targetUserId = userRecord.id;
  }

  if (targetUserId) {
    await db
      .delete(schema.session)
      .where(eq(schema.session.userId, targetUserId));
  }

  logSecurityEvent({
    eventType: "device_transferred",
    severity: actor.userRole === "assistant" ? "medium" : "low",
    userId: actor.userId,
    studentPhone,
    description: actor.userRole === "assistant"
      ? `قام المساعد (${actor.userName || "المساعد"}) بفك ربط جهاز الطالب (${studentPhone || studentId}) بناءً على تفويض ولي الأمر.`
      : `قام المعلم المشرف (${actor.userName}) بفك ربط جهاز الطالب (${studentPhone || studentId}).`,
    details: {
      performedByUserId: actor.userId,
      performedByRole: actor.userRole,
      performedByName: actor.userName,
      targetStudentId: studentId,
      targetStudentPhone: studentPhone,
    },
  });

  return {
    success: true,
    message: `تم فك حظر وربط الجهاز للطالب (${studentPhone || studentId}) بنجاح. يمكنه الآن تسجيل الدخول من جهازه الجديد.`,
  };
}

export async function toggleBan(payload: ToggleBanPayload) {
  const { studentId, studentPhone, isBanned } = payload;
  let targetUserId = studentId;

  if (!targetUserId && studentPhone) {
    const [userRecord] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.phoneNumber, studentPhone))
      .limit(1);
    if (userRecord) targetUserId = userRecord.id;
  }

  if (targetUserId) {
    await db
      .update(schema.studentProfile)
      .set({ isBanned: Boolean(isBanned) })
      .where(eq(schema.studentProfile.userId, targetUserId));
  }

  return {
    success: true,
    message: isBanned ? "تم حظر حساب الطالب مؤقتاً." : "تم فك حظر حساب الطالب.",
  };
}

export async function banStudent(payload: BanStudentPayload) {
  const { userId, reason } = payload;
  if (!userId) {
    throw new Error("معرف الطالب مطلوب");
  }

  await db
    .update(schema.studentProfile)
    .set({ isBanned: true })
    .where(eq(schema.studentProfile.userId, userId));

  await db
    .update(schema.session)
    .set({ expiresAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.session.userId, userId));

  logSecurityEvent({
    eventType: "user_banned",
    severity: "high",
    userId,
    description: `تم حظر الطالب من قبل الإدارة. السبب: ${reason || "مخالفة سياسة المنصة"}`,
    details: { reason },
  });

  return {
    success: true,
    message: "تم إيقاف وحظر حساب الطالب فوراً وإلغاء جميع جلسات تسجيل دخوله.",
  };
}

export async function unbanStudent(userId: string) {
  if (!userId) {
    throw new Error("معرف الطالب مطلوب");
  }

  await db
    .update(schema.studentProfile)
    .set({ isBanned: false })
    .where(eq(schema.studentProfile.userId, userId));

  return {
    success: true,
    message: "تم رفع الحظر عن حساب الطالب بنجاح.",
  };
}
