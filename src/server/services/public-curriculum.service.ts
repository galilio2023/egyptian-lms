import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, or, and, isNull, gt, lt, inArray, desc, sql, count } from "drizzle-orm";
import { INITIAL_UNITS, INITIAL_GRADES, INITIAL_LESSONS, INITIAL_QUIZ, INITIAL_PLATFORM_SETTINGS } from "@/lib/db/mock-data";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { generateBunnyPlaybackUrl } from "@/lib/video/bunny";

/**
 * Retrieves public landing data (published units, lesson count aggregates, top student leaderboard, platform branding).
 */
export async function getLandingData() {
  try {
    const [dbUnits, dbLessons, topStudents, settings] = await Promise.all([
      db
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
        .where(eq(schema.courseUnit.isPublished, true))
        .orderBy(schema.courseUnit.orderIndex),

      db
        .select({
          unitId: schema.lesson.unitId,
          lessonCount: count(schema.lesson.id),
        })
        .from(schema.lesson)
        .groupBy(schema.lesson.unitId),

      db
        .select({
          id: schema.studentProfile.id,
          name: schema.user.name,
          gradeLevel: schema.studentProfile.gradeLevel,
          governorate: schema.studentProfile.governorate,
          schoolName: schema.studentProfile.schoolName,
          xpPoints: schema.studentProfile.xpPoints,
        })
        .from(schema.studentProfile)
        .leftJoin(schema.user, eq(schema.studentProfile.userId, schema.user.id))
        .where(eq(schema.studentProfile.isBanned, false))
        .orderBy(desc(schema.studentProfile.xpPoints))
        .limit(20),

      getPlatformSettings(),
    ]);

    const lessonCountMap = new Map(dbLessons.map((l) => [l.unitId, Number(l.lessonCount)]));

    const formattedUnits = dbUnits.map((u) => {
      const lessonCount = lessonCountMap.get(u.id);
      return {
        id: u.id,
        gradeId: u.gradeId,
        gradeSlug: u.gradeSlug || "grade-1",
        gradeTitle: u.gradeTitle || "Grade 1",
        title: u.title,
        slug: u.slug,
        description: u.description || "وحدة دراسية متكاملة بالصوتيات والاختبارات.",
        thumbnailUrl: u.thumbnailUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
        priceEgp: u.priceEgp || 250,
        lessonsCount: lessonCount !== undefined ? lessonCount : 4,
        quizzesCount: 1,
        isPublished: u.isPublished,
      };
    });

    return {
      success: true,
      units: formattedUnits.length > 0 ? formattedUnits : INITIAL_UNITS,
      grades: INITIAL_GRADES,
      topStudents,
      settings,
    };
  } catch (err) {
    console.warn("Public landing data DB fallback:", err);
    return {
      success: true,
      units: INITIAL_UNITS,
      grades: INITIAL_GRADES,
      topStudents: [],
      settings: INITIAL_PLATFORM_SETTINGS,
    };
  }
}

/**
 * Retrieves public unit details along with its lessons and prerequisite verification.
 */
