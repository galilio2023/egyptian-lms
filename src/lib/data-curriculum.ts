import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import {
  INITIAL_UNITS,
  INITIAL_LESSONS,
  INITIAL_QUIZ,
  type MockUnit,
  type MockLesson,
} from "@/lib/db/mock-data";
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { cache } from "react";
import { generateBunnyPlaybackUrl } from "@/lib/video/bunny";

export type CachedLesson = Omit<MockLesson, "videoUrl" | "checkpoints">;

export interface CachedUnitData {
  unit: MockUnit;
  lessons: MockLesson[];
  quizId: string;
}

export interface CachedLessonData {
  lesson: CachedLesson;
  unit: MockUnit;
  playlist: CachedLesson[];
  quizId: string;
}

export interface LessonViewerAccess {
  isAccessible: boolean;
  videoUrl?: string;
  checkpoints?: MockLesson["checkpoints"];
}

function sanitizeLessonForCache(lesson: MockLesson): CachedLesson {
  const sanitizedLesson = { ...lesson };
  delete (sanitizedLesson as Partial<MockLesson>).videoUrl;
  delete (sanitizedLesson as Partial<MockLesson>).checkpoints;
  return sanitizedLesson;
}

/**
 * Direct DB query for unit and its lessons.
 */
async function fetchUnitFromDb(unitSlug: string): Promise<CachedUnitData | null> {
  try {
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
      const [dbLessons, [dbQuiz]] = await Promise.all([
        db
          .select()
          .from(schema.lesson)
          .where(eq(schema.lesson.unitId, dbUnit.id))
          .orderBy(schema.lesson.orderIndex),
        db
          .select({ id: schema.quiz.id })
          .from(schema.quiz)
          .where(eq(schema.quiz.unitId, dbUnit.id))
          .limit(1),
      ]);

      const formattedUnit: MockUnit = {
        id: dbUnit.id,
        gradeId: dbUnit.gradeId,
        gradeSlug: dbUnit.gradeSlug || "grade-1",
        gradeTitle: dbUnit.gradeTitle || "Grade 1",
        title: dbUnit.title,
        slug: dbUnit.slug,
        description: dbUnit.description || "وحدة دراسية متكاملة.",
        thumbnailUrl:
          dbUnit.thumbnailUrl ||
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
        priceEgp: dbUnit.priceEgp ?? 250,
        lessonsCount: dbLessons.length,
        quizzesCount: 1,
        isPublished: dbUnit.isPublished,
      };

      const formattedLessons: MockLesson[] = dbLessons.map((l, idx) => ({
        id: l.id,
        unitId: l.unitId,
        title: l.title,
        slug: l.slug,
        videoDuration: `${Math.round((l.videoDurationSeconds || 1200) / 60)} دقيقة`,
        videoUrl: l.videoId?.startsWith("http")
          ? l.videoId
          : "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        pdfAttachmentUrl: l.pdfAttachmentUrl || "/worksheets/sample.pdf",
        isFreePreview: Boolean(l.isFreePreview),
        orderIndex: l.orderIndex ?? idx + 1,
        prerequisiteType: (l.prerequisiteType as MockLesson["prerequisiteType"]) || "none",
        prerequisiteLessonId: l.prerequisiteLessonId || undefined,
        checkpoints: l.checkpoints || [],
      }));

      return {
        unit: formattedUnit,
        lessons: formattedLessons,
        quizId: dbQuiz?.id || INITIAL_QUIZ.id,
      };
    }
  } catch (err) {
    console.warn("DB fetchUnitFromDb note:", err);
    throw err;
  }

  // Fallback to mock data if not in DB
  const mockUnit = INITIAL_UNITS.find((u) => u.slug === unitSlug || u.id === unitSlug);
  if (mockUnit) {
    const mockLessons = INITIAL_LESSONS.filter((l) => l.unitId === mockUnit.id);
    return {
      unit: mockUnit,
      lessons: mockLessons,
      quizId: INITIAL_QUIZ.id,
    };
  }

  return null;
}

/**
 * Direct DB query for lesson, parent unit, playlist, and quiz.
 */
