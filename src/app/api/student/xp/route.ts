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

    // Rate Limiting: 30 XP awards per 5 minutes per student
    const rateKey = `student-xp:${userId}`;
    const rateCheck = checkRateLimit(rateKey, { maxRequests: 30, windowMs: 5 * 60 * 1000 });
    if (!rateCheck.success) {
      return createRateLimitResponse(
        rateCheck,
        "تم تسجيل عدد كبير من نقاط الخبرة خلال وقت وجيز. يرجى الانتظار قليلاً."
      );
    }

    const body = (await request.json()) as {
      xpAmount?: unknown;
      reason?: unknown;
    };

    const xpAmount = typeof body.xpAmount === "number" ? Math.round(body.xpAmount) : 0;
    if (xpAmount <= 0 || xpAmount > 100) {
      return NextResponse.json(
        { error: "مقدار نقاط الخبرة غير صالح (يجب أن يكون بين 1 و 100 نقطة)." },
        { status: 400 }
      );
    }

    const reason = typeof body.reason === "string" ? body.reason.slice(0, 100) : "practice_challenge";

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
