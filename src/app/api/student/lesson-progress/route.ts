import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const COMPLETION_XP = 15;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getCurrentXp(userId: string) {
  const [profile] = await db
    .select({ xpPoints: schema.studentProfile.xpPoints })
    .from(schema.studentProfile)
    .where(eq(schema.studentProfile.userId, userId))
    .limit(1);
  return profile?.xpPoints ?? 0;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "يجب تسجيل الدخول لحفظ تقدم الدرس." }, { status: 401 });
    }

    const body = (await request.json()) as {
      lessonId?: unknown;
      checkpointId?: unknown;
      rewardXp?: unknown;
    };
    if (typeof body.lessonId !== "string" || !UUID_PATTERN.test(body.lessonId)) {
      return NextResponse.json({ error: "معرف الدرس غير صالح." }, { status: 400 });
    }
    if (
      body.checkpointId !== undefined &&
      (typeof body.checkpointId !== "string" || !body.checkpointId.trim() || body.checkpointId.length > 200)
    ) {
      return NextResponse.json({ error: "معرف نقطة التحقق غير صالح." }, { status: 400 });
    }

    const [lessonRecord] = await db
      .select({
        id: schema.lesson.id,
        unitId: schema.lesson.unitId,
        isFreePreview: schema.lesson.isFreePreview,
        checkpoints: schema.lesson.checkpoints,
      })
      .from(schema.lesson)
      .where(eq(schema.lesson.id, body.lessonId))
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

    if (typeof body.checkpointId === "string") {
      const checkpoint = lessonRecord.checkpoints?.find(
        (candidate) => candidate.id === body.checkpointId
      );
      if (!checkpoint) {
        return NextResponse.json({ error: "نقطة التحقق غير موجودة في هذا الدرس." }, { status: 404 });
      }

      const configuredRewardXp = checkpoint.rewardXp ?? 10;
      if (!Number.isInteger(configuredRewardXp) || configuredRewardXp < 0 || configuredRewardXp > 100) {
        throw new Error("Checkpoint has an invalid configured XP reward");
      }
      if (body.rewardXp !== configuredRewardXp) {
        return NextResponse.json({ error: "قيمة مكافأة نقطة التحقق غير صالحة." }, { status: 400 });
      }

      const result = await db.execute<{ totalXp: number; xpAwarded: number }>(sql`
        with inserted_checkpoint as (
          insert into "lesson_checkpoint_progress" ("user_id", "lesson_id", "checkpoint_id", "xp_awarded")
          select ${session.user.id}, ${lessonRecord.id}, ${checkpoint.id}, ${configuredRewardXp}
          from "student_profile"
          where "user_id" = ${session.user.id}
          on conflict ("user_id", "lesson_id", "checkpoint_id") do nothing
          returning "xp_awarded"
        )
        update "student_profile"
        set "xp_points" = "student_profile"."xp_points" + inserted_checkpoint.xp_awarded
        from inserted_checkpoint
        where "student_profile"."user_id" = ${session.user.id}
        returning "student_profile"."xp_points" as "totalXp", inserted_checkpoint.xp_awarded as "xpAwarded"
      `);
      const awarded = result.rows[0];
      if (!awarded) {
        const [existingCheckpoint] = await db
          .select({ id: schema.lessonCheckpointProgress.id })
          .from(schema.lessonCheckpointProgress)
          .where(
            and(
              eq(schema.lessonCheckpointProgress.userId, session.user.id),
              eq(schema.lessonCheckpointProgress.lessonId, lessonRecord.id),
              eq(schema.lessonCheckpointProgress.checkpointId, checkpoint.id)
            )
          )
          .limit(1);
        if (!existingCheckpoint) {
          throw new Error("Student profile not found for checkpoint completion");
        }
      }

      return NextResponse.json({
        success: true,
        checkpointCompleted: true,
        checkpointId: checkpoint.id,
        alreadyCompleted: !awarded,
        xpAwarded: awarded?.xpAwarded ?? 0,
        totalXp: awarded?.totalXp ?? (await getCurrentXp(session.user.id)),
      });
    }

    const result = await db.execute<{ totalXp: number; xpAwarded: number; completedAt: Date }>(sql`
      with inserted_progress as (
        insert into "lesson_progress" ("user_id", "lesson_id", "xp_awarded")
        select ${session.user.id}, ${lessonRecord.id}, ${COMPLETION_XP}
        from "student_profile"
        where "user_id" = ${session.user.id}
        on conflict ("user_id", "lesson_id") do nothing
        returning "xp_awarded", "completed_at"
      )
      update "student_profile"
      set "xp_points" = "student_profile"."xp_points" + inserted_progress.xp_awarded
      from inserted_progress
      where "student_profile"."user_id" = ${session.user.id}
      returning
        "student_profile"."xp_points" as "totalXp",
        inserted_progress.xp_awarded as "xpAwarded",
        inserted_progress.completed_at as "completedAt"
    `);
    const awarded = result.rows[0];

    if (!awarded) {
      const [existingProgress] = await db
        .select({ completedAt: schema.lessonProgress.completedAt })
        .from(schema.lessonProgress)
        .where(
          and(
            eq(schema.lessonProgress.userId, session.user.id),
            eq(schema.lessonProgress.lessonId, lessonRecord.id)
          )
        )
        .limit(1);

      if (!existingProgress) {
        throw new Error("Student profile not found for lesson completion");
      }

      return NextResponse.json({
        success: true,
        completed: true,
        lessonId: lessonRecord.id,
        alreadyCompleted: true,
        completedAt: existingProgress.completedAt,
        xpAwarded: 0,
        totalXp: await getCurrentXp(session.user.id),
      });
    }

    return NextResponse.json({
      success: true,
      completed: true,
      lessonId: lessonRecord.id,
      alreadyCompleted: false,
      completedAt: awarded.completedAt,
      xpAwarded: awarded.xpAwarded,
      totalXp: awarded.totalXp,
    });
  } catch (error) {
    console.error("Lesson progress error:", error);
    return NextResponse.json({ error: "تعذر حفظ تقدم الدرس. حاول مرة أخرى." }, { status: 500 });
  }
}
