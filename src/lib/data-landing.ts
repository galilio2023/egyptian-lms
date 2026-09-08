import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { INITIAL_UNITS, type MockUnit } from "@/lib/db/mock-data";
import { getPlatformSettings } from "@/lib/utils/platform-settings";

export async function getLandingPageData() {
  try {
    const [dbUnits, dbLessons, settings] = await Promise.all([
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
          id: schema.lesson.id,
          unitId: schema.lesson.unitId,
        })
        .from(schema.lesson),
      getPlatformSettings(),
    ]);

    const formattedUnits: MockUnit[] = dbUnits.map((u) => {
      const lessonCount = dbLessons.filter((l) => l.unitId === u.id).length;
      return {
        id: u.id,
        gradeId: u.gradeId,
        gradeSlug: u.gradeSlug || "grade-1",
        gradeTitle: u.gradeTitle || "Grade 1",
        title: u.title,
        slug: u.slug,
        description: u.description || "وحدة دراسية متكاملة بالصوتيات والاختبارات.",
        thumbnailUrl:
          u.thumbnailUrl ||
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
        priceEgp: u.priceEgp || 250,
        lessonsCount: lessonCount || 4,
        quizzesCount: 1,
        isPublished: u.isPublished,
      };
    });

    return {
      units: formattedUnits.length > 0 ? formattedUnits : INITIAL_UNITS,
      settings,
    };
  } catch (err) {
    console.warn("Server-side landing data fetch fallback:", err);
    const settings = await getPlatformSettings();
    return {
      units: INITIAL_UNITS,
      settings,
    };
  }
}
