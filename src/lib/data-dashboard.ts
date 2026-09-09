import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gt, isNull, or, inArray, notInArray, desc } from "drizzle-orm";
import {
  INITIAL_HOMEWORK_ASSIGNMENTS,
  INITIAL_HOMEWORK_SUBMISSIONS,
  INITIAL_LIVE_SESSIONS,
  type MockHomeworkAssignment,
  type MockHomeworkSubmission,
  type MockLiveSession,
} from "@/lib/db/mock-data";

export interface StudentDashboardServerData {
  profile: {
    gradeLevel: number;
    gradeTitle: string;
    gradeSlug: string;
    xpPoints: number;
    completedLessons: number;
    parentPhoneNumber: string;
    isBanned: boolean;
  } | null;
  enrolledUnitIds: string[];
  nextLesson: {
    title: string;
    unitTitle: string;
    durationMinutes: number;
    slug: string;
  } | null;
  currentAssignment: MockHomeworkAssignment | null;
  studentSubmission: MockHomeworkSubmission | undefined;
  liveSession?: MockLiveSession | null;
  streakDays?: number;
  activeQuizzesCount?: number;
  isBanned: boolean;
  isDeviceLocked: boolean;
}

const GRADE_NAMES: Record<number, string> = {
  1: "الصف الأول الابتدائي",
  2: "الصف الثاني الابتدائي",
  3: "الصف الثالث الابتدائي",
  4: "الصف الرابع الابتدائي",
  5: "الصف الخامس الابتدائي",
  6: "الصف السادس الابتدائي",
};

