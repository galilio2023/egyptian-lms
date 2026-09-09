import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/guards";
import { gradeHomework } from "@/server/services/admin-homework.service";
import { handleRouteError } from "@/server/errors";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await request.json();
    const result = await gradeHomework(body, context.userId);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const { error: message, status } = handleRouteError(err, "حدث خطأ أثناء رصد درجات الواجب.");
    return NextResponse.json({ error: message }, { status });
  }
}
