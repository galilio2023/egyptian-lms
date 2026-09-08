import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gt, isNull, or, inArray, notInArray, desc } from "drizzle-orm";
import {
  INITIAL_HOMEWORK_ASSIGNMENTS,
  INITIAL_HOMEWORK_SUBMISSIONS,
  type MockHomeworkAssignment,
  type MockHomeworkSubmission,
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
    isDeviceLocked: false,
  };

  try {
    const now = new Date();

    // Fetch profile, enrollments, completed lessons, and homework in parallel
    const [profile, dbEnrollments, completedLessons, dbHomework] = await Promise.all([
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

      db
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
        .orderBy(desc(schema.homeworkAssignment.createdAt))
        .limit(5),
    ]);

    if (profile?.isBanned) {
      return { ...empty, profile: null, isDeviceLocked: false };
    }

    const enrolledUnitIds = dbEnrollments
      .map((e) => e.unitId)
      .filter((id): id is string => Boolean(id));
    const completedLessonIds = completedLessons.map((p) => p.lessonId);

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

    const relevantHw = dbHomework.filter(
      (hw) => enrolledUnitIds.length === 0 || enrolledUnitIds.includes(hw.unitId || "")
    );

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
    const gradeTitle = `Grade ${studentGrade} (${GRADE_NAMES[studentGrade] ?? "الصف الأول الابتدائي"})`;

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
      isDeviceLocked: false,
    };
  } catch (err) {
    console.warn("[data-dashboard] Failed to fetch student dashboard data:", err);
    return empty;
  }
}
