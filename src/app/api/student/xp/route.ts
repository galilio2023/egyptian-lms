import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "يجب تسجيل الدخول لحفظ النقاط." }, { status: 401 });
    }

    const userId = session.user.id;

    // Strict Rate Limiting: max 4 practice XP awards per 10 minutes per student
    const rateKey = `student-xp:${userId}`;
    const rateCheck = checkRateLimit(rateKey, { maxRequests: 4, windowMs: 10 * 60 * 1000 });
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

    // Valid practice activities from frontend
    const ALLOWED_REASONS: Record<string, number> = {
      srs_daily_challenge: 20, // Max 20 XP for daily vocabulary review
      phonics_practice: 15,    // Max 15 XP for speech practice
      practice_challenge: 10,  // Max 10 XP for quick practice
    };

    const rawReason = typeof body.reason === "string" ? body.reason : "practice_challenge";
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_REASONS, rawReason)) {
      return NextResponse.json(
        { error: "نوع النشاط غير معتمد لتسجيل النقاط." },
        { status: 400 }
      );
    }

    const maxAllowedForReason = ALLOWED_REASONS[rawReason] || 15;
    const requestedXp = typeof body.xpAmount === "number" ? Math.round(body.xpAmount) : 10;
    const xpAmount = Math.max(1, Math.min(requestedXp, maxAllowedForReason));
    const reason = rawReason;

    // Atomically increment student XP points in DB
    const [updatedProfile] = await db
      .update(schema.studentProfile)
      .set({
        xpPoints: sql`COALESCE(${schema.studentProfile.xpPoints}, 0) + ${xpAmount}`,
      })
      .where(eq(schema.studentProfile.userId, userId))
      .returning({
        newXpPoints: schema.studentProfile.xpPoints,
      });

    return NextResponse.json({
      success: true,
      xpAwarded: xpAmount,
      reason,
      newTotalXp: updatedProfile?.newXpPoints ?? null,
    });
  } catch (error: unknown) {
    console.error("Failed to persist student XP:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ نقاط الخبرة." },
      { status: 500 }
    );
  }
}