export async function getStudentDashboardData(
  userId: string,
  cookieHeader?: string | null
): Promise<StudentDashboardServerData> {
  // cookieHeader reserved for future device-check middleware
  void cookieHeader;

  const empty: StudentDashboardServerData = {
    profile: null,
    enrolledUnitIds: [],
    nextLesson: null,
    currentAssignment: null,
    studentSubmission: undefined,
    liveSession: null,
    streakDays: 1,
    activeQuizzesCount: 0,
    isBanned: false,
    isDeviceLocked: false,
  };

  try {
    const now = new Date();

    // Fetch profile, enrollments, and completed lessons in parallel
    const [profile, dbEnrollments, completedLessons] = await Promise.all([
      db
        .select()
        .from(schema.studentProfile)
        .where(eq(schema.studentProfile.userId, userId))
        .limit(1)
        .then((r) => r[0] ?? null),

      db
        .select({
          unitId: schema.enrollment.unitId,
          unitTitle: schema.courseUnit.title,
          unitSlug: schema.courseUnit.slug,
        })
        .from(schema.enrollment)
        .leftJoin(schema.courseUnit, eq(schema.enrollment.unitId, schema.courseUnit.id))
        .where(
          and(
            eq(schema.enrollment.userId, userId),
            eq(schema.enrollment.isActive, true),
            or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
          )
        ),

      db
        .select({ lessonId: schema.lessonProgress.lessonId })
        .from(schema.lessonProgress)
        .where(eq(schema.lessonProgress.userId, userId)),
    ]);

    if (profile?.isBanned) {
      return { ...empty, profile: null, isBanned: true, isDeviceLocked: false };
    }

    const enrolledUnitIds = dbEnrollments
      .map((e) => e.unitId)
      .filter((id): id is string => Boolean(id));
    const completedLessonIds = completedLessons.map((p) => p.lessonId);

    const dbHomework =
      enrolledUnitIds.length > 0
        ? await db
            .select({
              id: schema.homeworkAssignment.id,
              unitId: schema.homeworkAssignment.unitId,
              unitTitle: schema.courseUnit.title,
              lessonId: schema.homeworkAssignment.lessonId,
              title: schema.homeworkAssignment.title,
              instructions: schema.homeworkAssignment.instructions,
              pageNumber: schema.homeworkAssignment.pageNumber,
              maxScore: schema.homeworkAssignment.maxScore,
              dueDate: schema.homeworkAssignment.dueDate,
            })
            .from(schema.homeworkAssignment)
            .leftJoin(schema.courseUnit, eq(schema.homeworkAssignment.unitId, schema.courseUnit.id))
            .where(inArray(schema.homeworkAssignment.unitId, enrolledUnitIds))
            .orderBy(desc(schema.homeworkAssignment.createdAt))
            .limit(5)
        : [];

    // Find next incomplete lesson
    let nextLesson: StudentDashboardServerData["nextLesson"] = null;
    if (enrolledUnitIds.length > 0) {
      const [nl] = await db
        .select({
          title: schema.lesson.title,
          slug: schema.lesson.slug,
          videoDurationSeconds: schema.lesson.videoDurationSeconds,
          unitTitle: schema.courseUnit.title,
        })
        .from(schema.lesson)
        .innerJoin(schema.courseUnit, eq(schema.lesson.unitId, schema.courseUnit.id))
        .where(
          and(
            inArray(schema.lesson.unitId, enrolledUnitIds),
            ...(completedLessonIds.length > 0
              ? [notInArray(schema.lesson.id, completedLessonIds)]
              : [])
          )
        )
        .orderBy(schema.courseUnit.orderIndex, schema.lesson.orderIndex)
        .limit(1);

      if (nl) {
        nextLesson = {
          title: nl.title,
          unitTitle: nl.unitTitle || "الوحدة الدراسية",
          durationMinutes: Math.max(1, Math.round((nl.videoDurationSeconds ?? 1200) / 60)),
          slug: nl.slug,
        };
      }
    }

    // Find current homework assignment + submission
    let currentAssignment: MockHomeworkAssignment | null = null;
    let studentSubmission: MockHomeworkSubmission | undefined = undefined;

    const relevantHw = dbHomework;

    if (relevantHw.length > 0) {
      const firstHw = relevantHw[0];
      currentAssignment = {
        id: firstHw.id,
        unitId: firstHw.unitId || "",
        unitTitle: firstHw.unitTitle || "الوحدة الدراسية",
        gradeSlug: `grade-${profile?.gradeLevel ?? 1}`,
        title: firstHw.title,
        instructions: firstHw.instructions ?? "",
        pageNumber: firstHw.pageNumber ?? "",
        maxScore: firstHw.maxScore,
        dueDate: firstHw.dueDate ? firstHw.dueDate.toISOString() : "",
      };

      // Fetch student submission for this assignment
      const [sub] = await db
        .select()
        .from(schema.homeworkSubmission)
        .where(
          and(
            eq(schema.homeworkSubmission.userId, userId),
            eq(schema.homeworkSubmission.assignmentId, firstHw.id)
          )
        )
        .limit(1);

      if (sub) {
        studentSubmission = {
          id: sub.id,
          assignmentId: sub.assignmentId,
          assignmentTitle: firstHw.title,
          studentId: userId,
          studentName: "",
          studentPhone: "",
          parentPhone: profile?.parentPhoneNumber || "",
          gradeTitle: `Grade ${profile?.gradeLevel ?? 1}`,
          status: sub.status,
          score: sub.score ?? undefined,
          maxScore: firstHw.maxScore,
          feedbackNotes: sub.feedbackNotes ?? undefined,
          studentImages:
            (sub.studentImages as Array<{ pageNumber: number; imageUrl: string }>) || [],
          audioVoiceNoteUrl: sub.audioVoiceNoteUrl ?? undefined,
          annotatedImages:
            (sub.annotatedImages as Array<{ pageIndex: number; dataUrl: string }>) ?? undefined,
          submittedAt: sub.createdAt
            ? new Date(sub.createdAt).toLocaleDateString("ar-EG")
            : "اليوم",
        };
      }
    } else if (enrolledUnitIds.length === 0) {
      // Fallback to mock data for new students with no enrollments
      const fallbackAssignment = INITIAL_HOMEWORK_ASSIGNMENTS[0] ?? null;
      if (fallbackAssignment) {
        currentAssignment = fallbackAssignment;
        const fallbackSub = INITIAL_HOMEWORK_SUBMISSIONS.find(
          (s) => s.assignmentId === fallbackAssignment.id && s.studentId === userId
        );
        studentSubmission = fallbackSub;
      }
    }

    const studentGrade = profile?.gradeLevel ?? 1;
    const gradeSlug = `grade-${studentGrade}`;
    const gradeTitle = `Grade ${studentGrade} (${GRADE_NAMES[studentGrade] ?? "الصف الأول الابتدائي"})`;

    // 1. Fetch upcoming / latest Live Session for student's grade
    let liveSessionData: MockLiveSession | null = null;
    try {
      const [dbLive] = await db
        .select({
          id: schema.liveSession.id,
          gradeId: schema.liveSession.gradeId,
          gradeTitleArabic: schema.grade.titleArabic,
          gradeSlug: schema.grade.slug,
          title: schema.liveSession.title,
          description: schema.liveSession.description,
          scheduledAt: schema.liveSession.scheduledAt,
          durationMinutes: schema.liveSession.durationMinutes,
          provider: schema.liveSession.provider,
          meetingUrl: schema.liveSession.meetingUrl,
          meetingPassword: schema.liveSession.meetingPassword,
          isLiveNow: schema.liveSession.isLiveNow,
          recordingUrl: schema.liveSession.recordingUrl,
        })
        .from(schema.liveSession)
        .innerJoin(schema.grade, eq(schema.liveSession.gradeId, schema.grade.id))
        .where(eq(schema.grade.gradeNumber, studentGrade))
        .orderBy(desc(schema.liveSession.scheduledAt))
        .limit(1);

      if (dbLive) {
        liveSessionData = {
          id: dbLive.id,
          gradeId: dbLive.gradeId,
          gradeTitle: dbLive.gradeTitleArabic,
          gradeSlug: dbLive.gradeSlug,
          title: dbLive.title,
          description: dbLive.description ?? "",
          scheduledAt: dbLive.scheduledAt ? dbLive.scheduledAt.toISOString() : new Date().toISOString(),
          durationMinutes: dbLive.durationMinutes,
          provider: (dbLive.provider as "zoom" | "livekit" | "youtube_live") || "zoom",
          meetingUrl: dbLive.meetingUrl,
          meetingPassword: dbLive.meetingPassword ?? undefined,
          isLiveNow: dbLive.isLiveNow,
          recordingUrl: dbLive.recordingUrl ?? undefined,
          instructorName: "مستر أحمد الطبلاوي",
        };
      } else {
        liveSessionData = INITIAL_LIVE_SESSIONS.find((s) => s.gradeSlug === gradeSlug) ?? INITIAL_LIVE_SESSIONS[0] ?? null;
      }
    } catch {
      liveSessionData = INITIAL_LIVE_SESSIONS.find((s) => s.gradeSlug === gradeSlug) ?? INITIAL_LIVE_SESSIONS[0] ?? null;
    }

    // 2. Dynamic streak calculation from lesson progress dates
    let streakDays = 1;
    if (completedLessonIds.length > 0) {
      try {
        const progressDates = await db
          .select({ completedAt: schema.lessonProgress.completedAt })
          .from(schema.lessonProgress)
          .where(eq(schema.lessonProgress.userId, userId))
          .orderBy(desc(schema.lessonProgress.completedAt));

        const uniqueDays = new Set(
          progressDates
            .map((p) => (p.completedAt ? new Date(p.completedAt).toISOString().split("T")[0] : ""))
            .filter(Boolean)
        );

        if (uniqueDays.size > 0) {
          const dayMs = 24 * 60 * 60 * 1000;
          let currentDay = new Date();
          let count = 0;
          let currentDayStr = currentDay.toISOString().split("T")[0];

          if (!uniqueDays.has(currentDayStr)) {
            currentDay = new Date(currentDay.getTime() - dayMs);
            currentDayStr = currentDay.toISOString().split("T")[0];
          }

          while (uniqueDays.has(currentDayStr)) {
            count++;
            currentDay = new Date(currentDay.getTime() - dayMs);
            currentDayStr = currentDay.toISOString().split("T")[0];
          }
          streakDays = Math.max(1, count);
        }
      } catch {
        streakDays = 4;
      }
    }

    // 3. Dynamic active quizzes in enrolled units
    let activeQuizzesCount = 2;
    if (enrolledUnitIds.length > 0) {
      try {
        const [totalQuizzes, passedAttempts] = await Promise.all([
          db
            .select({ id: schema.quiz.id })
            .from(schema.quiz)
            .where(inArray(schema.quiz.unitId, enrolledUnitIds)),
          db
            .select({ quizId: schema.quizAttempt.quizId })
            .from(schema.quizAttempt)
            .where(
              and(
                eq(schema.quizAttempt.userId, userId),
                eq(schema.quizAttempt.passed, true)
              )
            ),
        ]);
        const passedSet = new Set(passedAttempts.map((a) => a.quizId));
        activeQuizzesCount = totalQuizzes.filter((q) => !passedSet.has(q.id)).length;
      } catch {
        activeQuizzesCount = 2;
      }
    }

    return {
      profile: profile
        ? {
            gradeLevel: studentGrade,
            gradeTitle,
            gradeSlug: `grade-${studentGrade}`,
            xpPoints: profile.xpPoints ?? 50,
            completedLessons: completedLessonIds.length,
            parentPhoneNumber: profile.parentPhoneNumber || "",
            isBanned: profile.isBanned,
          }
        : null,
      enrolledUnitIds,
      nextLesson,
      currentAssignment,
      studentSubmission,
      liveSession: liveSessionData,
      streakDays,
      activeQuizzesCount,
      isBanned: false,
      isDeviceLocked: false,
    };
  } catch (err) {
    console.warn("[data-dashboard] Failed to fetch student dashboard data:", err);
    throw err;
  }
}
