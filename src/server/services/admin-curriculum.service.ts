import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { revalidateCurriculumCache } from "@/lib/data-curriculum";

export interface CreateUnitPayload {
  gradeSlug: string;
  title: string;
  priceEgp?: number;
  description?: string;
  thumbnailUrl?: string;
}

export interface CreateLessonPayload {
  unitId: string;
  title: string;
  videoId: string;
  videoDurationSeconds?: number;
  pdfAttachmentUrl?: string;
  isFreePreview?: boolean;
  prerequisiteType?: string;
  prerequisiteLessonId?: string;
}

export interface CreateQuestionPayload {
  quizId?: string;
  text: string;
  audioUrl?: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation?: string;
  points?: number;
}

export async function getCurriculumData() {
  try {
    const [dbUnits, dbLessons, dbQuizzes] = await Promise.all([
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
          isPublished: schema.courseUnit.isPublished,
          orderIndex: schema.courseUnit.orderIndex,
        })
        .from(schema.courseUnit)
        .leftJoin(schema.grade, eq(schema.courseUnit.gradeId, schema.grade.id))
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
    ]);

    const lessonCountMap = new Map(dbLessons.map((l) => [l.unitId, Number(l.lessonCount)]));
    const quizCountMap = new Map(dbQuizzes.map((q) => [q.unitId, Number(q.quizCount)]));

    return dbUnits.map((u) => ({
      id: u.id,
      gradeId: u.gradeId,
      gradeSlug: u.gradeSlug || "grade-1",
      gradeTitle: u.gradeTitle || "Grade 1",
      title: u.title,
      slug: u.slug,
      description: u.description || "",
      thumbnailUrl: u.thumbnailUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
      priceEgp: u.priceEgp || 250,
      lessonsCount: lessonCountMap.get(u.id) || 4,
      quizzesCount: quizCountMap.get(u.id) || 1,
      isPublished: u.isPublished,
    }));
  } catch (err) {
    console.warn("Curriculum fetch DB note:", err);
    return [];
  }
}

export async function getLessonsData() {
  try {
    const dbLessons = await db
      .select()
      .from(schema.lesson)
      .orderBy(schema.lesson.orderIndex);

    return dbLessons.map((l) => ({
      id: l.id,
      unitId: l.unitId,
      title: l.title,
      slug: l.slug,
      videoUrl: l.videoId,
      videoDurationSeconds: l.videoDurationSeconds,
      pdfAttachmentUrl: l.pdfAttachmentUrl,
      isFreePreview: l.isFreePreview,
      orderIndex: l.orderIndex,
    }));
  } catch (err) {
    console.warn("Lessons fetch DB note:", err);
    return [];
  }
}

export async function getQuizzesData() {
  try {
    const dbQuestions = await db
      .select()
      .from(schema.quizQuestion)
      .orderBy(schema.quizQuestion.orderIndex);

    return dbQuestions.map((q) => ({
      id: q.id,
      quizId: q.quizId,
      text: q.questionText,
      audioUrl: q.questionAudioUrl || undefined,
      options: q.options as Array<{ id: string; text: string; isCorrect: boolean }>,
      explanation: q.explanation || "",
      points: q.points || 1,
    }));
  } catch (err) {
    console.warn("Quizzes fetch DB note:", err);
    return [];
  }
}

export async function createUnit(payload: CreateUnitPayload) {
  const { gradeSlug, title, priceEgp, description, thumbnailUrl } = payload;

  const [gradeRecord] = await db
    .select()
    .from(schema.grade)
    .where(eq(schema.grade.slug, gradeSlug || "grade-1"))
    .limit(1);

  if (!gradeRecord) {
    throw new Error("المرحلة الدراسية غير موجودة");
  }

  const unitSlug = `${gradeSlug}-unit-${Date.now()}`;
  const [inserted] = await db.insert(schema.courseUnit).values({
    gradeId: gradeRecord.id,
    title: title.trim(),
    slug: unitSlug,
    description: description?.trim() || null,
    thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
    price: Number(priceEgp) || 250,
    isPublished: true,
    orderIndex: 1,
  }).returning();

  revalidateCurriculumCache({ unitSlug });

  return {
    success: true,
    unit: inserted,
    message: "تم حفظ ونشر الوحدة الدراسية بنجاح في قاعدة البيانات.",
  };
}

