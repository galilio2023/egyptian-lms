import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { createBunnyVideo, generateBunnyUploadTicket, isBunnyConfigured } from "@/lib/video/bunny";

export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const { title = "محاضرة جديدة", unitId } = body as { title?: string; unitId?: string };

    if (!title.trim()) {
      return NextResponse.json({ error: "عنوان المحاضرة مطلوب" }, { status: 400 });
    }

    // Step 1: Create Video Object in Bunny Stream
    const videoObject = await createBunnyVideo(title);

    // Step 2: Generate TUS Resumable Upload Ticket
    const ticket = generateBunnyUploadTicket(videoObject.guid);

    return NextResponse.json({
      success: true,
      ticket,
      unitId,
      videoTitle: title,
      isConfigured: isBunnyConfigured(),
      message: isBunnyConfigured()
        ? "تم إنشاء تذكرة الرفع السحابي بنجاح عبر بروتوكول TUS."
        : "تم إنشاء تذكرة الرفع بنمط التجربة المحلي (Local Demo Mode).",
    });
  } catch (error: unknown) {
    console.error("Failed to generate upload ticket:", error);
    return NextResponse.json(
      {
        error: "فشل إنشاء تذكرة رفع الفيديو",
        details: (error as Error)?.message,
      },
      { status: 500 }
    );
  }
}