async function fetchLessonFromDb(lessonSlug: string): Promise<CachedLessonData | null> {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonSlug);

    const [dbLesson] = await db
      .select()
      .from(schema.lesson)
      .where(or(eq(schema.lesson.slug, lessonSlug), ...(isUUID ? [eq(schema.lesson.id, lessonSlug)] : [])))
      .limit(1);

    if (dbLesson) {
      const [[dbUnit], dbPlaylist, [dbQuiz]] = await Promise.all([
        db
          .select({
            id: schema.courseUnit.id,
            gradeId: schema.courseUnit.gradeId,
            gradeSlug: schema.grade.slug,
            gradeTitle: schema.grade.titleEnglish,
            title: schema.courseUnit.title,
            slug: schema.courseUnit.slug,
            description: schema.courseUnit.description,
            priceEgp: schema.courseUnit.price,
            thumbnailUrl: schema.courseUnit.thumbnailUrl,
            isPublished: schema.courseUnit.isPublished,
          })
          .from(schema.courseUnit)
          .leftJoin(schema.grade, eq(schema.courseUnit.gradeId, schema.grade.id))
          .where(eq(schema.courseUnit.id, dbLesson.unitId))
          .limit(1),

        db
          .select({
            id: schema.lesson.id,
            unitId: schema.lesson.unitId,
            title: schema.lesson.title,
            slug: schema.lesson.slug,
            orderIndex: schema.lesson.orderIndex,
            isFreePreview: schema.lesson.isFreePreview,
            videoDuration: sql<string>`concat(round(coalesce(${schema.lesson.videoDurationSeconds}, 1200) / 60), ' دقيقة')`,
            pdfAttachmentUrl: schema.lesson.pdfAttachmentUrl,
          })
          .from(schema.lesson)
          .where(eq(schema.lesson.unitId, dbLesson.unitId))
          .orderBy(schema.lesson.orderIndex),

        db
          .select({ id: schema.quiz.id })
          .from(schema.quiz)
          .where(or(eq(schema.quiz.unitId, dbLesson.unitId), eq(schema.quiz.lessonId, dbLesson.id)))
          .limit(1),
      ]);

      const formattedUnit: MockUnit = dbUnit
        ? {
            id: dbUnit.id,
            gradeId: dbUnit.gradeId,
            gradeSlug: dbUnit.gradeSlug || "grade-1",
            gradeTitle: dbUnit.gradeTitle || "Grade 1",
            title: dbUnit.title,
            slug: dbUnit.slug,
            description: dbUnit.description || "وحدة دراسية متكاملة.",
            thumbnailUrl:
              dbUnit.thumbnailUrl ||
              "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
            priceEgp: dbUnit.priceEgp ?? 250,
            lessonsCount: dbPlaylist.length,
            quizzesCount: 1,
            isPublished: dbUnit.isPublished,
          }
        : INITIAL_UNITS[0];

      const formattedLesson: CachedLesson = {
        id: dbLesson.id,
        unitId: dbLesson.unitId,
        title: dbLesson.title,
        slug: dbLesson.slug,
        videoDuration: `${Math.round((dbLesson.videoDurationSeconds || 1200) / 60)} دقيقة`,
        pdfAttachmentUrl: dbLesson.pdfAttachmentUrl || "/worksheets/sample.pdf",
        isFreePreview: Boolean(dbLesson.isFreePreview),
        orderIndex: dbLesson.orderIndex || 1,
        prerequisiteType: (dbLesson.prerequisiteType as MockLesson["prerequisiteType"]) || "none",
        prerequisiteLessonId: dbLesson.prerequisiteLessonId || undefined,
      };

      const formattedPlaylist: CachedLesson[] = dbPlaylist.map((p, idx) => ({
        id: p.id,
        unitId: p.unitId,
        title: p.title,
        slug: p.slug,
        videoDuration: p.videoDuration || "20 دقيقة",
        pdfAttachmentUrl: p.pdfAttachmentUrl || "/worksheets/sample.pdf",
        isFreePreview: Boolean(p.isFreePreview),
        orderIndex: p.orderIndex ?? idx + 1,
        prerequisiteType: "none",
      }));

      return {
        lesson: formattedLesson,
        unit: formattedUnit,
        playlist: formattedPlaylist,
        quizId: dbQuiz?.id || INITIAL_QUIZ.id,
      };
    }
  } catch (err) {
    console.warn("DB fetchLessonFromDb note:", err);
    throw err;
  }

  // Fallback to mock data
  const mockLesson = INITIAL_LESSONS.find((l) => l.slug === lessonSlug || l.id === lessonSlug);
  if (mockLesson) {
    const mockUnit = INITIAL_UNITS.find((u) => u.id === mockLesson.unitId) || INITIAL_UNITS[0];
    const mockPlaylist = INITIAL_LESSONS.filter((l) => l.unitId === mockUnit.id);
    return {
      lesson: sanitizeLessonForCache(mockLesson),
      unit: mockUnit,
      playlist: mockPlaylist.map(sanitizeLessonForCache),
      quizId: INITIAL_QUIZ.id,
    };
  }

  return null;
}

