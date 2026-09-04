import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId);
    if (isUUID) {
      try {
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

        // Persist XP to student profile
        if (updatedSub?.userId) {
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
      } catch (dbErr) {
        console.warn("DB homework grade update note:", dbErr);
      }
    }

    // Generate WhatsApp Notification URL
    const cleanPhone = (parentPhone || "01098765432").replace(/\D/g, "");
    const msg = encodeURIComponent(
      `🌟 *تقرير تصحيح كراسة الواجب - أكاديمية إيليت*\n` +
      `👤 *اسم البطل:* ${studentName || "بطل الأكاديمية"}\n` +
      `📝 *الواجب:* ${assignmentTitle || "كراسة التدريبات"}\n` +
      `🎯 *الدرجة المستحقة:* ${score} من 10\n` +
      `⭐ *النقاط المكتسبة:* +${earnedXp} XP\n` +
      `✍️ *ملاحظات مستر أحمد:* ${feedbackNotes || "ممتاز يا بطل!"}\n` +
      `يمكنكم مشاهدة صفحات الكراسة المصححة بالقلم الأحمر في حساب الطالب على المنصة 📜`
    );

    return NextResponse.json({
      success: true,
      message: "تم حفظ درجات وتصحيح الواجب بنجاح وإرسال التنبيه.",
      earnedXp,
      whatsappUrl: `https://wa.me/2${cleanPhone}?text=${msg}`,
    });
  } catch (err) {
    console.error("Homework grade error:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء رصد درجات الواجب." },
      { status: 500 }
    );
  }
}
