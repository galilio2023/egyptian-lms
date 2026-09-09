import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/guards";
import { getBunnyVideoStatus } from "@/lib/video/bunny";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {

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
