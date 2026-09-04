import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { INITIAL_UNITS, INITIAL_GRADES, INITIAL_PLATFORM_SETTINGS } from "@/lib/db/mock-data";

export async function GET() {
  try {
    // 1. Fetch live published units from database
    const dbUnits = await db
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
      .orderBy(schema.courseUnit.orderIndex);

    // Fetch lessons count for each unit
    const dbLessons = await db
      .select({
        id: schema.lesson.id,
        unitId: schema.lesson.unitId,
      })
      .from(schema.lesson);

    const formattedUnits = dbUnits.map((u) => {
      const lessonCount = dbLessons.filter((l) => l.unitId === u.id).length;
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
        lessonsCount: lessonCount || 4,
        quizzesCount: 1,
        isPublished: u.isPublished,
      };
    });

    // 2. Fetch top student champions by XP
    const topStudents = await db
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
      .limit(20);

    // 3. Fetch dynamic platform settings (branding, phones, carousel lectures)
    let settings = INITIAL_PLATFORM_SETTINGS;
    try {
      const [dbSettings] = await db
        .select()
        .from(schema.platformSettings)
        .where(eq(schema.platformSettings.id, "default"))
        .limit(1);

      if (dbSettings) {
        settings = {
          id: dbSettings.id,
          academyNameArabic: dbSettings.academyNameArabic,
          academyNameEnglish: dbSettings.academyNameEnglish,
          teacherNameArabic: dbSettings.teacherNameArabic,
          teacherNameEnglish: dbSettings.teacherNameEnglish,
          whatsappNumber: dbSettings.whatsappNumber,
          hotlineNumber: dbSettings.hotlineNumber,
          inquiriesNumber: dbSettings.inquiriesNumber,
          heroVideoUrl: dbSettings.heroVideoUrl,
          sampleLectures: dbSettings.sampleLectures || INITIAL_PLATFORM_SETTINGS.sampleLectures,
        };
      }
    } catch {
      // Fallback to initial settings
    }

    return NextResponse.json({
      success: true,
      units: formattedUnits.length > 0 ? formattedUnits : INITIAL_UNITS,
      grades: INITIAL_GRADES,
      topStudents,
      settings,
    });
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
