import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, or, isNull, gt } from "drizzle-orm";
import { INITIAL_HOMEWORK_ASSIGNMENTS, MockHomeworkSubmission } from "@/lib/db/mock-data";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";

function isValidAudioVoiceNote(url: unknown): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  // Safe base64 audio data URI (max 15MB)
  if (/^data:audio\/(webm|mp4|ogg|wav|mpeg|aac|x-m4a);base64,[A-Za-z0-9+/=\s]+$/i.test(trimmed)) {
    return trimmed.length <= 15 * 1024 * 1024;
  }
  // Safe relative storage path or trusted CDN domains (CWE-918 SSRF protection)
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
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const session = await auth.api.getSession({ headers: reqHeaders });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لتسليم الواجب المنزلي." },
        { status: 401 }
      );
    }

    // Rate Limiting: max 8 submissions per 10 minutes per student
    const rateKey = `homework-submit:${session.user.id || clientIp}`;
    const rateCheck = checkRateLimit(rateKey, "homeworkSubmit");
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

    const userId = session.user.id;
    const studentName = session.user.name || "طالب أكاديمية إيليت";
    const studentPhone = ((session.user as Record<string, unknown>)?.phoneNumber as string) || "01012345678";

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId);
    let submissionId = `sub-${Date.now()}`;
    let assignmentTitle = "كراسة الواجب المنزلي";
    let maxScore = 10;
    let unitTitle = "الوحدة التدريبية";

    if (isUUID) {
      try {
        const [dbAssignment] = await db
          .select()
          .from(schema.homeworkAssignment)
          .where(eq(schema.homeworkAssignment.id, assignmentId))
          .limit(1);

        if (dbAssignment) {
          assignmentTitle = dbAssignment.title;
          maxScore = dbAssignment.maxScore;

          // Check active enrollment in the assignment's unit
          if (dbAssignment.unitId) {
            const now = new Date();
            const [activeEnrollment] = await db
              .select({ id: schema.enrollment.id })
              .from(schema.enrollment)
              .where(
                and(
                  eq(schema.enrollment.userId, userId),
                  eq(schema.enrollment.unitId, dbAssignment.unitId),
                  eq(schema.enrollment.isActive, true),
                  or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
                )
              )
              .limit(1);

            if (!activeEnrollment) {
              return NextResponse.json(
                { error: "عذراً، يجب أن تكون مشتركاً ومفعّلاً في هذه الوحدة لتسليم الواجب." },
                { status: 403 }
              );
            }
          }
        }

        // Check if student already has a pending submission that hasn't been graded yet
        const [existingPending] = await db
          .select()
          .from(schema.homeworkSubmission)
          .where(
            and(
              eq(schema.homeworkSubmission.assignmentId, assignmentId),
              eq(schema.homeworkSubmission.userId, userId),
              eq(schema.homeworkSubmission.status, "submitted")
            )
          )
          .limit(1);

        if (existingPending) {
          // Update the pending submission with latest uploaded pages and voice note
          await db
            .update(schema.homeworkSubmission)
            .set({
              studentImages: effectiveImages,
              audioVoiceNoteUrl: audioVoiceNoteUrl || null,
              createdAt: new Date(),
            })
            .where(eq(schema.homeworkSubmission.id, existingPending.id));
          submissionId = existingPending.id;
        } else {
          // Create new submission record
          const [inserted] = await db
            .insert(schema.homeworkSubmission)
            .values({
              assignmentId,
              userId,
              studentImages: effectiveImages,
              audioVoiceNoteUrl: audioVoiceNoteUrl || null,
              status: "submitted",
            })
            .returning({ id: schema.homeworkSubmission.id });
          if (inserted?.id) submissionId = inserted.id;
        }
      } catch (dbErr) {
        console.warn("DB homework submission note:", dbErr);
      }
    } else {
      const mockAssignment = INITIAL_HOMEWORK_ASSIGNMENTS.find((a) => a.id === assignmentId) || INITIAL_HOMEWORK_ASSIGNMENTS[0];
      assignmentTitle = mockAssignment.title;
      maxScore = mockAssignment.maxScore;
      unitTitle = mockAssignment.unitTitle;
    }

    const createdSubmission: MockHomeworkSubmission = {
      id: submissionId,
      assignmentId,
      assignmentTitle,
      studentId: userId,
      studentName,
      studentPhone,
      parentPhone: "01098765432",
      gradeTitle: unitTitle,
      studentImages: effectiveImages,
      audioVoiceNoteUrl: audioVoiceNoteUrl || undefined,
      status: "submitted",
      maxScore,
      submittedAt: "الآن",
    };

    return NextResponse.json({
      success: true,
      message: audioVoiceNoteUrl 
        ? "تم تسليم كراسة الواجب والملاحظة الصوتية بنجاح وجاري المراجعة والتصحيح بواسطة فريق المعلم 🎙️📜"
        : "تم تسليم كراسة الواجب بنجاح وجاري المراجعة والتصحيح بواسطة فريق المعلم.",
      submission: createdSubmission,
    });
  } catch (err) {
    console.error("Homework submission error:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة تسليم الواجب." },
      { status: 500 }
    );
  }
}
