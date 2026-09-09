import { NextRequest, NextResponse } from "next/server";
import { requireStudentAuth } from "@/server/auth/guards";
import { upsertStudentProfile } from "@/server/services/student-progress.service";
import { handleRouteError } from "@/server/errors";

export async function POST(request: NextRequest) {
  const authResult = await requireStudentAuth("غير مصرح. يجب تسجيل الدخول لإنشاء أو تحديث الملف الشخصي للطالب.");
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await request.json();
    const { 
      phoneNumber, 
      parentPhoneNumber, 
      parentName, 
      governorate, 
      gradeLevel, 
      schoolName,
      deviceId 
    } = body;

    const result = await upsertStudentProfile({
      userId: context.userId,
      phoneNumber,
      parentPhoneNumber,
      parentName,
      governorate,
      gradeLevel,
      schoolName,
      deviceId,
      sessionId: context.sessionId,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Profile registration error:", error);
    const { error: message, status } = handleRouteError(error, "حدث خطأ أثناء حفظ الملف الشخصي");
    return NextResponse.json({ error: message }, { status });
  }
}

