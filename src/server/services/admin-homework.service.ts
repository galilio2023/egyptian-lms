import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getPlatformSettings } from "@/lib/utils/platform-settings";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
import { validateEgyptianPhone } from "@/lib/utils";
import { DomainError, NotFoundError } from "@/server/errors";

export interface GradeHomeworkPayload {
  submissionId?: string;
  score?: number;
  feedbackNotes?: string;
  annotatedImages?: Array<{ pageIndex: number; dataUrl: string }>;
  studentName?: string;
  assignmentTitle?: string;
}

export async function getAdminHomeworkData() {
  try {
    const dbSubmissions = await db
      .select({
        id: schema.homeworkSubmission.id,
        assignmentId: schema.homeworkSubmission.assignmentId,
        assignmentTitle: schema.homeworkAssignment.title,
        maxScore: schema.homeworkAssignment.maxScore,
        userId: schema.homeworkSubmission.userId,
        studentName: schema.user.name,
        studentPhone: schema.user.phoneNumber,
        parentPhone: schema.studentProfile.parentPhoneNumber,
        studentImages: schema.homeworkSubmission.studentImages,
        audioVoiceNoteUrl: schema.homeworkSubmission.audioVoiceNoteUrl,
        annotatedImages: schema.homeworkSubmission.annotatedImages,
        status: schema.homeworkSubmission.status,
        score: schema.homeworkSubmission.score,
        feedbackNotes: schema.homeworkSubmission.feedbackNotes,
        submittedAt: schema.homeworkSubmission.createdAt,
      })
      .from(schema.homeworkSubmission)
      .leftJoin(schema.homeworkAssignment, eq(schema.homeworkSubmission.assignmentId, schema.homeworkAssignment.id))
      .leftJoin(schema.user, eq(schema.homeworkSubmission.userId, schema.user.id))
      .leftJoin(schema.studentProfile, eq(schema.homeworkSubmission.userId, schema.studentProfile.userId))
      .orderBy(desc(schema.homeworkSubmission.createdAt));

    return dbSubmissions.map((s) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignmentTitle || "كراسة الواجب والأنشطة",
      studentId: s.userId,
      studentName: s.studentName || "طالب بأكاديمية إيليت",
      studentPhone: s.studentPhone || "010xxxxxxxx",
      parentPhone: s.parentPhone || "010xxxxxxxx",
      gradeTitle: "Grade 1",
      studentImages: s.studentImages as Array<{ pageNumber: number; imageUrl: string }>,
      audioVoiceNoteUrl: s.audioVoiceNoteUrl || null,
      annotatedImages: (s.annotatedImages as Array<{ pageIndex: number; dataUrl: string }>) || undefined,
      status: s.status,
      score: s.score ?? undefined,
      maxScore: s.maxScore || 10,
      feedbackNotes: s.feedbackNotes ?? undefined,
      submittedAt: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("ar-EG") : "اليوم",
    }));
  } catch (err) {
    console.warn("Homework fetch DB note:", err);
    return [];
  }
}

