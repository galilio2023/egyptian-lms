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

    // Determine current student user ID
    let currentUserId = session?.user?.id;
    if (!currentUserId && studentPhone) {
      try {
        const [userRecord] = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.phoneNumber, studentPhone))
          .limit(1);
        if (userRecord) currentUserId = userRecord.id;
      } catch {
        // Fallback
      }
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

      // Atomic conditional update
      const [redeemedVoucher] = await db
        .update(schema.voucherCode)
        .set({
          isRedeemed: true,
          redeemedByUserId: currentUserId || null,
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
        details: { unitId: redeemedVoucher.unitId, batchName: redeemedVoucher.batchName },
      });

      // Create course enrollment if student ID is present
      if (currentUserId) {
        const [existingEnrollment] = await db
          .select()
          .from(schema.enrollment)
          .where(
            and(
              eq(schema.enrollment.userId, currentUserId),
              eq(schema.enrollment.unitId, redeemedVoucher.unitId)
            )
          )
          .limit(1);

        if (!existingEnrollment) {
          await db.insert(schema.enrollment).values({
            userId: currentUserId,
            unitId: redeemedVoucher.unitId,
            isActive: true,
          });
        } else if (!existingEnrollment.isActive) {
          await db
            .update(schema.enrollment)
            .set({ isActive: true })
            .where(eq(schema.enrollment.id, existingEnrollment.id));
        }
      }

      return NextResponse.json({
        success: true,
        message: "🎉 تم شحن الكود وتفعيل الوحدة الدراسية بنجاح!",
        unitId: redeemedVoucher.unitId,
        batchName: redeemedVoucher.batchName,
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
