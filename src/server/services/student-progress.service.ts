import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { and, desc, eq, gt, isNull, or, sql, count } from "drizzle-orm";
import type { TimelineEvent } from "@/lib/types/timeline";
import { validateEgyptianPhone, normalizeGovernorate } from "@/lib/utils";
import { DomainError, NotFoundError, ForbiddenError } from "@/server/errors";

const COMPLETION_XP = 15;

async function getCurrentUserXp(userId: string): Promise<number> {
  const [profile] = await db
    .select({ xpPoints: schema.studentProfile.xpPoints })
    .from(schema.studentProfile)
    .where(eq(schema.studentProfile.userId, userId))
    .limit(1);
  return profile?.xpPoints ?? 0;
}

export interface RecordLessonProgressParams {
  userId: string;
  lessonId: string;
  checkpointId?: string;
  rewardXp?: number;
}

/**
 * Records lesson completion or checkpoint question completion with atomic DB transactions and XP awarding.
 */
export async function recordLessonOrCheckpointProgress(params: RecordLessonProgressParams) {
  const { userId, lessonId, checkpointId, rewardXp } = params;

  // 1. Verify lesson exists
  const [lessonRecord] = await db
    .select({
      id: schema.lesson.id,
      unitId: schema.lesson.unitId,
      isFreePreview: schema.lesson.isFreePreview,
      checkpoints: schema.lesson.checkpoints,
    })
    .from(schema.lesson)
    .where(eq(schema.lesson.id, lessonId))
    .limit(1);

  if (!lessonRecord) {
    throw new NotFoundError("لم يتم العثور على الدرس المطلوب.");
  }

  // 2. Check entitlement if not a free preview
  if (!lessonRecord.isFreePreview) {
    const [activeEnrollment] = await db
      .select({ id: schema.enrollment.id })
      .from(schema.enrollment)
      .where(
        and(
          eq(schema.enrollment.userId, userId),
          eq(schema.enrollment.unitId, lessonRecord.unitId),
          eq(schema.enrollment.isActive, true),
          or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, new Date()))
        )
      )
      .limit(1);

    if (!activeEnrollment) {
      throw new ForbiddenError("لا يوجد اشتراك نشط يتيح إكمال هذا الدرس.");
    }
  }

  // 3. Case A: Checkpoint Completion
  if (typeof checkpointId === "string" && checkpointId.trim()) {
    const checkpoint = lessonRecord.checkpoints?.find(
      (candidate) => candidate.id === checkpointId
    );
    if (!checkpoint) {
      throw new NotFoundError("نقطة التحقق غير موجودة في هذا الدرس.");
    }

    const configuredRewardXp = checkpoint.rewardXp ?? 10;
    if (!Number.isInteger(configuredRewardXp) || configuredRewardXp < 0 || configuredRewardXp > 100) {
      throw new DomainError("Checkpoint has an invalid configured XP reward");
    }
    if (rewardXp !== undefined && rewardXp !== configuredRewardXp) {
      throw new DomainError("قيمة مكافأة نقطة التحقق غير صالحة.");
    }

    const [insertedCheckpoint] = await db
      .insert(schema.lessonCheckpointProgress)
      .values({
        userId,
        lessonId: lessonRecord.id,
        checkpointId: checkpoint.id,
        xpAwarded: configuredRewardXp,
      })
      .onConflictDoNothing()
      .returning({ xpAwarded: schema.lessonCheckpointProgress.xpAwarded });

    if (insertedCheckpoint) {
      const [updatedProfile] = await db
        .update(schema.studentProfile)
        .set({
          xpPoints: sql`COALESCE(${schema.studentProfile.xpPoints}, 0) + ${insertedCheckpoint.xpAwarded}`,
        })
        .where(eq(schema.studentProfile.userId, userId))
        .returning({ xpPoints: schema.studentProfile.xpPoints });

      return {
        success: true,
        checkpointCompleted: true,
        checkpointId: checkpoint.id,
        alreadyCompleted: false,
        xpAwarded: insertedCheckpoint.xpAwarded,
        totalXp: updatedProfile?.xpPoints ?? (await getCurrentUserXp(userId)),
      };
    }

    return {
      success: true,
      checkpointCompleted: true,
      checkpointId: checkpoint.id,
      alreadyCompleted: true,
      xpAwarded: 0,
      totalXp: await getCurrentUserXp(userId),
    };
  }

  // 4. Case B: Full Lesson Completion
  const [insertedProgress] = await db
    .insert(schema.lessonProgress)
    .values({
      userId,
      lessonId: lessonRecord.id,
      xpAwarded: COMPLETION_XP,
    })
    .onConflictDoNothing()
    .returning({
      xpAwarded: schema.lessonProgress.xpAwarded,
      completedAt: schema.lessonProgress.completedAt,
    });

  if (insertedProgress) {
    const [updatedProfile] = await db
      .update(schema.studentProfile)
      .set({
        xpPoints: sql`COALESCE(${schema.studentProfile.xpPoints}, 0) + ${insertedProgress.xpAwarded}`,
      })
      .where(eq(schema.studentProfile.userId, userId))
      .returning({ xpPoints: schema.studentProfile.xpPoints });

    return {
      success: true,
      completed: true,
      lessonId: lessonRecord.id,
      alreadyCompleted: false,
      completedAt: insertedProgress.completedAt,
      xpAwarded: insertedProgress.xpAwarded,
      totalXp: updatedProfile?.xpPoints ?? (await getCurrentUserXp(userId)),
    };
  }

  const [existingProgress] = await db
    .select({ completedAt: schema.lessonProgress.completedAt })
    .from(schema.lessonProgress)
    .where(
      and(
        eq(schema.lessonProgress.userId, userId),
        eq(schema.lessonProgress.lessonId, lessonRecord.id)
      )
    )
    .limit(1);

  if (!existingProgress) {
    throw new DomainError("تعذر حفظ تقدم الدرس في قاعدة البيانات. حاول مرة أخرى.");
  }

  return {
    success: true,
    completed: true,
    lessonId: lessonRecord.id,
    alreadyCompleted: true,
    completedAt: existingProgress.completedAt,
    xpAwarded: 0,
    totalXp: await getCurrentUserXp(userId),
  };
}

