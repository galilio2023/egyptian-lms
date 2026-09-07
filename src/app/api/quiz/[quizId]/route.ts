import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { INITIAL_QUIZ, ADVENTURE_QUIZZES_MAP } from "@/lib/db/mock-data";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt } from "drizzle-orm";

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

// Return quiz questions WITHOUT correct answer flags
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const targetUserId = session?.user?.id;
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "guest";
  const studentSeed = `${targetUserId || clientIp}_${quizId}`;

  // 1. Check if it matches static INITIAL_QUIZ
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

    return NextResponse.json({
      id: INITIAL_QUIZ.id,
      title: INITIAL_QUIZ.title,
      timeLimitMinutes: INITIAL_QUIZ.timeLimitMinutes,
      passPercentage: INITIAL_QUIZ.passPercentage,
      questions: safeQuestions,
    });
  }

  // 1.1 Check if it matches adventure quizzes map
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

    return NextResponse.json({
      id: advQuiz.id,
      title: advQuiz.title,
      timeLimitMinutes: advQuiz.timeLimitMinutes,
      passPercentage: advQuiz.passPercentage,
      questions: safeQuestions,
    });
  }

  // 2. Otherwise try database query
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quizId);
    if (isUUID) {
      const [dbQuiz] = await db
        .select()
        .from(schema.quiz)
        .where(eq(schema.quiz.id, quizId))
        .limit(1);

      if (dbQuiz) {
        // Entitlement Check: If quiz belongs to a course unit, student must be enrolled
        if (dbQuiz.unitId) {
          const now = new Date();

          if (!targetUserId) {
            return NextResponse.json(
              { error: "يجب تسجيل الدخول والاشتراك في الوحدة الدراسية لخوض هذا الاختبار." },
              { status: 401 }
            );
          }

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
            return NextResponse.json(
              { error: "عذراً، هذا الاختبار مخصص للطلاب المشتركين بالوحدة فقط. يرجى تفعيل الوحدة أولاً." },
              { status: 403 }
            );
          }
        }
        const dbQuestions = await db
          .select()
          .from(schema.quizQuestion)
          .where(eq(schema.quizQuestion.quizId, dbQuiz.id));

        // Question pool randomization & anti-cheat option shuffling
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

        return NextResponse.json({
          id: dbQuiz.id,
          title: dbQuiz.title,
          timeLimitMinutes: dbQuiz.timeLimitMinutes,
          passPercentage: dbQuiz.passPercentage,
          poolSize: dbQuiz.poolSize || undefined,
          questions: safeQuestions,
        });
      }
    }
  } catch (err) {
    console.warn("Quiz DB lookup error:", err);
  }

  return NextResponse.json(
    { error: "الاختبار غير موجود" },
    { status: 404 }
  );
}
