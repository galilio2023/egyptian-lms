import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireStudentAuth } from "@/server/auth/guards";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";
import { redeemVoucherCode } from "@/server/services/vouchers.service";
import { handleRouteError } from "@/server/errors";

export async function POST(request: NextRequest) {
  const authResult = await requireStudentAuth(
    "يجب تسجيل الدخول أولاً بحساب الطالب المعتمد لشحن الكارت وتفعيل الوحدة الدراسية في حسابه."
  );
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const userAgent = reqHeaders.get("user-agent") || undefined;

    // Rate Limiting: max 5 redemption attempts per 10 minutes per IP
    const rateCheck = await checkRateLimit(`voucher:${clientIp}`, "voucherRedeem");
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

    const currentUserId = context.userId;

    const result = await redeemVoucherCode({
      code,
      currentUserId,
      studentPhone,
      clientIp,
      userAgent,
      studentName: context.userName || undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Voucher redemption error:", error);
    const { error: message, status } = handleRouteError(error, "حدث خطأ أثناء معالجة كود الشحن");
    return NextResponse.json({ error: message }, { status });
  }
}

