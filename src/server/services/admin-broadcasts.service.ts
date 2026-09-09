import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";

export interface SendBroadcastPayload {
  gradeSlug?: string;
  messageText?: string;
}

export async function sendBroadcast(payload: SendBroadcastPayload) {
  const { gradeSlug, messageText } = payload;

  if (!messageText || messageText.trim().length === 0) {
    throw new Error("نص الرسالة مطلوب");
  }

  const conditions = [eq(schema.studentProfile.isBanned, false)];
  if (gradeSlug && gradeSlug !== "all") {
    const gradeNum = parseInt(gradeSlug.replace("grade-", ""), 10);
    if (!isNaN(gradeNum)) {
      conditions.push(eq(schema.studentProfile.gradeLevel, gradeNum));
    }
  }

  const parents = await db
    .select({
      parentPhoneNumber: schema.studentProfile.parentPhoneNumber,
      parentName: schema.studentProfile.parentName,
      studentName: schema.user.name,
    })
    .from(schema.studentProfile)
    .innerJoin(schema.user, eq(schema.studentProfile.userId, schema.user.id))
    .where(and(...conditions));

  let sentCount = 0;
  if (parents.length > 0) {
    // Process real phone records (capped at batch limit of 50 to avoid gateway starvation)
    const batch = parents.slice(0, 50);
    const results = await Promise.allSettled(
      batch.map((p) =>
        sendAutomatedWhatsAppNotification({
          to: p.parentPhoneNumber,
          message: messageText,
        })
      )
    );
    sentCount = results.filter(
      (r) => r.status === "fulfilled" && (r.value as { success?: boolean })?.success !== false
    ).length;
  }

  return {
    success: true,
    sentCount,
    deliveredAt: new Date().toISOString(),
    message: sentCount > 0 
      ? `تم إرسال الرسالة بنجاح عبر API واتساب إلى ${sentCount} ولي أمر.`
      : "لم يتم العثور على أرقام أولياء أمور مسجلة ومطابقة للشروط المحددة.",
  };
}
