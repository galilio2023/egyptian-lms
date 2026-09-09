import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { and, eq, gt, inArray, isNull, notInArray, or } from "drizzle-orm";

export interface StudentEnrollmentsResult {
  success: boolean;
  isDeviceLocked?: boolean;
  requiresParentTransfer?: boolean;
  isBanned?: boolean;
  error?: string;
  profile: {
    gradeLevel: number;
    gradeTitle: string;
    gradeSlug: string;
    xpPoints: number;
    completedLessons: number;
    parentPhoneNumber: string;
    governorate: string;
  };
  enrolledUnitIds: string[];
  enrollments: Array<{
    id: string;
    unitId: string;
    unitTitle: string | null;
    unitSlug: string | null;
    enrolledAt: Date;
    expiresAt: Date | null;
  }>;
  nextLesson: {
    title: string;
    unitTitle: string;
    durationMinutes: number;
    slug: string;
  } | null;
}

const GRADE_NAMES_ARABIC: Record<number, string> = {
  1: "الصف الأول الابتدائي",
  2: "الصف الثاني الابتدائي",
  3: "الصف الثالث الابتدائي",
  4: "الصف الرابع الابتدائي",
  5: "الصف الخامس الابتدائي",
  6: "الصف السادس الابتدائي",
};

/**
 * Retrieves student profile, active unit enrollments, and calculates the next lesson.
 * Enforces single-device restrictions and account ban states.
 */
export async function getStudentEnrollmentsData(params: {
  userId: string;
  clientDeviceId: string | null;
  sessionDeviceId?: string | null;
  sessionId?: string;
}): Promise<StudentEnrollmentsResult> {
  const { userId, clientDeviceId, sessionDeviceId, sessionId } = params;
  const now = new Date();

  // 1. Enforce single-device restriction on active portal requests
  if (sessionDeviceId) {
    if (!clientDeviceId || sessionDeviceId !== clientDeviceId) {
      return {
        success: false,
        error: "حساب الطالب مسجل ومفتوح على جهاز آخر أو تعذر التحقق من هوية جهازك. يرجى تسجيل الدخول من جهازك المعتمد.",
        isDeviceLocked: true,
        requiresParentTransfer: true,
        profile: {
          gradeLevel: 1,
          gradeTitle: "الصف الأول الابتدائي",
          gradeSlug: "grade-1",
          xpPoints: 0,
          completedLessons: 0,
          parentPhoneNumber: "",
          governorate: "cairo",
        },
        enrolledUnitIds: [],
        enrollments: [],
        nextLesson: null,
      };
    }
  }

  // 2. Bind current device to session if not yet bound
  if (!sessionDeviceId && clientDeviceId && sessionId) {
    try {
      await db
        .update(schema.session)
        .set({ deviceId: clientDeviceId, updatedAt: new Date() })
        .where(eq(schema.session.id, sessionId));
    } catch {
      // Non-blocking fallback
    }
  }

  // 3. Fetch student profile details (grade level, xp, ban status)
  const [profile] = await db
    .select()
    .from(schema.studentProfile)
    .where(eq(schema.studentProfile.userId, userId))
    .limit(1);

  if (profile?.isBanned) {
    return {
      success: false,
      error: "تم إيقاف هذا الحساب مؤقتاً لمخالفة شروط الاستخدام.",
      isBanned: true,
      profile: {
        gradeLevel: profile.gradeLevel || 1,
        gradeTitle: "الصف الأول الابتدائي",
        gradeSlug: "grade-1",
        xpPoints: profile.xpPoints || 0,
        completedLessons: 0,
        parentPhoneNumber: profile.parentPhoneNumber || "",
        governorate: profile.governorate || "cairo",
      },
      enrolledUnitIds: [],
      enrollments: [],
      nextLesson: null,
    };
  }

  // 4. Query active and non-expired student enrollments
  const dbEnrollments = await db
    .select({
      id: schema.enrollment.id,
      unitId: schema.enrollment.unitId,
      unitTitle: schema.courseUnit.title,
      unitSlug: schema.courseUnit.slug,
      enrolledAt: schema.enrollment.enrolledAt,
      expiresAt: schema.enrollment.expiresAt,
    })
    .from(schema.enrollment)
    .leftJoin(schema.courseUnit, eq(schema.enrollment.unitId, schema.courseUnit.id))
    .where(
      and(
        eq(schema.enrollment.userId, userId),
        eq(schema.enrollment.isActive, true),
        or(
          isNull(schema.enrollment.expiresAt),
          gt(schema.enrollment.expiresAt, now)
        )
      )
    );

  const enrolledUnitIds = dbEnrollments.map((e) => e.unitId);

  // 5. Query completed lessons for this student
  const completedLessons = await db
    .select({ lessonId: schema.lessonProgress.lessonId })
    .from(schema.lessonProgress)
    .where(eq(schema.lessonProgress.userId, userId));
  const completedLessonIds = completedLessons.map((progress) => progress.lessonId);

  // 6. Find next lesson in chronological syllabus order
  const [nextLesson] = enrolledUnitIds.length > 0
    ? await db
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
        .limit(1)
    : [];

  const studentGrade = profile?.gradeLevel || 1;
  const gradeTitle = `Grade ${studentGrade} (${GRADE_NAMES_ARABIC[studentGrade] || "الصف الأول الابتدائي"})`;

  return {
    success: true,
    profile: {
      gradeLevel: studentGrade,
      gradeTitle,
      gradeSlug: `grade-${studentGrade}`,
      xpPoints: profile?.xpPoints ?? 50,
      completedLessons: completedLessonIds.length,
      parentPhoneNumber: profile?.parentPhoneNumber || "",
      governorate: profile?.governorate || "cairo",
    },
    enrolledUnitIds,
    enrollments: dbEnrollments,
    nextLesson: nextLesson
      ? {
          title: nextLesson.title,
          unitTitle: nextLesson.unitTitle,
          durationMinutes: Math.max(1, Math.round((nextLesson.videoDurationSeconds ?? 1200) / 60)),
          slug: nextLesson.slug,
        }
      : null,
  };
}
