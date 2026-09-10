import { NextRequest, NextResponse } from "next/server";
import { requireStudentAuth } from "@/server/auth/guards";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { awardPracticeXp } from "@/server/services/student-progress.service";
import { handleRouteError } from "@/server/errors";

export async function POST(request: NextRequest) {
  const authResult = await requireStudentAuth("يجب تسجيل الدخول لحفظ النقاط.");
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;
  const userId = context.userId;

  try {
    // Strict Rate Limiting: max 4 practice XP awards per 10 minutes per student
    const rateKey = `student-xp:${userId}`;
    const rateCheck = await checkRateLimit(rateKey, { maxRequests: 4, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.success) {
      return createRateLimitResponse(
        rateCheck,
        "أحسنت يا بطل! تم تسجيل نقاط التحدي لهذا اليوم. استمر في المذاكرة لحصد المزيد 🌟"
      );
    }

    const body = (await request.json()) as {
      xpAmount?: unknown;
      reason?: unknown;
    };

    const rawReason = typeof body.reason === "string" ? body.reason : "practice_challenge";
    const requestedXp = typeof body.xpAmount === "number" ? body.xpAmount : undefined;

    const result = await awardPracticeXp(userId, rawReason, requestedXp);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Failed to persist student XP:", error);
    const { error: message, status } = handleRouteError(error, "حدث خطأ أثناء حفظ نقاط الخبرة.");
    return NextResponse.json({ error: message }, { status });
  }
}

