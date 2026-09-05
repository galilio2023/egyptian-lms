import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, or, and, isNull, gt, lt, desc } from "drizzle-orm";
import { INITIAL_LESSONS, INITIAL_UNITS } from "@/lib/db/mock-data";
import { generateBunnyPlaybackUrl } from "@/lib/video/bunny";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonSlug: string }> }
) {
  try {
    const { lessonSlug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;
    const now = new Date();

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonSlug);

    const [dbLesson] = await db
      .select()
      .from(schema.lesson)
      .where(or(eq(schema.lesson.slug, lessonSlug), ...(isUUID ? [eq(schema.lesson.id, lessonSlug)] : [])))
      .limit(1);

    if (dbLesson) {
      const [dbUnit] = await db
        .select({
          id: schema.courseUnit.id,
          gradeId: schema.courseUnit.gradeId,
          gradeSlug: schema.grade.slug,
          gradeTitle: schema.grade.titleEnglish,
          title: schema.courseUnit.title,
          slug: schema.courseUnit.slug,
          description: schema.courseUnit.description,
          priceEgp: schema.courseUnit.price,
        })
        .from(schema.courseUnit)
        .leftJoin(schema.grade, eq(schema.courseUnit.gradeId, schema.grade.id))
        .where(eq(schema.courseUnit.id, dbLesson.unitId))
        .limit(1);

      // Verify entitlement
      let isEnrolled = false;
      if (dbLesson.isFreePreview) {
        isEnrolled = true;
      } else if (currentUserId && dbLesson.unitId) {
        try {
          const [activeEnrollment] = await db
            .select()
            .from(schema.enrollment)
            .where(
              and(
                eq(schema.enrollment.userId, currentUserId),
                eq(schema.enrollment.unitId, dbLesson.unitId),
                eq(schema.enrollment.isActive, true),
                or(
                  isNull(schema.enrollment.expiresAt),
                  gt(schema.enrollment.expiresAt, now)
                )
              )
            )
            .limit(1);
          if (activeEnrollment) {
            isEnrolled = true;
          }
        } catch {
          // DB check fallback
        }
      }

      // Check prerequisite gating
      let isPrerequisiteBlocked = false;
      let prerequisiteMessage = "";

      if (isEnrolled && !dbLesson.isFreePreview && dbLesson.prerequisiteType && dbLesson.prerequisiteType !== 'none' && currentUserId) {
        try {
          let targetPrereqLessonId = dbLesson.prerequisiteLessonId;
          if (!targetPrereqLessonId) {
            const [prevLesson] = await db
              .select({ id: schema.lesson.id })
              .from(schema.lesson)
              .where(
                and(
                  eq(schema.lesson.unitId, dbLesson.unitId),
                  lt(schema.lesson.orderIndex, dbLesson.orderIndex)
                )
              )
              .orderBy(desc(schema.lesson.orderIndex))
              .limit(1);
            targetPrereqLessonId = prevLesson?.id;
          }

          if (targetPrereqLessonId) {
            if (dbLesson.prerequisiteType === 'previous_quiz_passed') {
              const [prereqQuiz] = await db
                .select({ id: schema.quiz.id })
                .from(schema.quiz)
                .where(eq(schema.quiz.lessonId, targetPrereqLessonId))
                .limit(1);

              if (prereqQuiz) {
                const [passedAttempt] = await db
                  .select({ id: schema.quizAttempt.id })
                  .from(schema.quizAttempt)
                  .where(
                    and(
                      eq(schema.quizAttempt.quizId, prereqQuiz.id),
                      eq(schema.quizAttempt.userId, currentUserId),
                      eq(schema.quizAttempt.passed, true)
                    )
                  )
                  .limit(1);

                if (!passedAttempt) {
                  isPrerequisiteBlocked = true;
                  prerequisiteMessage = "يجب اجتياز كويز المحاضرة السابقة أولاً بنجاح لفتح هذا الدرس 🔒";
                }
              }
            } else if (dbLesson.prerequisiteType === 'previous_homework_submitted') {
              const [prereqHw] = await db
                .select({ id: schema.homeworkAssignment.id })
                .from(schema.homeworkAssignment)
                .where(eq(schema.homeworkAssignment.lessonId, targetPrereqLessonId))
                .limit(1);

              if (prereqHw) {
                const [hwSub] = await db
                  .select({ id: schema.homeworkSubmission.id })
                  .from(schema.homeworkSubmission)
                  .where(
                    and(
                      eq(schema.homeworkSubmission.assignmentId, prereqHw.id),
                      eq(schema.homeworkSubmission.userId, currentUserId)
                    )
                  )
                  .limit(1);

                if (!hwSub) {
                  isPrerequisiteBlocked = true;
                  prerequisiteMessage = "يجب تسليم واجب المحاضرة السابقة لمعلم المادة أولاً لفتح هذا الدرس 🔒";
                }
              }
            }
          }
        } catch (prereqErr) {
          console.warn("Prerequisite check note:", prereqErr);
          isPrerequisiteBlocked = true;
          prerequisiteMessage = "تعذر التحقق من شروط فتح الدرس، يرجى إعادة المحاولة 🔒";
        }
      }

      const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;
      const canAccessVideo = isEnrolled && !isPrerequisiteBlocked;
      const secureVideoUrl = generateBunnyPlaybackUrl({
        provider: dbLesson.videoProvider,
        videoId: dbLesson.videoId,
        clientIp,
        expiresInSeconds: 7200,
      });

      return NextResponse.json({
        success: true,
        isEnrolled,
        isLocked: !canAccessVideo,
        isPrerequisiteBlocked,
        prerequisiteMessage,
        lesson: {
          id: dbLesson.id,
          unitId: dbLesson.unitId,
          title: dbLesson.title,
          slug: dbLesson.slug,
          videoDuration: `${Math.round((dbLesson.videoDurationSeconds || 1200) / 60)} دقيقة`,
          videoUrl: canAccessVideo ? secureVideoUrl : null,
          pdfAttachmentUrl: canAccessVideo ? (dbLesson.pdfAttachmentUrl || null) : null,
          isFreePreview: dbLesson.isFreePreview,
          prerequisiteType: dbLesson.prerequisiteType,
          isPrerequisiteBlocked,
          prerequisiteMessage,
        },
        unit: dbUnit || INITIAL_UNITS[0],
      });
    }

    // Fallback for mock data
    const mockLesson = INITIAL_LESSONS.find((l) => l.slug === lessonSlug || l.id === lessonSlug) || INITIAL_LESSONS[0];
    const mockUnit = INITIAL_UNITS.find((u) => u.id === mockLesson.unitId) || INITIAL_UNITS[0];

    let mockIsEnrolled = Boolean(mockLesson.isFreePreview);
    if (!mockIsEnrolled && currentUserId) {
      try {
        const [activeEnrollment] = await db
          .select({ id: schema.enrollment.id })
          .from(schema.enrollment)
          .where(
            and(
              eq(schema.enrollment.userId, currentUserId),
              eq(schema.enrollment.unitId, mockLesson.unitId),
              eq(schema.enrollment.isActive, true),
              or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
            )
          )
          .limit(1);
        if (activeEnrollment) {
          mockIsEnrolled = true;
        }
      } catch {
        // Fallback
      }
    }

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;
    const secureMockUrl = generateBunnyPlaybackUrl({
      provider: "bunny",
      videoId: mockLesson.videoUrl,
      clientIp,
      expiresInSeconds: 7200,
    });

    return NextResponse.json({
      success: true,
      isEnrolled: mockIsEnrolled,
      isLocked: !mockIsEnrolled,
      lesson: {
        ...mockLesson,
        videoUrl: mockIsEnrolled ? secureMockUrl : null,
        pdfAttachmentUrl: mockIsEnrolled ? (mockLesson.pdfAttachmentUrl || null) : null,
      },
      unit: mockUnit,
    });
  } catch (error) {
    console.error("Public lesson fetch error:", error);
    const fallbackLesson = INITIAL_LESSONS[0];
    return NextResponse.json({
      success: true,
      isEnrolled: fallbackLesson.isFreePreview,
      isLocked: !fallbackLesson.isFreePreview,
      lesson: {
        ...fallbackLesson,
        videoUrl: fallbackLesson.isFreePreview ? fallbackLesson.videoUrl : null,
      },
      unit: INITIAL_UNITS[0],
    });
  }
}
