import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { DomainError, NotFoundError } from "@/server/errors";

export interface CreateLiveSessionPayload {
  gradeId?: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes?: number;
  meetingUrl: string;
  meetingPassword?: string;
}

export async function getLiveSessionsData() {
  try {
    const dbSessions = await db
      .select({
        id: schema.liveSession.id,
        gradeId: schema.liveSession.gradeId,
        gradeSlug: schema.grade.slug,
        gradeTitle: schema.grade.titleEnglish,
        title: schema.liveSession.title,
        description: schema.liveSession.description,
        scheduledAt: schema.liveSession.scheduledAt,
        durationMinutes: schema.liveSession.durationMinutes,
        provider: schema.liveSession.provider,
        meetingUrl: schema.liveSession.meetingUrl,
        meetingPassword: schema.liveSession.meetingPassword,
        isLiveNow: schema.liveSession.isLiveNow,
        recordingUrl: schema.liveSession.recordingUrl,
      })
      .from(schema.liveSession)
      .leftJoin(schema.grade, eq(schema.liveSession.gradeId, schema.grade.id))
      .orderBy(desc(schema.liveSession.scheduledAt));

    return dbSessions.map((s) => ({
      id: s.id,
      gradeId: s.gradeId,
      gradeTitle: s.gradeTitle || "Grade 1",
      gradeSlug: s.gradeSlug || "grade-1",
      title: s.title,
      description: s.description || "",
      scheduledAt: s.scheduledAt ? s.scheduledAt.toISOString() : new Date().toISOString(),
      durationMinutes: s.durationMinutes,
      provider: s.provider,
      meetingUrl: s.meetingUrl,
      meetingPassword: s.meetingPassword || "",
      isLiveNow: s.isLiveNow,
      recordingUrl: s.recordingUrl || undefined,
      instructorName: "المعلم المشرف",
    }));
  } catch (err) {
    console.warn("Live sessions fetch DB note:", err);
    return [];
  }
}

export async function createLiveSession(payload: CreateLiveSessionPayload) {
  const { gradeId, title, description, scheduledAt, durationMinutes, meetingUrl, meetingPassword } = payload;

  if (!title || !title.trim()) {
    throw new DomainError("عنوان الحصة مطلوب");
  }

  if (!meetingUrl || !meetingUrl.trim()) {
    throw new DomainError("رابط الاجتماع مطلوب");
  }

  const parsedDate = scheduledAt ? new Date(scheduledAt) : null;
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    throw new DomainError("تاريخ ووقت الحصة غير صالح");
  }

  let targetGradeId = gradeId;
  if (!targetGradeId) {
    const [firstGrade] = await db.select().from(schema.grade).limit(1);
    if (firstGrade) targetGradeId = firstGrade.id;
  }

  if (!targetGradeId) {
    throw new NotFoundError("المرحلة الدراسية مطلوبة أو غير مسجلة");
  }

  const [inserted] = await db.insert(schema.liveSession).values({
    gradeId: targetGradeId,
    title: title.trim(),
    description: description?.trim() || null,
    scheduledAt: parsedDate,
    durationMinutes: durationMinutes || 60,
    provider: "zoom",
    meetingUrl: meetingUrl.trim(),
    meetingPassword: meetingPassword?.trim() || null,
    isLiveNow: false,
  }).returning();

  return {
    success: true,
    liveSession: inserted,
    message: "تم جدولة حصة البث المباشر بنجاح.",
  };
}

export async function toggleLiveSession(sessionId: string, isLiveNow: boolean) {
  if (!sessionId) throw new DomainError("معرف الحصة مطلوب");

  await db
    .update(schema.liveSession)
    .set({ isLiveNow: Boolean(isLiveNow) })
    .where(eq(schema.liveSession.id, sessionId));

  return {
    success: true,
    message: isLiveNow ? "🔴 تم بدء البث المباشر وإشعار الطلاب." : "تم إنهاء البث المباشر.",
  };
}

export async function deleteLiveSession(sessionId: string) {
  if (!sessionId) throw new DomainError("معرف الحصة مطلوب");

  await db.delete(schema.liveSession).where(eq(schema.liveSession.id, sessionId));
  return { success: true, message: "تم حذف جلسة البث المباشر بنجاح." };
}
