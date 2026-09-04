import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getBunnyVideoStatus } from "@/lib/video/bunny";

export async function GET(request: NextRequest) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    const userRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const isAuthorized = userRole === "admin" || userRole === "teacher" || userRole === "assistant";

    if (!session || !isAuthorized) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول. يتطلب صلاحيات المشرف أو المعلم." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "معرف الفيديو مطلوب" }, { status: 400 });
    }

    const status = await getBunnyVideoStatus(videoId);

    if (!status) {
      return NextResponse.json(
        { error: "تعذر العثور على حالة الفيديو أو التحقق من مكتبة Bunny" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId,
      status,
    });
  } catch (error: unknown) {
    console.error("Video status check error:", error);
    return NextResponse.json(
      {
        error: "فشل التحقق من حالة معالجة الفيديو",
        details: (error as Error)?.message,
      },
      { status: 500 }
    );
  }
}
