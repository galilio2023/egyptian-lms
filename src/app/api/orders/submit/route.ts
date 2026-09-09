import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { processOrderSubmission, type SubmitOrderPayload } from "@/server/services/orders.service";

export async function POST(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const session = await auth.api.getSession({ headers: reqHeaders });

    // Rate Limiting: max 8 order submissions per 10 minutes per IP/User
    const rateKey = `order-submit:${session?.user?.id || clientIp}`;
    const rateCheck = checkRateLimit(rateKey, { maxRequests: 8, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.success) {
      return createRateLimitResponse(
        rateCheck,
        "تم تجاوز الحد الأقصى لمحاولات إنشاء الطلبات في وقت قصير. يرجى الانتظار قليلاً."
      );
    }

    const body = (await request.json()) as SubmitOrderPayload;
    const { unitId, paymentMethod } = body;

    if (!unitId || !paymentMethod) {
      return NextResponse.json(
        { error: "بيانات الطلب غير مكتملة." },
        { status: 400 }
      );
    }

    const headerKey = reqHeaders.get("idempotency-key");

    const result = await processOrderSubmission({
      payload: body,
      sessionUserId: session?.user?.id || null,
      sessionUserName: session?.user?.name || null,
      sessionUserEmail: session?.user?.email || null,
      clientIp,
      headerIdempotencyKey: headerKey,
    });

    const responseHeaders: Record<string, string> = {};
    if (result.isIdempotentReplay) {
      responseHeaders["Idempotent-Replayed"] = "true";
    }

    return NextResponse.json(result, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error("Order submission error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "حدث خطأ أثناء معالجة الطلب" },
      { status: 400 }
    );
  }
}
