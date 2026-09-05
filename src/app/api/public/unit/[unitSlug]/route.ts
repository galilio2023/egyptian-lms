import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, or, and, isNull, gt } from "drizzle-orm";
import { INITIAL_UNITS, INITIAL_LESSONS, INITIAL_QUIZ } from "@/lib/db/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitSlug: string }> }
) {
  try {
    const { unitSlug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;
    const now = new Date();

    // 1. Query unit from database by slug or ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(unitSlug);

    const [dbUnit] = await db
      .select({
        id: schema.courseUnit.id,
        gradeId: schema.courseUnit.gradeId,
        gradeSlug: schema.grade.slug,
        gradeTitle: schema.grade.titleEnglish,
        title: schema.courseUnit.title,
        slug: schema.courseUnit.slug,
        description: schema.courseUnit.description,
        thumbnailUrl: schema.courseUnit.thumbnailUrl,
        priceEgp: schema.courseUnit.price,
        orderIndex: schema.courseUnit.orderIndex,
        isPublished: schema.courseUnit.isPublished,
      })
      .from(schema.courseUnit)
      .leftJoin(schema.grade, eq(schema.courseUnit.gradeId, schema.grade.id))
      .where(or(eq(schema.courseUnit.slug, unitSlug), ...(isUUID ? [eq(schema.courseUnit.id, unitSlug)] : [])))
      .limit(1);

    if (dbUnit) {
      // Check if student has active non-expired enrollment in this unit
      let isEnrolled = false;
      if (currentUserId) {
        try {
          const [activeEnrollment] = await db
            .select({ id: schema.enrollment.id })
            .from(schema.enrollment)
            .where(
              and(
                eq(schema.enrollment.userId, currentUserId),
                eq(schema.enrollment.unitId, dbUnit.id),
                eq(schema.enrollment.isActive, true),
                or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
              )
            )
            .limit(1);
          if (activeEnrollment) isEnrolled = true;
        } catch {
          // DB check fallback
        }
      }

      // Fetch lessons for this unit
      const dbLessons = await db
        .select()
        .from(schema.lesson)
        .where(eq(schema.lesson.unitId, dbUnit.id))
        .orderBy(schema.lesson.orderIndex);

      // Fetch passed quizzes and submitted homework for current user in this unit
      const userPassedQuizLessonIds = new Set<string>();
      const userSubmittedHwLessonIds = new Set<string>();

      if (currentUserId && isEnrolled) {
        try {
          const passedAttempts = await db
            .select({ lessonId: schema.quiz.lessonId })
            .from(schema.quizAttempt)
            .innerJoin(schema.quiz, eq(schema.quizAttempt.quizId, schema.quiz.id))
            .where(
              and(
                eq(schema.quizAttempt.userId, currentUserId),
                eq(schema.quizAttempt.passed, true)
              )
            );
          passedAttempts.forEach((p) => {
            if (p.lessonId) userPassedQuizLessonIds.add(p.lessonId);
          });

          const userSubmissions = await db
            .select({ lessonId: schema.homeworkAssignment.lessonId })
            .from(schema.homeworkSubmission)
            .innerJoin(
              schema.homeworkAssignment,
              eq(schema.homeworkSubmission.assignmentId, schema.homeworkAssignment.id)
            )
            .where(eq(schema.homeworkSubmission.userId, currentUserId));
          userSubmissions.forEach((s) => {
            if (s.lessonId) userSubmittedHwLessonIds.add(s.lessonId);
          });
        } catch (e) {
          console.warn("Unit lesson prereq check note:", e);
        }
      }

      const formattedLessons = dbLessons.map((l, idx) => {
        let isPrerequisiteBlocked = false;
        let prerequisiteMessage = "";

        if (isEnrolled && !l.isFreePreview && l.prerequisiteType && l.prerequisiteType !== "none") {
          const targetLessonId = l.prerequisiteLessonId || (idx > 0 ? dbLessons[idx - 1].id : null);
          if (targetLessonId) {
            if (l.prerequisiteType === "previous_quiz_passed" && !userPassedQuizLessonIds.has(targetLessonId)) {
              isPrerequisiteBlocked = true;
              prerequisiteMessage = "يجب اجتياز كويز المحاضرة السابقة أولاً 🔒";
            } else if (l.prerequisiteType === "previous_homework_submitted" && !userSubmittedHwLessonIds.has(targetLessonId)) {
              isPrerequisiteBlocked = true;
              prerequisiteMessage = "يجب تسليم واجب المحاضرة السابقة أولاً 🔒";
            }
          }
        }

        const canAccessContent = Boolean((l.isFreePreview || isEnrolled) && !isPrerequisiteBlocked);
        const rawVideoUrl = l.videoId?.startsWith("http")
          ? l.videoId
          : "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

        return {
          id: l.id,
          unitId: l.unitId,
          title: l.title,
          slug: l.slug,
          orderIndex: l.orderIndex,
          videoDuration: `${Math.round((l.videoDurationSeconds || 1200) / 60)} دقيقة`,
          videoUrl: canAccessContent ? rawVideoUrl : null,
          pdfAttachmentUrl: canAccessContent ? (l.pdfAttachmentUrl || null) : null,
          isFreePreview: l.isFreePreview,
          prerequisiteType: l.prerequisiteType,
          isPrerequisiteBlocked,
          prerequisiteMessage,
        };
      });

      // Fetch quiz for this unit
      const [dbQuiz] = await db
        .select()
        .from(schema.quiz)
        .where(eq(schema.quiz.unitId, dbUnit.id))
        .limit(1);

      return NextResponse.json({
        success: true,
        isEnrolled,
        unit: {
          id: dbUnit.id,
          gradeId: dbUnit.gradeId,
          gradeSlug: dbUnit.gradeSlug || "grade-1",
          gradeTitle: dbUnit.gradeTitle || "Grade 1",
          title: dbUnit.title,
          slug: dbUnit.slug,
          description: dbUnit.description,
          thumbnailUrl: dbUnit.thumbnailUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
          priceEgp: dbUnit.priceEgp || 250,
          lessonsCount: formattedLessons.length || 4,
          quizzesCount: dbQuiz ? 1 : 1,
          isPublished: dbUnit.isPublished,
        },
        lessons: formattedLessons,
        quizId: dbQuiz?.id || INITIAL_QUIZ.id,
      });
    }

    // 2. Fallback to mock data
    const mockUnit = INITIAL_UNITS.find((u) => u.slug === unitSlug || u.id === unitSlug) || INITIAL_UNITS[0];
    
    // Check enrollment for mock unit
    let mockIsEnrolled = false;
    if (currentUserId) {
      try {
        const [activeEnrollment] = await db
          .select({ id: schema.enrollment.id })
          .from(schema.enrollment)
          .where(
            and(
              eq(schema.enrollment.userId, currentUserId),
              eq(schema.enrollment.unitId, mockUnit.id),
              eq(schema.enrollment.isActive, true),
              or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
            )
          )
          .limit(1);
        if (activeEnrollment) mockIsEnrolled = true;
      } catch {
        // Fallback
      }
    }

    const mockLessons = INITIAL_LESSONS
      .filter((l) => l.unitId === mockUnit.id)
      .map((l) => {
        const canAccess = Boolean(l.isFreePreview || mockIsEnrolled);
        return {
          ...l,
          videoUrl: canAccess ? l.videoUrl : "",
          pdfAttachmentUrl: canAccess ? l.pdfAttachmentUrl : undefined,
        };
      });

    return NextResponse.json({
      success: true,
      isEnrolled: mockIsEnrolled,
      unit: mockUnit,
      lessons: mockLessons,
      quizId: INITIAL_QUIZ.id,
    });
  } catch (error) {
    console.error("Public unit fetch error:", error);
    return NextResponse.json({
      success: true,
      unit: INITIAL_UNITS[0],
      lessons: INITIAL_LESSONS.slice(0, 3),
      quizId: INITIAL_QUIZ.id,
    });
  }
}
