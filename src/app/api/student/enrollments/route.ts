import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { and, eq, gt, inArray, isNull, notInArray, or } from "drizzle-orm";

export async function GET() {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        enrolledUnitIds: [],
        enrollments: [],
        nextLesson: null,
      });
    }

    const now = new Date();

    // Query active and non-expired student enrollments from database
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
          eq(schema.enrollment.userId, session.user.id),
          eq(schema.enrollment.isActive, true),
          or(
            isNull(schema.enrollment.expiresAt),
            gt(schema.enrollment.expiresAt, now)
          )
        )
      );

    // Fetch student profile details (grade level, xp, etc.)
    const [profile] = await db
      .select()
      .from(schema.studentProfile)
      .where(eq(schema.studentProfile.userId, session.user.id))
      .limit(1);

    const enrolledUnitIds = dbEnrollments.map((e) => e.unitId);
    const completedLessons = await db
      .select({ lessonId: schema.lessonProgress.lessonId })
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.userId, session.user.id));
    const completedLessonIds = completedLessons.map((progress) => progress.lessonId);

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

    const gradeNames: Record<number, string> = {
      1: "الصف الأول الابتدائي",
      2: "الصف الثاني الابتدائي",
      3: "الصف الثالث الابتدائي",
      4: "الصف الرابع الابتدائي",
      5: "الصف الخامس الابتدائي",
      6: "الصف السادس الابتدائي",
    };

    const studentGrade = profile?.gradeLevel || 1;
    const gradeTitle = `Grade ${studentGrade} (${gradeNames[studentGrade] || "الصف الأول الابتدائي"})`;

    return NextResponse.json({
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
    });
  } catch (error: unknown) {
    console.error("Student enrollments fetch error:", error);
    return NextResponse.json({
      success: true,
      profile: {
        gradeLevel: 1,
        gradeTitle: "Grade 1 (الصف الأول الابتدائي)",
        gradeSlug: "grade-1",
        xpPoints: 450,
        completedLessons: 0,
        parentPhoneNumber: "01000000000",
        governorate: "cairo",
      },
      enrolledUnitIds: [],
      enrollments: [],
      nextLesson: null,
    });
  }
}
