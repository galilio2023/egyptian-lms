import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";

export async function POST(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const userAgent = reqHeaders.get("user-agent") || undefined;

    // Rate Limiting: max 5 redemption attempts per 10 minutes per IP
    const rateCheck = checkRateLimit(`voucher:${clientIp}`, "voucherRedeem");
    if (!rateCheck.success) {
      logSecurityEvent({
        eventType: "voucher_rate_limited",
        severity: "high",
        ipAddress: clientIp,
        userAgent,
        description: "تجاوز الحد الأقصى لمحاولات شحن الكروت (Rate Limit)",
        details: { limit: rateCheck.limit, retryAfterSeconds: rateCheck.resetSeconds },
      });

      return createRateLimitResponse(
        rateCheck,
        "تم تجاوز عدد محاولات إدخال كروت الشحن المسموح بها لحماية أمان المنصة. يرجى الانتظار والمحاولة لاحقاً."
      );
    }

    const session = await auth.api.getSession({ headers: reqHeaders });
    const body = await request.json();
    const { code, studentPhone } = body as {
      code: string;
      studentPhone?: string;
    };

    if (!code || typeof code !== "string" || code.trim().length < 6) {
      return NextResponse.json(
        { error: "يرجى إدخال كود الشحن المكون من 6 أرقام أو حروف على الأقل." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Require authenticated student session to prevent IDOR / unlinked voucher code burning
    const currentUserId = session?.user?.id;
    if (!currentUserId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً بحساب الطالب المعتمد لشحن الكارت وتفعيل الوحدة الدراسية في حسابه." },
        { status: 401 }
      );
    }

    // 1. Atomic query & update to prevent concurrency race conditions
    try {
      const [existingVoucher] = await db
        .select()
        .from(schema.voucherCode)
        .where(eq(schema.voucherCode.code, cleanCode))
        .limit(1);

      if (!existingVoucher) {
        logSecurityEvent({
          eventType: "voucher_redeem_failed",
          severity: "low",
          userId: currentUserId,
          studentPhone,
          ipAddress: clientIp,
          userAgent,
          description: `محاولة إدخال كود كارت شحن غير صحيح: ${cleanCode}`,
          details: { attemptedCode: cleanCode },
        });

        return NextResponse.json(
          { error: "كود كارت الشحن غير صحيح أو غير مسجل بالنظام. يرجى التأكد من كتابة الكود كما هو مطبوع على الكارت." },
          { status: 400 }
        );
      }

      // Atomic transaction: mark voucher redeemed and activate course enrollment
      const txResult = await db.transaction(async (tx) => {
        const [redeemedVoucher] = await tx
          .update(schema.voucherCode)
          .set({
            isRedeemed: true,
            redeemedByUserId: currentUserId,
            redeemedAt: new Date(),
          })
          .where(
            and(
              eq(schema.voucherCode.code, cleanCode),
              eq(schema.voucherCode.isRedeemed, false)
            )
          )
          .returning();

        if (!redeemedVoucher) {
          return { success: false, alreadyRedeemed: true, voucher: null };
        }

        await tx
          .insert(schema.enrollment)
          .values({
            userId: currentUserId,
            unitId: redeemedVoucher.unitId,
            isActive: true,
          })
          .onConflictDoUpdate({
            target: [schema.enrollment.userId, schema.enrollment.unitId],
            set: { isActive: true, enrolledAt: new Date() },
          });

        return { success: true, alreadyRedeemed: false, voucher: redeemedVoucher };
      });

      if (txResult.alreadyRedeemed || !txResult.voucher) {
        logSecurityEvent({
          eventType: "voucher_redeem_failed",
          severity: "low",
          userId: currentUserId,
          studentPhone,
          ipAddress: clientIp,
          userAgent,
          description: `محاولة إدخال كود كارت شحن تم تفعيله مسبقاً: ${cleanCode}`,
          details: { attemptedCode: cleanCode },
        });

        return NextResponse.json(
          { error: "هذا الكود تم استخدامه وتفعيله مسبقاً." },
          { status: 400 }
        );
      }

      // Log successful voucher redemption
      logSecurityEvent({
        eventType: "voucher_redeem_success",
        severity: "low",
        userId: currentUserId,
        studentPhone,
        ipAddress: clientIp,
        userAgent,
        description: `تم شحن كارت الشحن بنجاح وتفعيل الوحدة الدراسية: ${cleanCode}`,
        details: { unitId: txResult.voucher.unitId, batchName: txResult.voucher.batchName },
      });

      return NextResponse.json({
        success: true,
        message: "🎉 تم شحن الكود وتفعيل الوحدة الدراسية بنجاح!",
        unitId: txResult.voucher.unitId,
        batchName: txResult.voucher.batchName,
      });
    } catch (dbErr) {
      console.warn("Voucher DB lookup error:", dbErr);
      return NextResponse.json(
        { error: "تعذر التحقق من كود الشحن عبر قاعدة البيانات. يرجى المحاولة لاحقاً." },
        { status: 500 }
      );
    }

    // If code is not found in database, reject immediately
    return NextResponse.json(
      { error: "كود كارت الشحن غير صحيح أو غير مسجل بالنظام. يرجى التأكد من كتابة الكود كما هو مطبوع على الكارت." },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Voucher redemption error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة كود الشحن", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
