import { NextRequest, NextResponse } from "next/server";
import { requireStudentAuth } from "@/server/auth/guards";
import { attendLiveSession } from "@/server/services/live-sessions.service";

export async function POST(request: NextRequest) {
  const authResult = await requireStudentAuth("يجب تسجيل الدخول أولاً للوصول إلى حصة البث المباشر.");
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await request.json();
    const { sessionId } = body as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json({ error: "معرف الحصة مطلوب" }, { status: 400 });
    }

    const result = await attendLiveSession({
      sessionId,
      userId: context.userId,
      userRole: context.userRole,
      studentName: context.userName,
      studentPhone: context.phoneNumber,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Live attendance error:", error);
    const message = (error as Error)?.message || "حدث خطأ أثناء تسجيل الحضور في حصة البث المباشر.";
    const status = message.includes("غير مصرح") || message.includes("مخصصة لطلاب") ? 403 : message.includes("لم يتم العثور") ? 404 : 400;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
