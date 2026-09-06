import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const COMPLETION_XP = 15;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "يجب تسجيل الدخول لحفظ تقدم الدرس." }, { status: 401 });
    }

    const { lessonId } = (await request.json()) as { lessonId?: unknown };
    const isValidLessonId =
      typeof lessonId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonId);
    if (!isValidLessonId) {
      return NextResponse.json({ error: "معرف الدرس غير صالح." }, { status: 400 });
    }

    const [lessonRecord] = await db
      .select({ id: schema.lesson.id, unitId: schema.lesson.unitId, isFreePreview: schema.lesson.isFreePreview })
      .from(schema.lesson)
      .where(eq(schema.lesson.id, lessonId))
      .limit(1);

    if (!lessonRecord) {
      return NextResponse.json({ error: "لم يتم العثور على الدرس المطلوب." }, { status: 404 });
    }

    if (!lessonRecord.isFreePreview) {
      const [activeEnrollment] = await db
        .select({ id: schema.enrollment.id })
        .from(schema.enrollment)
        .where(
          and(
            eq(schema.enrollment.userId, session.user.id),
            eq(schema.enrollment.unitId, lessonRecord.unitId),
            eq(schema.enrollment.isActive, true),
            or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, new Date()))
          )
        )
        .limit(1);

      if (!activeEnrollment) {
        return NextResponse.json({ error: "لا يوجد اشتراك نشط يتيح إكمال هذا الدرس." }, { status: 403 });
      }
    }

    const result = await db.transaction(async (tx) => {
      const [insertedProgress] = await tx
        .insert(schema.lessonProgress)
        .values({
          userId: session.user.id,
          lessonId: lessonRecord.id,
          xpAwarded: COMPLETION_XP,
        })
        .onConflictDoNothing()
        .returning({ completedAt: schema.lessonProgress.completedAt });

      if (!insertedProgress) {
        const [existingProgress] = await tx
          .select({ completedAt: schema.lessonProgress.completedAt })
          .from(schema.lessonProgress)
          .where(
            and(
              eq(schema.lessonProgress.userId, session.user.id),
              eq(schema.lessonProgress.lessonId, lessonRecord.id)
            )
          )
          .limit(1);

        const [profile] = await tx
          .select({ xpPoints: schema.studentProfile.xpPoints })
          .from(schema.studentProfile)
          .where(eq(schema.studentProfile.userId, session.user.id))
          .limit(1);

        return {
          alreadyCompleted: true,
          completedAt: existingProgress?.completedAt,
          xpAwarded: 0,
          totalXp: profile?.xpPoints ?? 0,
        };
      }

      const [updatedProfile] = await tx
        .update(schema.studentProfile)
        .set({ xpPoints: sql`${schema.studentProfile.xpPoints} + ${COMPLETION_XP}` })
        .where(eq(schema.studentProfile.userId, session.user.id))
        .returning({ xpPoints: schema.studentProfile.xpPoints });

      if (!updatedProfile) {
        throw new Error("Student profile not found for lesson completion");
      }

      return {
        alreadyCompleted: false,
        completedAt: insertedProgress.completedAt,
        xpAwarded: COMPLETION_XP,
        totalXp: updatedProfile.xpPoints,
      };
    });

    return NextResponse.json({
      success: true,
      completed: true,
      lessonId: lessonRecord.id,
      ...result,
    });
  } catch (error) {
    console.error("Lesson completion error:", error);
    return NextResponse.json({ error: "تعذر حفظ إتمام الدرس. حاول مرة أخرى." }, { status: 500 });
  }
}
