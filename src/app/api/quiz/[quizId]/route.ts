import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { INITIAL_QUIZ } from "@/lib/db/mock-data";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt } from "drizzle-orm";

// Return quiz questions WITHOUT correct answer flags
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;

  // 1. Check if it matches static INITIAL_QUIZ
  if (quizId === INITIAL_QUIZ.id) {
    const safeQuestions = INITIAL_QUIZ.questions.map((q) => ({
      id: q.id,
      text: q.text,
      audioUrl: q.audioUrl,
      options: q.options.map((opt) => ({
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
          const session = await auth.api.getSession({ headers: await headers() });
          const targetUserId = session?.user?.id;
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

        const safeQuestions = dbQuestions.map((q) => {
          const opts = (q.options as Array<{ id: string; text: string; isCorrect?: boolean }>) || [];
          return {
            id: q.id,
            text: q.questionText,
            audioUrl: q.questionAudioUrl,
            options: opts.map((opt) => ({
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
