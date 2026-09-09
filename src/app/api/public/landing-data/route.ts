import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { INITIAL_UNITS, INITIAL_GRADES, INITIAL_PLATFORM_SETTINGS } from "@/lib/db/mock-data";
import { getPlatformSettings } from "@/lib/utils/platform-settings";

export async function GET() {
  try {
    // Concurrently fetch units, lessons count, leaderboard, and platform settings
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

    return NextResponse.json(
      {
        success: true,
        units: formattedUnits.length > 0 ? formattedUnits : INITIAL_UNITS,
        grades: INITIAL_GRADES,
        topStudents,
        settings,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    console.warn("Public landing data DB fallback:", err);
    return NextResponse.json({
      success: true,
      units: INITIAL_UNITS,
      grades: INITIAL_GRADES,
      topStudents: [],
      settings: INITIAL_PLATFORM_SETTINGS,
    });
  }
}