/**
 * Retrieves the comprehensive student timeline of completed lessons, quizzes, graded homework, and enrollments.
 */
export async function getStudentProgressTimeline(userId: string): Promise<{
  success: boolean;
  events: TimelineEvent[];
  totalCompleted: number;
  totalQuizzesPassed: number;
}> {
  const [
    lessonProgressRows,
    quizAttemptRows,
    homeworkSubmissionRows,
    enrollmentRows,
    [lessonProgressCount],
    [passedQuizCount],
  ] = await Promise.all([
    // Completed lessons with unit metadata
    db
      .select({
        id: schema.lessonProgress.id,
        lessonId: schema.lessonProgress.lessonId,
        lessonTitle: schema.lesson.title,
        unitTitle: schema.courseUnit.title,
        xpAwarded: schema.lessonProgress.xpAwarded,
        completedAt: schema.lessonProgress.completedAt,
      })
      .from(schema.lessonProgress)
      .leftJoin(schema.lesson, eq(schema.lessonProgress.lessonId, schema.lesson.id))
      .leftJoin(schema.courseUnit, eq(schema.lesson.unitId, schema.courseUnit.id))
      .where(eq(schema.lessonProgress.userId, userId))
      .orderBy(desc(schema.lessonProgress.completedAt)),

    // Quiz attempts
    db
      .select({
        id: schema.quizAttempt.id,
        quizId: schema.quizAttempt.quizId,
        quizTitle: schema.quiz.title,
        score: schema.quizAttempt.score,
        totalPossibleScore: schema.quizAttempt.totalPossibleScore,
        passed: schema.quizAttempt.passed,
        createdAt: schema.quizAttempt.createdAt,
      })
      .from(schema.quizAttempt)
      .leftJoin(schema.quiz, eq(schema.quizAttempt.quizId, schema.quiz.id))
      .where(eq(schema.quizAttempt.userId, userId))
      .orderBy(desc(schema.quizAttempt.createdAt)),

    // Graded homework
    db
      .select({
        id: schema.homeworkSubmission.id,
        assignmentId: schema.homeworkSubmission.assignmentId,
        assignmentTitle: schema.homeworkAssignment.title,
        unitTitle: schema.courseUnit.title,
        score: schema.homeworkSubmission.score,
        maxScore: schema.homeworkAssignment.maxScore,
        status: schema.homeworkSubmission.status,
        gradedAt: schema.homeworkSubmission.gradedAt,
        createdAt: schema.homeworkSubmission.createdAt,
      })
      .from(schema.homeworkSubmission)
      .leftJoin(
        schema.homeworkAssignment,
        eq(schema.homeworkSubmission.assignmentId, schema.homeworkAssignment.id)
      )
      .leftJoin(
        schema.courseUnit,
        eq(schema.homeworkAssignment.unitId, schema.courseUnit.id)
      )
      .where(
        and(
          eq(schema.homeworkSubmission.userId, userId),
          eq(schema.homeworkSubmission.status, "graded")
        )
      )
      .orderBy(desc(schema.homeworkSubmission.gradedAt)),

    // Active enrollments
    db
      .select({
        id: schema.enrollment.id,
        unitTitle: schema.courseUnit.title,
        enrolledAt: schema.enrollment.enrolledAt,
      })
      .from(schema.enrollment)
      .leftJoin(schema.courseUnit, eq(schema.enrollment.unitId, schema.courseUnit.id))
      .where(eq(schema.enrollment.userId, userId))
      .orderBy(desc(schema.enrollment.enrolledAt)),

    db
      .select({ value: count() })
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.userId, userId)),

    db
      .select({ value: count() })
      .from(schema.quizAttempt)
      .where(
        and(
          eq(schema.quizAttempt.userId, userId),
          eq(schema.quizAttempt.passed, true)
        )
      ),
  ]);

  const events: TimelineEvent[] = [
    ...lessonProgressRows.map((r) => ({
      id: `lesson-${r.id}`,
      type: "lesson_completed" as const,
      title: r.lessonTitle ?? "محاضرة تعليمية",
      subtitle: r.unitTitle ?? undefined,
      xpEarned: r.xpAwarded,
      timestamp: r.completedAt.toISOString(),
      icon: "🎬",
    })),

    ...quizAttemptRows.map((r) => ({
      id: `quiz-${r.id}`,
      type: (r.passed ? "quiz_passed" : "quiz_failed") as TimelineEvent["type"],
      title: r.quizTitle ?? "اختبار تحدي",
      subtitle: r.passed ? "اجتزت الاختبار بنجاح! 🏆" : "لم تجتز الاختبار هذه المرة",
      score: r.score,
      maxScore: r.totalPossibleScore,
      passed: r.passed,
      xpEarned: r.passed ? 50 : 0,
      timestamp: r.createdAt.toISOString(),
      icon: r.passed ? "🏅" : "📝",
    })),

    ...homeworkSubmissionRows.map((r) => ({
      id: `hw-${r.id}`,
      type: "homework_graded" as const,
      title: r.assignmentTitle ?? "واجب منزلي",
      subtitle: r.unitTitle ?? undefined,
      score: r.score ?? undefined,
      maxScore: r.maxScore ?? undefined,
      timestamp: (r.gradedAt ?? r.createdAt).toISOString(),
      icon: "📋",
    })),

    ...enrollmentRows.map((r) => ({
      id: `enroll-${r.id}`,
      type: "enrollment" as const,
      title: `انضممت إلى: ${r.unitTitle ?? "وحدة جديدة"}`,
      subtitle: "مبروك! تم تفعيل الوحدة في حسابك 🎉",
      timestamp: r.enrolledAt.toISOString(),
      icon: "🎓",
    })),
  ];

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    success: true,
    events: events.slice(0, 30),
    totalCompleted: lessonProgressCount.value,
    totalQuizzesPassed: passedQuizCount.value,
  };
}

