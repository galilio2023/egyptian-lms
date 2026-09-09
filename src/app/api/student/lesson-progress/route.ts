import { NextRequest, NextResponse } from "next/server";
import { requireStudentAuth } from "@/server/auth/guards";
import { recordLessonOrCheckpointProgress } from "@/server/services/student-progress.service";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const authResult = await requireStudentAuth("يجب تسجيل الدخول لحفظ تقدم الدرس.");
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = (await request.json()) as {
      lessonId?: unknown;
      checkpointId?: unknown;
      rewardXp?: unknown;
    };

    if (typeof body.lessonId !== "string" || !UUID_PATTERN.test(body.lessonId)) {
      return NextResponse.json({ error: "معرف الدرس غير صالح." }, { status: 400 });
    }

    if (
      body.checkpointId !== undefined &&
      (typeof body.checkpointId !== "string" || !body.checkpointId.trim() || body.checkpointId.length > 200)
    ) {
      return NextResponse.json({ error: "معرف نقطة التحقق غير صالح." }, { status: 400 });
    }

    const rewardXp = typeof body.rewardXp === "number" ? body.rewardXp : undefined;

    const result = await recordLessonOrCheckpointProgress({
      userId: context.userId,
      lessonId: body.lessonId,
      checkpointId: typeof body.checkpointId === "string" ? body.checkpointId : undefined,
      rewardXp,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Lesson progress error:", error);
    const message = (error as Error)?.message || "تعذر حفظ تقدم الدرس. حاول مرة أخرى.";
    const status = message.includes("لم يتم العثور") ? 404 : message.includes("لا يوجد اشتراك") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
