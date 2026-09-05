import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    const body = await request.json();
    const { sessionId } = body as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json({ error: "معرف الحصة مطلوب" }, { status: 400 });
    }

    const userId = session?.user?.id;
    const userRole = session?.user?.role;
    const studentName = session?.user?.name || "طالب بأكاديمية إيليت";
    const studentPhone = (session?.user as Record<string, unknown> | undefined)?.phoneNumber as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً للوصول إلى حصة البث المباشر." },
        { status: 401 }
      );
    }

    // 1. Check if session ID is a valid UUID (Issue #9 - CWE-862)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    if (!isUUID) {
      return NextResponse.json(
        { error: "معرف الحصة غير صالح." },
        { status: 400 }
      );
    }

    const [liveRecord] = await db
      .select()
      .from(schema.liveSession)
      .where(eq(schema.liveSession.id, sessionId))
      .limit(1);

    if (!liveRecord) {
      return NextResponse.json(
        { error: "لم يتم العثور على حصة البث المباشر المطلوبة." },
        { status: 404 }
      );
    }

    // 2. Enforce joinable window (Issue #10): allow 15 minutes before scheduled start through end of session
    const now = Date.now();
    const scheduledTime = new Date(liveRecord.scheduledAt).getTime();
    const durationMs = (liveRecord.durationMinutes || 60) * 60 * 1000;
    const isWithinAttendanceWindow = now >= (scheduledTime - 15 * 60 * 1000) && now <= (scheduledTime + durationMs);
    const isJoinable = liveRecord.isLiveNow || isWithinAttendanceWindow;

    if (!isJoinable) {
      return NextResponse.json(
        { error: "حصة البث المباشر لم تبدأ بعد، يرجى الانتظار حتى موعد البث المباشر لتسجيل الحضور والانضمام." },
        { status: 400 }
      );
    }

    // Authorization check (CWE-862): Student must have active enrollment in a unit of this grade
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

        return NextResponse.json(
          { error: "عذراً، هذه الحصة مخصصة لطلاب الصف المشتركين فقط 🔒" },
          { status: 403 }
        );
      }
    }

    const meetingUrl = liveRecord.meetingUrl;

    // Atomic idempotent attendance registration against unique index (sessionId, userId)
    try {
      await db
        .insert(schema.liveSessionAttendance)
        .values({
          sessionId: liveRecord.id,
          userId,
          joinedAt: new Date(),
        })
        .onConflictDoNothing();
    } catch (dbErr) {
      console.warn("Live session attendance DB note:", dbErr);
    }

    logSecurityEvent({
      eventType: "live_session_attended",
      severity: "low",
      userId,
      studentPhone,
      description: `تسجيل حضور الطالب (${studentName}) في حصة البث المباشر.`,
      details: { sessionId, joinedAt: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل حضورك في حصة المراجعة المباشرة بنجاح 🔴",
      meetingUrl,
      attendedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Live attendance error:", error);
    // CWE-209: Omit internal error.message from client response
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الحضور في حصة البث المباشر." },
      { status: 500 }
    );
  }
}