export async function gradeHomework(payload: GradeHomeworkPayload, actorUserId: string) {
  const { submissionId, score, feedbackNotes, annotatedImages, studentName, assignmentTitle } = payload;

  if (!submissionId) {
    throw new DomainError("معرف تسليم الواجب مطلوب");
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId);
  if (!isUUID) {
    throw new DomainError("معرف تسليم الواجب غير صالح.");
  }

  if (score !== undefined && (typeof score !== "number" || !Number.isFinite(score))) {
    throw new DomainError("درجة الواجب غير صالحة.");
  }

  // 1. Fetch submission with its assignment to obtain dynamic maxScore
  const [existingSub] = await db
    .select({
      id: schema.homeworkSubmission.id,
      userId: schema.homeworkSubmission.userId,
      status: schema.homeworkSubmission.status,
      assignmentId: schema.homeworkSubmission.assignmentId,
      assignmentTitle: schema.homeworkAssignment.title,
      assignmentMaxScore: schema.homeworkAssignment.maxScore,
    })
    .from(schema.homeworkSubmission)
    .leftJoin(schema.homeworkAssignment, eq(schema.homeworkSubmission.assignmentId, schema.homeworkAssignment.id))
    .where(eq(schema.homeworkSubmission.id, submissionId))
    .limit(1);

  if (!existingSub) {
    throw new NotFoundError("لم يتم العثور على تسليم الواجب المطلوب في قاعدة البيانات.");
  }

  const maxAssignmentScore = existingSub.assignmentMaxScore || 10;
  const safeScore = Math.max(0, Math.min(maxAssignmentScore, Math.round(score ?? maxAssignmentScore)));
  const scorePercentage = (safeScore / maxAssignmentScore) * 100;
  const isFirstGrading = existingSub.status !== "graded";
  const earnedXp = isFirstGrading ? (scorePercentage >= 80 ? 30 : 15) : 0;

  // 2. Persist updated score
  const [updated] = await db
    .update(schema.homeworkSubmission)
    .set({
      score: safeScore,
      feedbackNotes: feedbackNotes?.trim() || null,
      annotatedImages,
      status: "graded",
      gradedAt: new Date(),
      gradedByUserId: actorUserId,
    })
    .where(eq(schema.homeworkSubmission.id, submissionId))
    .returning({ userId: schema.homeworkSubmission.userId });

  if (updated?.userId && isFirstGrading && earnedXp > 0) {
    await db
      .update(schema.studentProfile)
      .set({
        xpPoints: sql`COALESCE(${schema.studentProfile.xpPoints}, 0) + ${earnedXp}`,
      })
      .where(eq(schema.studentProfile.userId, updated.userId));
  }

  // 3. Automated WhatsApp dispatch to parent
  let whatsappAutoDelivery: { success: boolean; simulated?: boolean } = { success: false };
  let whatsappUrl: string | null = null;

  if (existingSub.userId) {
    try {
      const [profile] = await db
        .select({ parentPhoneNumber: schema.studentProfile.parentPhoneNumber })
        .from(schema.studentProfile)
        .where(eq(schema.studentProfile.userId, existingSub.userId))
        .limit(1);

      const cleanParentPhone = profile?.parentPhoneNumber ? validateEgyptianPhone(profile.parentPhoneNumber) : null;
      if (cleanParentPhone) {
        const settings = await getPlatformSettings();
        const effectiveAssignmentTitle = existingSub.assignmentTitle || assignmentTitle || "كراسة التدريبات";
        const rawTextMessage = 
          `🌟 *تقرير تصحيح كراسة الواجب - ${settings.academyNameArabic}*\n` +
          `👤 *اسم البطل:* ${studentName || "بطل الأكاديمية"}\n` +
          `📝 *الواجب:* ${effectiveAssignmentTitle}\n` +
          `🎯 *الدرجة المستحقة:* ${safeScore} من ${maxAssignmentScore} (%${Math.round(scorePercentage)})\n` +
          `⭐ *النقاط المكتسبة:* +${earnedXp} XP\n` +
          `✍️ *ملاحظات ${settings.teacherNameArabic}:* ${feedbackNotes || "ممتاز يا بطل!"}\n` +
          `يمكنكم مشاهدة صفحات الكراسة المصححة بالقلم الأحمر في حساب الطالب على المنصة 📜`;
        const msg = encodeURIComponent(rawTextMessage);

        try {
          whatsappAutoDelivery = await sendAutomatedWhatsAppNotification({
            to: cleanParentPhone,
            message: rawTextMessage,
          });
        } catch (err) {
          console.warn("Automated WhatsApp homework dispatch note:", err);
        }

        whatsappUrl = `https://wa.me/2${cleanParentPhone}?text=${msg}`;
      }
    } catch (profileErr) {
      console.warn("Could not query verified student profile for WhatsApp alert:", profileErr);
    }
  }

  return {
    success: true,
    message: "تم حفظ ورصد درجات الواجب بنجاح وإرسال التنبيه.",
    score: safeScore,
    maxScore: maxAssignmentScore,
    earnedXp,
    whatsappAutoDelivery,
    whatsappUrl,
  };
}
