import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { gradeQuizForStudent } from "@/server/services/student-quiz.service";

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
      studentPhone = (session?.user as Record<string, unknown> | undefined)?.phoneNumber as string | undefined,
      timeSpentSeconds = 0
    } = body as {
      quizId: string;
      answers: Record<string, string>;
      studentName?: string;
      studentPhone?: string;
      timeSpentSeconds?: number;
    };

    if (!quizId || !answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "بيانات الاختبار غير مكتملة" },
        { status: 400 }
      );
    }

    const targetUserId = session?.user?.id || null;

    const result = await gradeQuizForStudent({
      quizId,
      answers,
      targetUserId,
      studentName,
      studentPhone,
      timeSpentSeconds,
      clientIp,
    });

    if (result.error) {
      const status = result.maxAttemptsReached ? 403 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Quiz grading error:", error);
    const message = (error as Error)?.message || "حدث خطأ في تصحيح الاختبار";
    const status = message.includes("يجب الاشتراك") ? 403 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
