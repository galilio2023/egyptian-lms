import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/guards";
import { commitParsedCurriculumUnit } from "@/server/services/admin-curriculum.service";
import type { ParsedCurriculumUnit } from "@/lib/ai/curriculum-intake-parser";
import { handleRouteError } from "@/server/errors";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth({ allowAssistant: false });
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const parsedUnit = body.unit as ParsedCurriculumUnit;

    if (!parsedUnit || !parsedUnit.titleEnglish || !parsedUnit.gradeSlug) {
      return NextResponse.json({ error: "بيانات الوحدة غير مكتملة." }, { status: 400 });
    }

    const result = await commitParsedCurriculumUnit(parsedUnit);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Curriculum commit failed:", error);
    const { error: message, status } = handleRouteError(error, "حدث خطأ أثناء اعتماد المنهج في قاعدة البيانات.");
    return NextResponse.json({ error: message }, { status });
  }
}
