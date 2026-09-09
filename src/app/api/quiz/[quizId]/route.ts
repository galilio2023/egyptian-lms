import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getQuizForStudent } from "@/server/services/student-quiz.service";
import { handleRouteError } from "@/server/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const targetUserId = session?.user?.id;
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "guest";

    const quiz = await getQuizForStudent(quizId, targetUserId, clientIp);

    if (!quiz) {
      return NextResponse.json(
        { error: "الاختبار غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);
  } catch (err: unknown) {
    console.error("Quiz load error:", err);
    const { error: message, status } = handleRouteError(err, "حدث خطأ أثناء تحميل بيانات الاختبار");
    return NextResponse.json({ error: message }, { status });
  }
}