export async function deleteUnit(unitId: string) {
  if (!unitId) throw new Error("معرف الوحدة مطلوب");
  await db.delete(schema.courseUnit).where(eq(schema.courseUnit.id, unitId));
  revalidateCurriculumCache();
  return { success: true, message: "تم حذف الوحدة الدراسية بنجاح." };
}

export async function createLesson(payload: CreateLessonPayload) {
  const { unitId, title, videoId, videoDurationSeconds, pdfAttachmentUrl, isFreePreview, prerequisiteType, prerequisiteLessonId } = payload;

  const lessonSlug = `lesson-${Date.now()}`;
  const inserted = await db.transaction(async (tx) => {
    try {
      await tx.execute(sql`SELECT id FROM ${schema.courseUnit} WHERE id = ${unitId} FOR UPDATE`);
    } catch {
      // Row locking fallback
    }

    const [maxOrder] = await tx
      .select({ maxOrder: sql<number>`COALESCE(MAX(${schema.lesson.orderIndex}), 0)` })
      .from(schema.lesson)
      .where(eq(schema.lesson.unitId, unitId));

    const nextOrderIndex = Number(maxOrder?.maxOrder || 0) + 1;

    const [newLesson] = await tx.insert(schema.lesson).values({
      unitId,
      title: title.trim(),
      slug: lessonSlug,
      videoProvider: "bunny",
      videoId: videoId.trim(),
      videoDurationSeconds: videoDurationSeconds || 1200,
      pdfAttachmentUrl: pdfAttachmentUrl || null,
      isFreePreview: Boolean(isFreePreview),
      prerequisiteType: prerequisiteType || "none",
      prerequisiteLessonId: prerequisiteLessonId || null,
      orderIndex: nextOrderIndex,
    }).returning();

    return newLesson;
  });

  revalidateCurriculumCache({ lessonSlug });

  return {
    success: true,
    lesson: inserted,
    message: "تم حفظ المحاضرة ورفعها بنجاح.",
  };
}

export async function deleteLesson(lessonId: string) {
  if (!lessonId) throw new Error("معرف المحاضرة مطلوب");
  await db.delete(schema.lesson).where(eq(schema.lesson.id, lessonId));
  revalidateCurriculumCache();
  return { success: true, message: "تم حذف المحاضرة بنجاح." };
}

export async function createQuestion(payload: CreateQuestionPayload) {
  const { quizId, text, audioUrl, options, explanation, points } = payload;

  let targetQuizId = quizId;
  if (!targetQuizId) {
    const [anyQuiz] = await db.select().from(schema.quiz).limit(1);
    if (anyQuiz) targetQuizId = anyQuiz.id;
  }

  if (!targetQuizId) {
    throw new Error("لم يتم العثور على اختبار لربط السؤال به");
  }

  const [inserted] = await db.insert(schema.quizQuestion).values({
    quizId: targetQuizId,
    questionText: text.trim(),
    questionAudioUrl: audioUrl || null,
    options,
    explanation: explanation?.trim() || "إجابة صحيحة وفقاً للمنهج.",
    points: points || 1,
    orderIndex: 1,
  }).returning();

  return {
    success: true,
    question: inserted,
    message: "تمت إضافة السؤال بنجاح إلى بنك الأسئلة المركزي.",
  };
}

export async function deleteQuestion(questionId: string) {
  if (!questionId) throw new Error("معرف السؤال مطلوب");
  await db.delete(schema.quizQuestion).where(eq(schema.quizQuestion.id, questionId));
  return { success: true, message: "تم حذف السؤال بنجاح من بنك الأسئلة." };
}
