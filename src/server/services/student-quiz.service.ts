import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt, sql } from "drizzle-orm";
import { INITIAL_QUIZ, ADVENTURE_QUIZZES_MAP } from "@/lib/db/mock-data";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { UnauthorizedError, ForbiddenError } from "@/server/errors";

// Deterministic seeded shuffle per student session
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const a = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = a.length - 1; i > 0; i--) {
    hash = (hash << 5) - hash + i;
    hash |= 0;
    const j = Math.abs(hash) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface StudentQuizDto {
  id: string;
  title: string;
  timeLimitMinutes: number;
  passPercentage: number;
  poolSize?: number;
  questions: Array<{
    id: string;
    text: string;
    audioUrl?: string | null;
    options: Array<{ id: string; text: string }>;
  }>;
}

/**
 * Retrieves quiz questions for a student with correct answers stripped and options shuffled.
 * Validates active unit enrollments for proprietary curriculum quizzes.
 */
export async function getQuizForStudent(
  quizId: string,
  userId?: string | null,
  clientIp?: string
): Promise<StudentQuizDto | null> {
  const studentSeed = `${userId || clientIp || "guest"}_${quizId}`;

  // 1. Check static INITIAL_QUIZ
  if (quizId === INITIAL_QUIZ.id) {
    const safeQuestions = seededShuffle(INITIAL_QUIZ.questions, studentSeed).map((q) => ({
      id: q.id,
      text: q.text,
      audioUrl: q.audioUrl,
      options: seededShuffle(q.options, `${studentSeed}_${q.id}`).map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    }));

    return {
      id: INITIAL_QUIZ.id,
      title: INITIAL_QUIZ.title,
      timeLimitMinutes: INITIAL_QUIZ.timeLimitMinutes,
      passPercentage: INITIAL_QUIZ.passPercentage,
      questions: safeQuestions,
    };
  }

  // 2. Check adventure quizzes map
  const advQuiz = ADVENTURE_QUIZZES_MAP[quizId];
  if (advQuiz) {
    const safeQuestions = seededShuffle(advQuiz.questions, studentSeed).map((q) => ({
      id: q.id,
      text: q.text,
      audioUrl: q.audioUrl,
      options: seededShuffle(q.options, `${studentSeed}_${q.id}`).map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    }));

    return {
      id: advQuiz.id,
      title: advQuiz.title,
      timeLimitMinutes: advQuiz.timeLimitMinutes,
      passPercentage: advQuiz.passPercentage,
      questions: safeQuestions,
    };
  }

  // 3. Database quiz lookup
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quizId);
  if (!isUUID) return null;

  const [dbQuiz] = await db
    .select()
    .from(schema.quiz)
    .where(eq(schema.quiz.id, quizId))
    .limit(1);

  if (!dbQuiz) return null;

  // Entitlement Check: If quiz belongs to a course unit, student must be enrolled
  if (dbQuiz.unitId) {
    const now = new Date();
    if (!userId) {
      throw new UnauthorizedError("يجب تسجيل الدخول والاشتراك في الوحدة الدراسية لخوض هذا الاختبار.");
    }

    const [activeEnrollment] = await db
      .select({ id: schema.enrollment.id })
      .from(schema.enrollment)
      .where(
        and(
          eq(schema.enrollment.userId, userId),
          eq(schema.enrollment.unitId, dbQuiz.unitId),
          eq(schema.enrollment.isActive, true),
          or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
        )
      )
      .limit(1);

    if (!activeEnrollment) {
      throw new ForbiddenError("عذراً، هذا الاختبار مخصص للطلاب المشتركين بالوحدة فقط. يرجى تفعيل الوحدة أولاً.");
    }
  }

  const dbQuestions = await db
    .select()
    .from(schema.quizQuestion)
    .where(eq(schema.quizQuestion.quizId, dbQuiz.id));

  let selectedQuestions = dbQuestions;
  if (dbQuiz.poolSize && dbQuiz.poolSize > 0 && dbQuiz.poolSize < dbQuestions.length) {
    const shuffled = seededShuffle(dbQuestions, studentSeed);
    selectedQuestions = shuffled.slice(0, dbQuiz.poolSize);
  } else {
    selectedQuestions = seededShuffle(dbQuestions, studentSeed);
  }

  const safeQuestions = selectedQuestions.map((q) => {
    const opts = (q.options as Array<{ id: string; text: string; isCorrect?: boolean }>) || [];
    const shuffledOpts = seededShuffle(opts, `${studentSeed}_${q.id}`);
    return {
      id: q.id,
      text: q.questionText,
      audioUrl: q.questionAudioUrl,
      options: shuffledOpts.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    };
  });

  return {
    id: dbQuiz.id,
    title: dbQuiz.title,
    timeLimitMinutes: dbQuiz.timeLimitMinutes,
    passPercentage: dbQuiz.passPercentage,
    poolSize: dbQuiz.poolSize || undefined,
    questions: safeQuestions,
  };
}