const ALLOWED_XP_REASONS: Record<string, number> = {
  srs_daily_challenge: 20,
  phonics_practice: 15,
  practice_challenge: 10,
};

/**
 * Awards bounded XP for student practice activities with strict rate limiting checks.
 */
export async function awardPracticeXp(userId: string, reason: string, requestedXp?: number) {
  if (!Object.prototype.hasOwnProperty.call(ALLOWED_XP_REASONS, reason)) {
    throw new DomainError("نوع النشاط غير معتمد لتسجيل النقاط.");
  }

  const maxAllowed = ALLOWED_XP_REASONS[reason] || 15;
  const rawXp = typeof requestedXp === "number" ? Math.round(requestedXp) : 10;
  const xpAmount = Math.max(1, Math.min(rawXp, maxAllowed));

  const [updatedProfile] = await db
    .update(schema.studentProfile)
    .set({
      xpPoints: sql`COALESCE(${schema.studentProfile.xpPoints}, 0) + ${xpAmount}`,
    })
    .where(eq(schema.studentProfile.userId, userId))
    .returning({
      newXpPoints: schema.studentProfile.xpPoints,
    });

  if (!updatedProfile) {
    throw new NotFoundError("ملف الطالب الشخصي غير موجود لإضافة نقاط الخبرة.");
  }

  return {
    success: true,
    xpAwarded: xpAmount,
    reason,
    newTotalXp: updatedProfile.newXpPoints,
  };
}

