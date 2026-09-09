import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security/audit-logger";

export interface AttendLiveSessionParams {
  sessionId: string;
  userId: string;
  userRole?: string;
  studentName?: string;
  studentPhone?: string;
}

/**
 * Handles student attendance in live revision sessions, verifies active grade enrollments,
 * and atomically awards +50 XP bonus on first attendance.
 */
export async function attendLiveSession(params: AttendLiveSessionParams) {
  const { sessionId, userId, userRole, studentName = "طالب بالأكاديمية", studentPhone } = params;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
  if (!isUUID) {
    throw new Error("معرف الحصة غير صالح.");
  }

  const [liveRecord] = await db
    .select()
    .from(schema.liveSession)
    .where(eq(schema.liveSession.id, sessionId))
    .limit(1);

  if (!liveRecord) {
    throw new Error("لم يتم العثور على حصة البث المباشر المطلوبة.");
  }

  // Enforce attendance window: 15 minutes prior to scheduled start until scheduled duration end
  const now = Date.now();
  const scheduledTime = new Date(liveRecord.scheduledAt).getTime();
  const durationMs = (liveRecord.durationMinutes || 60) * 60 * 1000;
  const isWithinAttendanceWindow = now >= (scheduledTime - 15 * 60 * 1000) && now <= (scheduledTime + durationMs);
  const isJoinable = liveRecord.isLiveNow || isWithinAttendanceWindow;

  if (!isJoinable) {
    throw new Error("حصة البث المباشر لم تبدأ بعد، يرجى الانتظار حتى موعد البث المباشر لتسجيل الحضور والانضمام.");
  }

  // Authorization check: Student must have active enrollment in a unit of this grade
  if (userRole !== "admin" && userRole !== "teacher" && userRole !== "assistant") {
    const [activeEnrollment] = await db
      .select({ id: schema.enrollment.id })
      .from(schema.enrollment)
      .innerJoin(schema.courseUnit, eq(schema.enrollment.unitId, schema.courseUnit.id))
      .where(
        and(
          eq(schema.enrollment.userId, userId),
          eq(schema.courseUnit.gradeId, liveRecord.gradeId),
          eq(schema.enrollment.isActive, true)
        )
      )
      .limit(1);

    if (!activeEnrollment) {
      logSecurityEvent({
        eventType: "unauthorized_portal_access",
        severity: "medium",
        userId,
        studentPhone,
        description: `محاولة غير مصرح بها لحضور حصة البث المباشر (${liveRecord.title}) دون اشتراك نشط بالصف.`,
        details: { sessionId: liveRecord.id, gradeId: liveRecord.gradeId },
      });

      throw new Error("عذراً، هذه الحصة مخصصة لطلاب الصف المشتركين فقط 🔒");
    }
  }

  const meetingUrl = liveRecord.meetingUrl;

  // Atomic idempotent attendance registration
  let awardedXp = 0;
  try {
    await db.transaction(async (tx) => {
      const insertResult = await tx
        .insert(schema.liveSessionAttendance)
        .values({
          sessionId: liveRecord.id,
          userId,
          joinedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning({ id: schema.liveSessionAttendance.id });

      if (insertResult && insertResult.length > 0) {
        awardedXp = 50;
        await tx
          .update(schema.studentProfile)
          .set({
            xpPoints: sql`COALESCE(${schema.studentProfile.xpPoints}, 0) + ${awardedXp}`,
          })
          .where(eq(schema.studentProfile.userId, userId));
      }
    });
  } catch (dbErr) {
    console.warn("Live session attendance DB note:", dbErr);
  }

  logSecurityEvent({
    eventType: "live_session_attended",
    severity: "low",
    userId,
    studentPhone,
    description: `تسجيل حضور الطالب (${studentName}) في حصة البث المباشر مع مكافأة (${awardedXp} XP).`,
    details: { sessionId, joinedAt: new Date().toISOString(), awardedXp },
  });

  return {
    success: true,
    message: awardedXp > 0
      ? `تم تسجيل حضورك في حصة المراجعة المباشرة بنجاح وحصلت على +${awardedXp} XP 🔴🌟`
      : "تم تسجيل حضورك في حصة المراجعة المباشرة بنجاح 🔴",
    earnedXp: awardedXp,
    meetingUrl,
    attendedAt: new Date().toISOString(),
  };
}
