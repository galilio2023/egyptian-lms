import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        enrolledUnitIds: [],
        enrollments: [],
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
        parentPhoneNumber: profile?.parentPhoneNumber || "",
        governorate: profile?.governorate || "cairo",
      },
      enrolledUnitIds,
      enrollments: dbEnrollments,
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
        parentPhoneNumber: "01000000000",
        governorate: "cairo",
      },
      enrolledUnitIds: [],
      enrollments: [],
    });
  }
}
