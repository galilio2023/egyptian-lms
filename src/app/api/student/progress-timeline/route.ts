import { NextResponse } from "next/server";
import { requireStudentAuth } from "@/server/auth/guards";
import { getStudentProgressTimeline } from "@/server/services/student-progress.service";
import type { TimelineEvent } from "@/lib/types/timeline";

export type { TimelineEvent };

export async function GET() {
  const authResult = await requireStudentAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const result = await getStudentProgressTimeline(context.userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[progress-timeline] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load progress timeline" },
      { status: 500 }
    );
  }
}