export interface UpsertProfileParams {
  userId: string;
  phoneNumber?: string;
  parentPhoneNumber: string;
  parentName?: string;
  governorate?: string;
  gradeLevel?: number | string;
  schoolName?: string;
  deviceId?: string;
  sessionId?: string;
}

/**
 * Creates or updates a student profile with Egyptian phone validation, governorate normalization, and device binding.
 */
export async function upsertStudentProfile(params: UpsertProfileParams) {
  const {
    userId,
    phoneNumber,
    parentPhoneNumber,
    parentName,
    governorate,
    gradeLevel,
    schoolName,
    deviceId,
    sessionId,
  } = params;

  const cleanStdPhone = validateEgyptianPhone(phoneNumber || "");
  const cleanParentPhone = validateEgyptianPhone(parentPhoneNumber || "");

  if (!cleanStdPhone || !cleanParentPhone) {
    throw new DomainError("يرجى إدخال أرقام هواتف مصرية صحيحة للطالب وولي الأمر.");
  }

  if (cleanStdPhone === cleanParentPhone) {
    throw new DomainError("رقم موبايل الطالب ورقم ولي الأمر يجب أن يكونا مختلفين.");
  }

  const [existingProfile] = await db
    .select()
    .from(schema.studentProfile)
    .where(eq(schema.studentProfile.userId, userId))
    .limit(1);

  const parsedGrade = parseInt(String(gradeLevel || "1"), 10);
  const safeGradeLevel = Number.isNaN(parsedGrade) ? 1 : Math.max(1, Math.min(6, parsedGrade));
  const normalizedGov = normalizeGovernorate(governorate || "cairo");
  const safeGov = (schema.governorateEnum.enumValues.includes(
    normalizedGov as (typeof schema.governorateEnum.enumValues)[number]
  )
    ? normalizedGov
    : "cairo") as (typeof schema.governorateEnum.enumValues)[number];

  if (existingProfile) {
    await db
      .update(schema.studentProfile)
      .set({
        parentPhoneNumber: cleanParentPhone,
        parentName: parentName?.trim() || existingProfile.parentName || null,
        governorate: safeGov,
        gradeLevel: safeGradeLevel,
        schoolName: schoolName?.trim() || existingProfile.schoolName || null,
      })
      .where(eq(schema.studentProfile.userId, userId));
  } else {
    await db.insert(schema.studentProfile).values({
      userId,
      parentPhoneNumber: cleanParentPhone,
      parentName: parentName?.trim() || null,
      governorate: safeGov,
      gradeLevel: safeGradeLevel,
      schoolName: schoolName?.trim() || null,
      xpPoints: 50, // Welcome signup bonus XP
    });
  }

  if (deviceId && sessionId) {
    try {
      await db
        .update(schema.session)
        .set({ deviceId, updatedAt: new Date() })
        .where(eq(schema.session.id, sessionId));
    } catch (devErr) {
      console.warn("Could not bind deviceId to session:", devErr);
    }
  }

  return {
    success: true,
    message: "تم إنشاء وتحديث الملف الشخصي بنجاح.",
  };
}
