import { NextResponse } from "next/server";
import { requireStudentAuth } from "@/server/auth/guards";
import { getStudentHomeworkData } from "@/server/services/student-homework.service";
import { INITIAL_HOMEWORK_ASSIGNMENTS } from "@/lib/db/mock-data";

export async function GET() {
  const authResult = await requireStudentAuth("يجب تسجيل الدخول لعرض واجبات الطالب.");
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const result = await getStudentHomeworkData(context.userId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Student homework fetch error:", error);
    return NextResponse.json({
      success: true,
      assignments: INITIAL_HOMEWORK_ASSIGNMENTS.map((a) => ({
        id: a.id,
        unitId: a.unitId,
        unitTitle: "الوحدة التأسيسية",
        title: a.title,
        instructions: a.instructions,
        pageNumber: a.pageNumber,
        maxScore: a.maxScore,
        dueDate: a.dueDate,
        submission: null,
        status: "pending_submission",
      })),
      pendingCount: 1,
      completedCount: 0,
      isFallback: true,
    });
  }
}
