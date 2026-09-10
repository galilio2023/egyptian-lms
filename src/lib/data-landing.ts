import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, count, desc, and } from "drizzle-orm";
import {
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_UNITS,
  INITIAL_GRADE_CHAMPIONS,
  type MockUnit,
  type MockGradeChampion,
} from "@/lib/db/mock-data";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { unstable_cache } from "next/cache";
import { cache } from "react";

const fetchLandingDataFromDb = async () => {
  try {
    const [dbUnits, dbLessons, dbQuizzes, settings] = await Promise.all([
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
          unitId: schema.quiz.unitId,
          quizCount: count(schema.quiz.id),
        })
        .from(schema.quiz)
        .groupBy(schema.quiz.unitId),
      getPlatformSettings(),
    ]);

    const lessonCountMap = new Map<string, number>();
    for (const row of dbLessons) {
      if (row.unitId) {
        lessonCountMap.set(row.unitId, Number(row.lessonCount));
      }
    }

    const quizCountMap = new Map<string, number>();
    for (const row of dbQuizzes) {
      if (row.unitId) {
        quizCountMap.set(row.unitId, Number(row.quizCount));
      }
    }

    const formattedUnits: MockUnit[] = dbUnits.map((u) => {
      const lessonCount = lessonCountMap.get(u.id);
      const quizCount = quizCountMap.get(u.id);
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
        lessonsCount: lessonCount !== undefined ? lessonCount : 4,
        quizzesCount: quizCount !== undefined ? quizCount : 1,
        isPublished: u.isPublished,
      };
    });

    return {
      units: formattedUnits.length > 0 ? formattedUnits : INITIAL_UNITS,
      settings,
    };
  } catch (err) {
    console.warn("Server-side landing data fetch fallback:", err);
    return {
      units: INITIAL_UNITS,
      settings: INITIAL_PLATFORM_SETTINGS,
    };
  }
};

/**
 * Cached landing page data getter (unstable_cache).
 * Purged on-demand via revalidateTag('landing-data') or revalidateTag('curriculum').
 */
const getCachedLandingPageData = unstable_cache(
  fetchLandingDataFromDb,
  ["landing-page-data-key"],
  {
    revalidate: 300, // 5 minutes
    tags: ["landing-data", "curriculum", "platform-settings"],
  }
);

/**
 * Request-memoized landing page data getter.
 * Deduplicates multiple calls between generateMetadata and page components.
 */
export const getLandingPageData = cache(async () => {
  return getCachedLandingPageData();
});

/**
 * Retrieves the top 3 students by XP per grade level for the honor roll.
 * Queries live student profiles from the database and falls back to INITIAL_GRADE_CHAMPIONS.
 */
export const getHonorBoardChampions = cache(async (): Promise<Record<string, MockGradeChampion[]>> => {
  try {
    const topStudents = await db
      .select({
        name: schema.user.name,
        gradeLevel: schema.studentProfile.gradeLevel,
        schoolName: schema.studentProfile.schoolName,
        governorate: schema.studentProfile.governorate,
        xpPoints: schema.studentProfile.xpPoints,
      })
      .from(schema.studentProfile)
      .innerJoin(schema.user, eq(schema.studentProfile.userId, schema.user.id))
      .where(
        and(
          eq(schema.studentProfile.isBanned, false),
          eq(schema.user.role, "student")
        )
      )
      .orderBy(desc(schema.studentProfile.xpPoints))
      .limit(60);

    if (topStudents.length === 0) {
      return INITIAL_GRADE_CHAMPIONS;
    }

    const championsMap: Record<string, MockGradeChampion[]> = { ...INITIAL_GRADE_CHAMPIONS };

    for (let gradeNum = 1; gradeNum <= 6; gradeNum++) {
      const gradeSlug = `grade-${gradeNum}`;
      const gradeStudents = topStudents.filter((s) => s.gradeLevel === gradeNum);
      if (gradeStudents.length > 0) {
        championsMap[gradeSlug] = gradeStudents.slice(0, 3).map((s, idx) => {
          const nameParts = s.name.trim().split(/\s+/);
          const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}.${nameParts[nameParts.length - 1][0]}`
            : s.name.slice(0, 2);
          return {
            rank: (idx + 1) as 1 | 2 | 3,
            name: s.name,
            initials,
            gradeBadge: `Grade ${gradeNum}`,
            schoolName: s.schoolName || "مدرسة لغات",
            city: s.governorate || "القاهرة",
            xpPoints: s.xpPoints,
          };
        });
      }
    }

    return championsMap;
  } catch (err) {
    console.warn("Honor board champions DB query fallback:", err);
    return INITIAL_GRADE_CHAMPIONS;
  }
});

