import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireStudentAuth } from "@/server/auth/guards";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { submitStudentHomework } from "@/server/services/student-homework.service";
import { handleRouteError } from "@/server/errors";

function isValidAudioVoiceNote(url: unknown): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (/^data:audio\/(webm|mp4|ogg|wav|mpeg|aac|x-m4a);base64,[A-Za-z0-9+/=\s]+$/i.test(trimmed)) {
    return trimmed.length <= 15 * 1024 * 1024;
  }
  try {
    if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/audio/")) return true;
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const trustedHostnames = [
      "storage.bunnycdn.com",
      "b-cdn.net",
      "s3.amazonaws.com",
      "r2.cloudflarestorage.com",
    ];
    return trustedHostnames.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireStudentAuth("يجب تسجيل الدخول لتسليم الواجب المنزلي.");
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const rateKey = `homework-submit:${context.userId || clientIp}`;
    const rateCheck = await checkRateLimit(rateKey, "homeworkSubmit");
    if (!rateCheck.success) {
      return createRateLimitResponse(
        rateCheck,
        "تم تجاوز الحد الأقصى لتسليم الواجبات في وقت قصير. يرجى الانتظار قليلاً قبل تسليم كراسة واجب أخرى."
      );
    }

    const body = await request.json();
    const { assignmentId, studentImages, audioVoiceNoteUrl } = body as {
      assignmentId: string;
      studentImages?: Array<{ pageNumber: number; imageUrl: string }>;
      audioVoiceNoteUrl?: string;
    };

    if (audioVoiceNoteUrl && !isValidAudioVoiceNote(audioVoiceNoteUrl)) {
      return NextResponse.json(
        { error: "صيغة التسجيل الصوتي غير صالحة أو واردة من مصدر غير موثوق به." },
        { status: 400 }
      );
    }

    const hasImages = Array.isArray(studentImages) && studentImages.length > 0;
    const hasAudio = Boolean(audioVoiceNoteUrl && isValidAudioVoiceNote(audioVoiceNoteUrl));

    if (!assignmentId || (!hasImages && !hasAudio)) {
      return NextResponse.json(
        { error: "بيانات تسليم الواجب غير مكتملة. يجب إرفاق صورة واحدة على الأقل أو تسجيل صوتي." },
        { status: 400 }
      );
    }

    const effectiveImages = hasImages ? studentImages! : [];
    const studentName = context.userName || "طالب المنصة";
    const studentPhone = context.phoneNumber || "01000000000";

    const result = await submitStudentHomework({
      userId: context.userId,
      studentName,
      studentPhone,
      assignmentId,
      studentImages: effectiveImages,
      audioVoiceNoteUrl: audioVoiceNoteUrl || undefined,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Homework submission error:", err);
    const { error: message, status } = handleRouteError(err, "حدث خطأ أثناء معالجة تسليم الواجب.");
    return NextResponse.json({ error: message }, { status });
  }
}