export interface GradeQuizParams {
  quizId: string;
  answers: Record<string, string>;
  targetUserId: string | null;
  studentName?: string;
  studentPhone?: string;
  timeSpentSeconds?: number;
  clientIp?: string;
}

export interface MissedConceptDto {
  id: string;
  word: string;
  phonics: string;
  arabicMeaning: string;
  exampleSentence: string;
  category: string;
}

export type GradeQuizResult =
  | {
      success: false;
      error: string;
      maxAttemptsReached: boolean;
      attemptsCount: number;
      maxAttempts: number;
    }
  | {
      success: true;
      score: number;
      total: number;
      percentage: number;
      passed: boolean;
      earnedXp: number;
      alreadyPassed: boolean;
      remainingAttempts: number;
      maxAttempts: number;
      results: Record<string, { correct: boolean; correctAnswerId: string; explanation: string }>;
      missedConcepts: MissedConceptDto[];
      whatsappAutoDelivery: { success: boolean; simulated?: boolean };
      parentNotification: { parentPhone: string; whatsappUrl: string; messageText: string } | null;
    };

/**
 * Grades student quiz answers on the server, verifies attempts, persists results, and alerts parents via WhatsApp.
 */
export async function gradeQuizForStudent(params: GradeQuizParams): Promise<GradeQuizResult> {
  const {
    quizId,
    answers,
    targetUserId,
    studentName = "بطل أكاديمية إيليت",
    studentPhone,
    timeSpentSeconds = 0,
    clientIp = "127.0.0.1",
  } = params;

  let quiz = ADVENTURE_QUIZZES_MAP[quizId] || INITIAL_QUIZ;
  let questionsList: Array<{ id: string; text: string; options: Array<{ id: string; text: string; isCorrect: boolean }>; explanation: string; audioUrl?: string | null }> = quiz.questions;
  let maxAttempts = 3;
  let existingAttempts: Array<{ id: string; passed: boolean; score: number }> = [];
  let dbQuizRecord: typeof schema.quiz.$inferSelect | null = null;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quizId);

  if (isUUID) {
    const [dbQuiz] = await db
      .select()
      .from(schema.quiz)
      .where(eq(schema.quiz.id, quizId))
      .limit(1);

    if (dbQuiz) {
      dbQuizRecord = dbQuiz;
      maxAttempts = dbQuiz.maxAttempts ?? 3;

      if (dbQuiz.unitId && targetUserId) {
        const now = new Date();
        const [activeEnrollment] = await db
          .select({ id: schema.enrollment.id })
          .from(schema.enrollment)
          .where(
            and(
              eq(schema.enrollment.userId, targetUserId),
              eq(schema.enrollment.unitId, dbQuiz.unitId),
              eq(schema.enrollment.isActive, true),
              or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
            )
          )
          .limit(1);

        if (!activeEnrollment) {
          throw new ForbiddenError("يجب الاشتراك وتفعيل الوحدة الدراسية لتسجيل درجات الاختبار والتقدم.");
        }
      }

      if (targetUserId) {
        existingAttempts = await db
          .select({
            id: schema.quizAttempt.id,
            passed: schema.quizAttempt.passed,
            score: schema.quizAttempt.score,
          })
          .from(schema.quizAttempt)
          .where(
            and(
              eq(schema.quizAttempt.quizId, dbQuiz.id),
              eq(schema.quizAttempt.userId, targetUserId)
            )
          );

        if (existingAttempts.length >= maxAttempts) {
          logSecurityEvent({
            eventType: "quiz_max_attempts_blocked",
            severity: "low",
            userId: targetUserId,
            studentPhone,
            ipAddress: clientIp,
            description: `محاولة أداء اختبار بعد استنفاذ الحد الأقصى للمحاولات (${maxAttempts} محاولات).`,
            details: { quizId: dbQuiz.id, attemptsCount: existingAttempts.length, maxAttempts },
          });

          return {
            success: false,
            error: `لقد استنفدت الحد الأقصى للمحاولات المسموح بها لهذا الاختبار (${maxAttempts} محاولات). يرجى مراجعة المعلم لإعادة فتح المحاولة.`,
            maxAttemptsReached: true,
            attemptsCount: existingAttempts.length,
            maxAttempts,
          };
        }
      }

      const dbQuestions = await db
        .select()
        .from(schema.quizQuestion)
        .where(eq(schema.quizQuestion.quizId, dbQuiz.id));

      const studentSeed = `${targetUserId || clientIp || "guest"}_${dbQuiz.id}`;
      let selectedQuestions = dbQuestions;
      if (dbQuiz.poolSize && dbQuiz.poolSize > 0 && dbQuiz.poolSize < dbQuestions.length) {
        const shuffled = seededShuffle(dbQuestions, studentSeed);
        selectedQuestions = shuffled.slice(0, dbQuiz.poolSize);
      }

      if (selectedQuestions.length > 0) {
        quiz = {
          id: dbQuiz.id,
          unitId: dbQuiz.unitId || "",
          lessonId: dbQuiz.lessonId || undefined,
          title: dbQuiz.title,
          timeLimitMinutes: dbQuiz.timeLimitMinutes,
          passPercentage: dbQuiz.passPercentage,
          questions: selectedQuestions.map((q) => ({
            id: q.id,
            text: q.questionText,
            audioUrl: q.questionAudioUrl || undefined,
            options: q.options as Array<{ id: string; text: string; isCorrect: boolean }>,
            explanation: q.explanation || "إجابة صحيحة وفقاً للمنهج.",
          })),
        };
        questionsList = quiz.questions;
      }
    }
  }

  let correctCount = 0;
  const results: Record<string, { correct: boolean; correctAnswerId: string; explanation: string }> = {};
  const missedConcepts: MissedConceptDto[] = [];

  questionsList.forEach((q) => {
    const selectedId = answers[q.id];
    const correctOption = q.options.find((opt) => opt.isCorrect);
    const isCorrect = correctOption ? selectedId === correctOption.id : false;

    if (isCorrect) {
      correctCount++;
    } else {
      const targetWord = correctOption?.text || q.text;
      missedConcepts.push({
        id: `remedial-${q.id}`,
        word: targetWord,
        phonics: q.audioUrl ? "استمع للنطق الصوتي الصحيح 🎙️" : "مراجعة نطق وتثبيت الكلمة 🔤",
        arabicMeaning: q.explanation || "مفهوم تم اختباره في الكويز ويحتاج إلى مراجعة",
        exampleSentence: `سؤال: ${q.text} ➜ الإجابة الصحيحة: ${correctOption?.text || ""}`,
        category: `مراجعة كويز: ${quiz.title}`,
      });
    }

    results[q.id] = {
      correct: isCorrect,
      correctAnswerId: correctOption?.id || "",
      explanation: q.explanation,
    };
  });

  const totalQuestions = questionsList.length || 1;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= quiz.passPercentage;

  const alreadyPassed = existingAttempts.some((a) => a.passed);
  let earnedXp = 0;
  if (!alreadyPassed) {
    earnedXp = passed ? correctCount * 25 + 50 : correctCount * 10;
  }

  if (targetUserId) {
    try {
      await db.transaction(async (tx) => {
        if (dbQuizRecord) {
          await tx.insert(schema.quizAttempt).values({
            quizId: dbQuizRecord.id,
            userId: targetUserId,
            score: correctCount,
            totalPossibleScore: totalQuestions,
            passed,
            timeSpentSeconds: timeSpentSeconds || 60,
            userAnswers: answers,
          });
        }

        if (earnedXp > 0) {
          await tx
            .update(schema.studentProfile)
            .set({
              xpPoints: sql`COALESCE(${schema.studentProfile.xpPoints}, 0) + ${earnedXp}`,
            })
            .where(eq(schema.studentProfile.userId, targetUserId));
        }
      });
    } catch (txErr) {
      console.warn("Quiz attempt persistence DB note:", txErr);
    }
  }

  let verifiedParentPhone: string | null = null;
  if (targetUserId) {
    try {
      const [profile] = await db
        .select({ parentPhoneNumber: schema.studentProfile.parentPhoneNumber })
        .from(schema.studentProfile)
        .where(eq(schema.studentProfile.userId, targetUserId))
        .limit(1);

      if (profile?.parentPhoneNumber) {
        const digits = profile.parentPhoneNumber.replace(/\D/g, "");
        if (digits.length === 10 || digits.length === 11) {
          verifiedParentPhone = digits;
        }
      }
    } catch (profileErr) {
      console.warn("Could not query verified student profile:", profileErr);
    }
  }

  let whatsappAutoDelivery: { success: boolean; simulated?: boolean } = { success: false };
  let parentNotification: { parentPhone: string; whatsappUrl: string; messageText: string } | null = null;

  if (verifiedParentPhone) {
    const settings = await getPlatformSettings();
    const rawTextMessage = 
      `🌟 *تقرير مستوى الطالب - ${settings.academyNameArabic}*\n` +
      `👤 *اسم الطالب:* ${studentName}\n` +
      `📝 *الاختبار:* ${quiz.title}\n` +
      `🎯 *الدرجة:* ${correctCount} من ${totalQuestions} (%${percentage})\n` +
      `📊 *الحالة:* ${passed ? "اجتاز الاختبار بنجاح وامتياز 🎉" : "يحتاج إلى مراجعة المحاضرة وإعادة المحاولة 💪"}\n` +
      `⭐ *النقاط المكتسبة:* +${earnedXp} XP\n` +
      `👨‍🏫 *المشرف:* ${settings.teacherNameArabic}`;
    const whatsappMessage = encodeURIComponent(rawTextMessage);

    try {
      whatsappAutoDelivery = await sendAutomatedWhatsAppNotification({
        to: verifiedParentPhone,
        message: rawTextMessage,
      });
    } catch (err) {
      console.warn("Automated WhatsApp dispatch note:", err);
    }

    parentNotification = {
      parentPhone: verifiedParentPhone,
      whatsappUrl: `https://wa.me/2${verifiedParentPhone}?text=${whatsappMessage}`,
      messageText: rawTextMessage,
    };
  }

  const remainingAttempts = Math.max(0, maxAttempts - (existingAttempts.length + 1));

  return {
    success: true,
    score: correctCount,
    total: totalQuestions,
    percentage,
    passed,
    earnedXp,
    alreadyPassed,
    remainingAttempts,
    maxAttempts,
    results,
    missedConcepts,
    whatsappAutoDelivery,
    parentNotification,
  };
}