/**
 * Resolves viewer-specific lesson access without placing entitlement or protected
 * playback data in the shared Data Cache.
 */
export async function getLessonViewerAccess(
  lessonId: string,
  userId?: string,
  clientIp?: string,
  isDevBypass?: boolean
): Promise<LessonViewerAccess> {
  const mockLesson = INITIAL_LESSONS.find((lesson) => lesson.id === lessonId);
  if (mockLesson) {
    if (!mockLesson.isFreePreview && !isDevBypass) {
      return { isAccessible: false };
    }

    return {
      isAccessible: true,
      videoUrl: mockLesson.videoUrl,
      checkpoints: mockLesson.checkpoints,
    };
  }

  const [dbLesson] = await db
    .select({
      unitId: schema.lesson.unitId,
      videoProvider: schema.lesson.videoProvider,
      videoId: schema.lesson.videoId,
      isFreePreview: schema.lesson.isFreePreview,
      checkpoints: schema.lesson.checkpoints,
    })
    .from(schema.lesson)
    .where(eq(schema.lesson.id, lessonId))
    .limit(1);

  if (!dbLesson) {
    return { isAccessible: false };
  }

  let isAccessible = dbLesson.isFreePreview || Boolean(isDevBypass);
  if (!isAccessible && userId) {
    const [activeEnrollment] = await db
      .select({ id: schema.enrollment.id })
      .from(schema.enrollment)
      .where(
        and(
          eq(schema.enrollment.userId, userId),
          eq(schema.enrollment.unitId, dbLesson.unitId),
          eq(schema.enrollment.isActive, true),
          or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, new Date()))
        )
      )
      .limit(1);
    isAccessible = Boolean(activeEnrollment);
  }

  if (!isAccessible) {
    return { isAccessible: false };
  }

  return {
    isAccessible: true,
    videoUrl: generateBunnyPlaybackUrl({
      provider: dbLesson.videoProvider,
      videoId: dbLesson.videoId,
      clientIp,
      expiresInSeconds: 7200,
    }),
    checkpoints: dbLesson.checkpoints || [],
  };
}

/**
 * Cached getter for a curriculum unit by slug using Next.js Data Cache.
 */
export const getCachedCurriculumUnit = cache(async (unitSlug: string): Promise<CachedUnitData | null> => {
  const getCached = unstable_cache(
    () => fetchUnitFromDb(unitSlug),
    [`unit-data-${unitSlug}`],
    {
      revalidate: 300, // 5 minutes
      tags: ["curriculum", `unit-${unitSlug}`],
    }
  );
  return getCached();
});

/**
 * Cached getter for a lesson and playlist by slug using Next.js Data Cache.
 */
export const getCachedLesson = cache(async (lessonSlug: string): Promise<CachedLessonData | null> => {
  const getCached = unstable_cache(
    () => fetchLessonFromDb(lessonSlug),
    [`lesson-data-${lessonSlug}`],
    {
      revalidate: 300, // 5 minutes
      tags: ["curriculum", `lesson-${lessonSlug}`],
    }
  );
  return getCached();
});

/**
 * Purges curriculum caches on-demand across all instances and revalidates static paths.
 */
export function revalidateCurriculumCache(options?: { unitSlug?: string; lessonSlug?: string }): void {
  try {
    revalidateTag("curriculum", { expire: 0 });
    revalidateTag("landing-data", { expire: 0 });

    if (options?.unitSlug) {
      revalidateTag(`unit-${options.unitSlug}`, { expire: 0 });
    }
    if (options?.lessonSlug) {
      revalidateTag(`lesson-${options.lessonSlug}`, { expire: 0 });
    }

    revalidatePath("/");
    revalidatePath("/courses");
    revalidatePath("/honor-board");
    revalidatePath("/quizzes");
  } catch (err) {
    console.warn("revalidateCurriculumCache note:", err);
  }
}
