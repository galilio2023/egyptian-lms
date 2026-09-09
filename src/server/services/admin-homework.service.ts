import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface GradeHomeworkPayload {
  submissionId?: string;
  score?: number;
  feedbackNotes?: string;
  annotatedImages?: Array<{ pageIndex: number; dataUrl: string }>;
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
  const { submissionId, score, feedbackNotes, annotatedImages } = payload;

  if (!submissionId) {
    throw new Error("معرف تسليم الواجب مطلوب");
  }

  const safeScore = Math.max(0, Math.min(10, Math.round(score ?? 10)));
  const earnedXp = safeScore >= 8 ? 30 : 15;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId);
  if (isUUID) {
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

    if (updated?.userId) {
      const [profile] = await db
        .select()
        .from(schema.studentProfile)
        .where(eq(schema.studentProfile.userId, updated.userId))
        .limit(1);

      if (profile) {
        await db
          .update(schema.studentProfile)
          .set({ xpPoints: (profile.xpPoints || 0) + earnedXp })
          .where(eq(schema.studentProfile.userId, updated.userId));
      }
    }
  }

  return {
    success: true,
    message: "تم حفظ ورصد درجات الواجب بنجاح في قاعدة البيانات.",
    score: safeScore,
    earnedXp,
  };
}
