import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";
import { getPlatformSettings } from "@/lib/utils/platform-settings";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const isAuthorized = userRole === "admin" || userRole === "teacher" || userRole === "assistant";

    if (!session || !isAuthorized) {
      return NextResponse.json(
        { error: "غير مصرح لك برصد درجات الواجب. يتطلب صلاحيات المشرف أو المعلم." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { submissionId, score, feedbackNotes, annotatedImages, studentName, parentPhone, assignmentTitle } = body as {
      submissionId: string;
      score: number;
      feedbackNotes: string;
      annotatedImages?: Array<{ pageIndex: number; dataUrl: string }>;
      studentName?: string;
      parentPhone?: string;
      assignmentTitle?: string;
    };

    if (!submissionId || typeof score !== "number") {
      return NextResponse.json(
        { error: "بيانات رصد الدرجة غير مكتملة." },
        { status: 400 }
      );
    }

    const safeScore = Math.max(0, Math.min(10, Math.round(score)));
    const earnedXp = safeScore >= 8 ? 30 : 15;

    let targetUserId: string | null = null;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId);
    if (!isUUID) {
      return NextResponse.json(
        { error: "معرف تسليم الواجب غير صالح." },
        { status: 400 }
      );
    }

    // 1. Persistence must succeed before any notification dispatch
    const [updatedSub] = await db.update(schema.homeworkSubmission)
      .set({
        score: safeScore,
        feedbackNotes: feedbackNotes?.trim() || null,
        annotatedImages,
        status: "graded",
        gradedAt: new Date(),
        gradedByUserId: session.user.id,
      })
      .where(eq(schema.homeworkSubmission.id, submissionId))
      .returning({ userId: schema.homeworkSubmission.userId });

    if (!updatedSub) {
      return NextResponse.json(
        { error: "لم يتم العثور على تسليم الواجب المطلوب في قاعدة البيانات." },
        { status: 404 }
      );
    }

    if (updatedSub.userId) {
      targetUserId = updatedSub.userId;
      const [profile] = await db
        .select()
        .from(schema.studentProfile)
        .where(eq(schema.studentProfile.userId, updatedSub.userId))
        .limit(1);

      if (profile) {
        await db
          .update(schema.studentProfile)
          .set({ xpPoints: (profile.xpPoints || 0) + earnedXp })
          .where(eq(schema.studentProfile.userId, updatedSub.userId));
      }
    }

    // 2. Fetch verified guardian phone from database record (CWE-200 / CWE-532 privacy protection)
    let verifiedParentPhone: string | null = null;
    if (targetUserId) {
      try {
        const [profile] = await db
          .select({ parentPhoneNumber: schema.studentProfile.parentPhoneNumber })
          .from(schema.studentProfile)
          .where(eq(schema.studentProfile.userId, targetUserId))
          .limit(1);

        if (profile?.parentPhoneNumber) {
          const digits = profile.parentPhoneNumber.replace(/\D/g, "");
          if (digits.length === 10 || digits.length === 11) {
            verifiedParentPhone = digits;
          }
        }
      } catch (profileErr) {
        console.warn("Could not query verified student profile:", profileErr);
      }
    }

    // 3. Automated server-side dispatch to parent only if verified number exists
    let whatsappAutoDelivery: { success: boolean; simulated?: boolean } = { success: false };
    let whatsappUrl: string | null = null;

    if (verifiedParentPhone) {
      const settings = await getPlatformSettings();
      const rawTextMessage = 
        `🌟 *تقرير تصحيح كراسة الواجب - ${settings.academyNameArabic}*\n` +
        `👤 *اسم البطل:* ${studentName || "بطل الأكاديمية"}\n` +
        `📝 *الواجب:* ${assignmentTitle || "كراسة التدريبات"}\n` +
        `🎯 *الدرجة المستحقة:* ${safeScore} من 10\n` +
        `⭐ *النقاط المكتسبة:* +${earnedXp} XP\n` +
        `✍️ *ملاحظات ${settings.teacherNameArabic}:* ${feedbackNotes || "ممتاز يا بطل!"}\n` +
        `يمكنكم مشاهدة صفحات الكراسة المصححة بالقلم الأحمر في حساب الطالب على المنصة 📜`;
      const msg = encodeURIComponent(rawTextMessage);

      try {
        whatsappAutoDelivery = await sendAutomatedWhatsAppNotification({
          to: verifiedParentPhone,
          message: rawTextMessage,
        });
      } catch (err) {
        console.warn("Automated WhatsApp homework dispatch note:", err);
      }

      whatsappUrl = `https://wa.me/2${verifiedParentPhone}?text=${msg}`;
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ درجات وتصحيح الواجب بنجاح وإرسال التنبيه.",
      earnedXp,
      whatsappAutoDelivery,
      whatsappUrl,
    });
  } catch (err) {
    console.error("Homework grade error:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء رصد درجات الواجب." },
      { status: 500 }
    );
  }
}
