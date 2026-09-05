import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { INITIAL_QUIZ } from "@/lib/db/mock-data";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt } from "drizzle-orm";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";

// Deterministic seeded shuffle per student session matching quiz loader
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

export async function POST(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const session = await auth.api.getSession({ headers: reqHeaders });

    // Rate Limiting: max 12 submissions per 5 minutes per user/IP
    const rateKey = `quiz-grade:${session?.user?.id || clientIp}`;
    const rateCheck = checkRateLimit(rateKey, "quizGrade");
    if (!rateCheck.success) {
      logSecurityEvent({
        eventType: "rate_limit_triggered",
        severity: "medium",
        userId: session?.user?.id,
        ipAddress: clientIp,
        description: "إرسال طلبات تصحيح اختبارات بمعدل غير اعتيادي وسريع (Rate Limit 12/5min)",
      });

      return createRateLimitResponse(
        rateCheck,
        "عذراً، لقد قمت بإرسال عدد كبير من طلبات تصحيح الاختبارات في وقت قصير. يرجى الانتظار قليلاً قبل إعادة المحاولة."
      );
    }

    const body = await request.json();
    const { 
      quizId, 
      answers, 
      studentName = session?.user?.name || "بطل أكاديمية إيليت",
      parentPhone = "01098765432",
      studentPhone = (session?.user as Record<string, unknown>)?.phoneNumber as string | undefined,
      timeSpentSeconds = 0
    } = body as {
      quizId: string;
      answers: Record<string, string>;
      studentName?: string;
      parentPhone?: string;
      studentPhone?: string;
      timeSpentSeconds?: number;
    };

    if (!quizId || !answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "بيانات الاختبار غير مكتملة" },
        { status: 400 }
      );
    }

    let targetUserId = session?.user?.id;
    if (!targetUserId && studentPhone) {
      try {
        const [userRecord] = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.phoneNumber, studentPhone))
          .limit(1);
        if (userRecord) targetUserId = userRecord.id;
      } catch {
        // Fallback
      }
    }

    // Attempt to load questions from database if UUID format
    let quiz = INITIAL_QUIZ;
    let questionsList: Array<{ id: string; text: string; options: Array<{ id: string; text: string; isCorrect: boolean }>; explanation: string }> = INITIAL_QUIZ.questions;
    let maxAttempts = 3;
    let existingAttempts: Array<{ id: string; passed: boolean; score: number }> = [];

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quizId);

    if (isUUID) {
      try {
        const [dbQuiz] = await db
          .select()
          .from(schema.quiz)
          .where(eq(schema.quiz.id, quizId))
          .limit(1);

        if (dbQuiz) {
          maxAttempts = dbQuiz.maxAttempts ?? 3;

          // 1. Enrollment Verification: If quiz belongs to a course unit, student must be enrolled
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
              return NextResponse.json(
                { error: "يجب الاشتراك وتفعيل الوحدة الدراسية لتسجيل درجات الاختبار والتقدم." },
                { status: 403 }
              );
            }
          }

          // 2. Max Attempts Check: Check how many attempts the student has already taken
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

              return NextResponse.json(
                {
                  error: `لقد استنفدت الحد الأقصى للمحاولات المسموح بها لهذا الاختبار (${maxAttempts} محاولات). يرجى مراجعة المعلم لإعادة فتح المحاولة.`,
                  maxAttemptsReached: true,
                  attemptsCount: existingAttempts.length,
                  maxAttempts,
                },
                { status: 403 }
              );
            }
          }

          const dbQuestions = await db
            .select()
            .from(schema.quizQuestion)
            .where(eq(schema.quizQuestion.quizId, dbQuiz.id));

          // Deterministic student seed matching quiz loader
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
      } catch (dbFetchErr) {
        console.warn("Quiz DB fetch note:", dbFetchErr);
      }
    }

    let correctCount = 0;
    const results: Record<string, { correct: boolean; correctAnswerId: string; explanation: string }> = {};

    questionsList.forEach((q) => {
      const selectedId = answers[q.id];
      const correctOption = q.options.find((opt) => opt.isCorrect);
      const isCorrect = correctOption ? selectedId === correctOption.id : false;

      if (isCorrect) correctCount++;

      results[q.id] = {
        correct: isCorrect,
        correctAnswerId: correctOption?.id || "",
        explanation: q.explanation,
      };
    });

    const totalQuestions = questionsList.length || 1;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= quiz.passPercentage;

    // XP Guard: Only award points if the student hasn't already passed this quiz
    const alreadyPassed = existingAttempts.some((a) => a.passed);
    let earnedXp = 0;
    if (!alreadyPassed) {
      earnedXp = passed ? correctCount * 25 + 50 : correctCount * 10;
    }

    // Database attempt persistence & XP update
    try {
      if (targetUserId) {
        // 1. Log attempt if quizId is a valid Postgres UUID
        if (isUUID) {
          await db.insert(schema.quizAttempt).values({
            quizId: quiz.id,
            userId: targetUserId,
            score: correctCount,
            totalPossibleScore: totalQuestions,
            passed,
            timeSpentSeconds: timeSpentSeconds || 60,
            userAnswers: answers,
          });
        }

        // 2. Increment student profile XP only if earnedXp > 0 (prevents replay farming)
        if (earnedXp > 0) {
          const [profile] = await db
            .select()
            .from(schema.studentProfile)
            .where(eq(schema.studentProfile.userId, targetUserId))
            .limit(1);

          if (profile) {
            await db
              .update(schema.studentProfile)
              .set({ xpPoints: (profile.xpPoints || 0) + earnedXp })
              .where(eq(schema.studentProfile.userId, targetUserId));
          }
        }
      }
    } catch (dbErr) {
      console.warn("Quiz attempt DB logging note:", dbErr);
    }

    // Prepare WhatsApp Message for Parent
    const cleanParentPhone = parentPhone.replace(/\D/g, "");
    const rawTextMessage = 
      `🌟 *تقرير مستوى الطالب - أكاديمية إيليت*\n` +
      `👤 *اسم الطالب:* ${studentName}\n` +
      `📝 *الاختبار:* ${quiz.title}\n` +
      `🎯 *الدرجة:* ${correctCount} من ${totalQuestions} (%${percentage})\n` +
      `📊 *الحالة:* ${passed ? "اجتاز الاختبار بنجاح وامتياز 🎉" : "يحتاج إلى مراجعة المحاضرة وإعادة المحاولة 💪"}\n` +
      `⭐ *النقاط المكتسبة:* +${earnedXp} XP\n` +
      `👨‍🏫 *المشرف:* مستر أحمد عبد الرحمن`;
    const whatsappMessage = encodeURIComponent(rawTextMessage);

    // Automated server-side dispatch to parent
    let whatsappAutoDelivery: { success: boolean; simulated?: boolean } = { success: false };
    if (cleanParentPhone) {
      try {
        whatsappAutoDelivery = await sendAutomatedWhatsAppNotification({
          to: cleanParentPhone,
          message: rawTextMessage,
        });
      } catch (err) {
        console.warn("Automated WhatsApp dispatch note:", err);
      }
    }

    const remainingAttempts = Math.max(0, maxAttempts - (existingAttempts.length + 1));

    return NextResponse.json({
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
      whatsappAutoDelivery,
      parentNotification: {
        parentPhone: cleanParentPhone || parentPhone,
        whatsappUrl: `https://wa.me/2${cleanParentPhone || parentPhone}?text=${whatsappMessage}`,
        messageText: rawTextMessage,
      },
    });
  } catch (error: unknown) {
    console.error("Quiz grading error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تصحيح الاختبار", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