export async function getPublicUnitDetails(unitSlug: string, currentUserId?: string | null) {
  const now = new Date();
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
    const enrollmentQuery = currentUserId
      ? db
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
          .limit(1)
      : Promise.resolve([]);

    const lessonsQuery = db
      .select()
      .from(schema.lesson)
      .where(eq(schema.lesson.unitId, dbUnit.id))
      .orderBy(schema.lesson.orderIndex);

    const quizQuery = db
      .select()
      .from(schema.quiz)
      .where(eq(schema.quiz.unitId, dbUnit.id))
      .limit(1);

    const [activeEnrollmentList, dbLessons, [dbQuiz]] = await Promise.all([
      enrollmentQuery,
      lessonsQuery,
      quizQuery,
    ]);

    const isEnrolled = Boolean(activeEnrollmentList && activeEnrollmentList.length > 0);

    const unitLessonIds = dbLessons.map((l) => l.id);
    const lessonsWithQuiz = new Set<string>();
    const lessonsWithHw = new Set<string>();

    if (unitLessonIds.length > 0) {
      try {
        const [existingQuizzes, existingHw] = await Promise.all([
          db
            .select({ lessonId: schema.quiz.lessonId })
            .from(schema.quiz)
            .where(inArray(schema.quiz.lessonId, unitLessonIds)),
          db
            .select({ lessonId: schema.homeworkAssignment.lessonId })
            .from(schema.homeworkAssignment)
            .where(inArray(schema.homeworkAssignment.lessonId, unitLessonIds)),
        ]);

        existingQuizzes.forEach((q) => {
          if (q.lessonId) lessonsWithQuiz.add(q.lessonId);
        });
        existingHw.forEach((h) => {
          if (h.lessonId) lessonsWithHw.add(h.lessonId);
        });
      } catch (err) {
        console.warn("Error fetching existing lesson quizzes/hw:", err);
      }
    }

    const userPassedQuizLessonIds = new Set<string>();
    const userSubmittedHwLessonIds = new Set<string>();

    if (currentUserId && isEnrolled) {
      try {
        const [passedAttempts, userSubmissions] = await Promise.all([
          db
            .select({ lessonId: schema.quiz.lessonId })
            .from(schema.quizAttempt)
            .innerJoin(schema.quiz, eq(schema.quizAttempt.quizId, schema.quiz.id))
            .where(
              and(
                eq(schema.quizAttempt.userId, currentUserId),
                eq(schema.quizAttempt.passed, true)
              )
            ),
          db
            .select({ lessonId: schema.homeworkAssignment.lessonId })
            .from(schema.homeworkSubmission)
            .innerJoin(
              schema.homeworkAssignment,
              eq(schema.homeworkSubmission.assignmentId, schema.homeworkAssignment.id)
            )
            .where(eq(schema.homeworkSubmission.userId, currentUserId)),
        ]);

        passedAttempts.forEach((p) => {
          if (p.lessonId) userPassedQuizLessonIds.add(p.lessonId);
        });
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
          if (
            l.prerequisiteType === "previous_quiz_passed" &&
            lessonsWithQuiz.has(targetLessonId) &&
            !userPassedQuizLessonIds.has(targetLessonId)
          ) {
            isPrerequisiteBlocked = true;
            prerequisiteMessage = "يجب اجتياز كويز المحاضرة السابقة أولاً 🔒";
          } else if (
            l.prerequisiteType === "previous_homework_submitted" &&
            lessonsWithHw.has(targetLessonId) &&
            !userSubmittedHwLessonIds.has(targetLessonId)
          ) {
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

    return {
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
        quizzesCount: dbQuiz ? 1 : 0,
        isPublished: dbUnit.isPublished,
      },
      lessons: formattedLessons,
      quizId: dbQuiz?.id || INITIAL_QUIZ.id,
    };
  }

  // Fallback to mock data
  const mockUnit = INITIAL_UNITS.find((u) => u.slug === unitSlug || u.id === unitSlug);
  if (!mockUnit) return null;

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

  return {
    success: true,
    isEnrolled: mockIsEnrolled,
    unit: mockUnit,
    lessons: mockLessons,
    quizId: INITIAL_QUIZ.id,
  };
}

/**
 * Retrieves public lesson details, playlist, and signed DRM video playback URL.
 */
export async function getPublicLessonDetails(
  lessonSlug: string,
  currentUserId?: string | null,
  clientIp?: string
) {
  const now = new Date();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonSlug);

  try {
    const [dbLesson] = await db
      .select()
      .from(schema.lesson)
      .where(or(eq(schema.lesson.slug, lessonSlug), ...(isUUID ? [eq(schema.lesson.id, lessonSlug)] : [])))
      .limit(1);

  if (dbLesson) {
    const unitQuery = db
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

    const enrollmentQuery = currentUserId && !dbLesson.isFreePreview
      ? db
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
          .limit(1)
      : Promise.resolve([]);

    const progressQuery = currentUserId
      ? db
          .select({ id: schema.lessonProgress.id })
          .from(schema.lessonProgress)
          .where(
            and(
              eq(schema.lessonProgress.userId, currentUserId),
              eq(schema.lessonProgress.lessonId, dbLesson.id)
            )
          )
          .limit(1)
      : Promise.resolve([]);

    const playlistQuery = db
      .select({
        id: schema.lesson.id,
        unitId: schema.lesson.unitId,
        title: schema.lesson.title,
        slug: schema.lesson.slug,
        orderIndex: schema.lesson.orderIndex,
        isFreePreview: schema.lesson.isFreePreview,
        videoId: schema.lesson.videoId,
        videoProvider: schema.lesson.videoProvider,
        videoDuration: sql<string>`concat(round(coalesce(${schema.lesson.videoDurationSeconds}, 1200) / 60), ' دقيقة')`,
      })
      .from(schema.lesson)
      .where(eq(schema.lesson.unitId, dbLesson.unitId))
      .orderBy(schema.lesson.orderIndex);

    const quizQuery = db
      .select({ id: schema.quiz.id })
      .from(schema.quiz)
      .where(or(eq(schema.quiz.unitId, dbLesson.unitId), eq(schema.quiz.lessonId, dbLesson.id)))
      .limit(1);

    const [[dbUnit], activeEnrollmentList, completedProgressList, dbPlaylist, [dbQuiz]] = await Promise.all([
      unitQuery,
      enrollmentQuery,
      progressQuery,
      playlistQuery,
      quizQuery,
    ]);

    const isEnrolled = Boolean(dbLesson.isFreePreview || (activeEnrollmentList && activeEnrollmentList.length > 0));

    let isPrerequisiteBlocked = false;
    let prerequisiteMessage = "";

    if (isEnrolled && !dbLesson.isFreePreview && dbLesson.prerequisiteType && dbLesson.prerequisiteType !== "none" && currentUserId) {
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
          if (dbLesson.prerequisiteType === "previous_quiz_passed") {
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
          } else if (dbLesson.prerequisiteType === "previous_homework_submitted") {
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

    const canAccessVideo = isEnrolled && !isPrerequisiteBlocked;
    const completedProgress = completedProgressList && completedProgressList[0];

    const secureVideoUrl = generateBunnyPlaybackUrl({
      provider: dbLesson.videoProvider,
      videoId: dbLesson.videoId,
      clientIp,
      expiresInSeconds: 7200,
    });

    return {
      success: true,
      isEnrolled,
      isLocked: !canAccessVideo,
      isPrerequisiteBlocked,
      prerequisiteMessage,
      isCompleted: Boolean(completedProgress),
      quizId: dbQuiz?.id || INITIAL_QUIZ.id,
      playlist: dbPlaylist.map((p) => {
        const canAccessEntry = Boolean(p.isFreePreview || (activeEnrollmentList && activeEnrollmentList.length > 0));
        return {
          id: p.id,
          unitId: p.unitId,
          title: p.title,
          slug: p.slug,
          orderIndex: p.orderIndex,
          isFreePreview: p.isFreePreview,
          videoDuration: p.videoDuration,
          videoUrl: (canAccessEntry && p.videoId)
            ? generateBunnyPlaybackUrl({
                provider: p.videoProvider,
                videoId: p.videoId,
                clientIp,
                expiresInSeconds: 7200,
              })
            : null,
        };
      }),
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
    };
  }
  } catch (err) {
    console.warn("Public lesson fetch DB note, falling back to mock data:", err);
  }

  // Fallback for mock data
  const mockLesson = INITIAL_LESSONS.find(
    (l) => l.slug === lessonSlug || l.id === lessonSlug || (lessonSlug === "lesson-1-greetings" && l.id === "les-1")
  );
  if (!mockLesson) return null;

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
      if (activeEnrollment) mockIsEnrolled = true;
    } catch {
      // Fallback
    }
  }

  const secureMockUrl = generateBunnyPlaybackUrl({
    provider: "bunny",
    videoId: mockLesson.videoUrl,
    clientIp,
    expiresInSeconds: 7200,
  });

  const mockPlaylist = INITIAL_LESSONS.filter((l) => l.unitId === mockUnit.id)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .map((l) => ({
      ...l,
      videoUrl: (mockIsEnrolled || l.isFreePreview) ? l.videoUrl : null,
      pdfAttachmentUrl: (mockIsEnrolled || l.isFreePreview) ? (l.pdfAttachmentUrl || null) : null,
    }));

  return {
    success: true,
    isEnrolled: mockIsEnrolled,
    isLocked: !mockIsEnrolled,
    quizId: INITIAL_QUIZ.id,
    playlist: mockPlaylist,
    lesson: {
      ...mockLesson,
      videoUrl: mockIsEnrolled ? secureMockUrl : null,
      pdfAttachmentUrl: mockIsEnrolled ? (mockLesson.pdfAttachmentUrl || null) : null,
    },
    unit: mockUnit,
  };
}
