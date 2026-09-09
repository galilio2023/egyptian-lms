import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getPublicLessonDetails } from "@/server/services/public-curriculum.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonSlug: string }> }
) {
  try {
    const { lessonSlug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;

    const data = await getPublicLessonDetails(lessonSlug, currentUserId, clientIp);
    if (!data) {
      return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Public lesson fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب بيانات الدرس" }, { status: 500 });
  }
}
