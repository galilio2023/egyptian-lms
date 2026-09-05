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
    const studentName = session?.user?.name || "طالب بأكاديمية إيليت";
    const studentPhone = (session?.user as Record<string, unknown> | undefined)?.phoneNumber as string | undefined;

    // Check if session exists in DB
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    let meetingUrl = "https://zoom.us";

    if (isUUID) {
      try {
        const [liveRecord] = await db
          .select()
          .from(schema.liveSession)
          .where(eq(schema.liveSession.id, sessionId))
          .limit(1);

        if (liveRecord) {
          meetingUrl = liveRecord.meetingUrl;

          // Record attendance if user is logged in
          if (userId) {
            const [existing] = await db
              .select()
              .from(schema.liveSessionAttendance)
              .where(
                and(
                  eq(schema.liveSessionAttendance.sessionId, liveRecord.id),
                  eq(schema.liveSessionAttendance.userId, userId)
                )
              )
              .limit(1);

            if (!existing) {
              await db.insert(schema.liveSessionAttendance).values({
                sessionId: liveRecord.id,
                userId,
                joinedAt: new Date(),
              });
            }
          }
        }
      } catch (dbErr) {
        console.warn("Live session attendance DB note:", dbErr);
      }
    }

    logSecurityEvent({
      eventType: "device_transferred",
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
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الحضور", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
