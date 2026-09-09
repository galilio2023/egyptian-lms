import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
import { validateEgyptianPhone } from "@/lib/utils";
import { DomainError } from "@/server/errors";

export interface SendBroadcastPayload {
  gradeSlug?: string;
  messageText?: string;
}

export async function sendBroadcast(payload: SendBroadcastPayload) {
  const { gradeSlug, messageText } = payload;

  if (!messageText || messageText.trim().length === 0) {
    throw new DomainError("نص الرسالة مطلوب");
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

  const validParents = parents
    .map((p) => ({
      ...p,
      cleanPhone: p.parentPhoneNumber ? validateEgyptianPhone(p.parentPhoneNumber) : null,
    }))
    .filter((p): p is typeof p & { cleanPhone: string } => Boolean(p.cleanPhone));

  const totalMatched = parents.length;
  const totalValidRecipients = validParents.length;

  let sentCount = 0;
  if (validParents.length > 0) {
    // Process real phone records (capped at batch limit of 50 to avoid gateway starvation)
    const batch = validParents.slice(0, 50);
    const results = await Promise.allSettled(
      batch.map((p) =>
        sendAutomatedWhatsAppNotification({
          to: p.cleanPhone,
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
    totalRecipients: totalValidRecipients,
    totalMatched,
    batchCapped: totalValidRecipients > 50,
    deliveredAt: new Date().toISOString(),
    message: sentCount > 0 
      ? `تم إرسال الرسالة بنجاح عبر API واتساب إلى ${sentCount} ولي أمر (من إجمالي ${totalValidRecipients}).`
      : "لم يتم العثور على أرقام أولياء أمور مسجلة وصالحة ومطابقة للشروط المحددة.",
  };
}
