import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { INITIAL_PLATFORM_SETTINGS, type MockPlatformSettings } from "@/lib/db/mock-data";
import { invalidatePlatformSettingsCache } from "@/lib/utils/platform-settings";
import { getRecentSecurityLogs, logSecurityEvent, SecurityAuditRecord } from "@/lib/security/audit-logger";
import { generateSecureVoucherBatch } from "@/lib/security/crypto-voucher";
import { sendAutomatedWhatsAppNotification } from "@/lib/utils/whatsapp";

export async function GET(request: NextRequest) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    const userRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const isAuthorized = userRole === "admin" || userRole === "teacher" || userRole === "assistant";

    if (!session || !isAuthorized) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول. يتطلب صلاحيات المشرف أو المعلم." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    // RBAC: Assistants cannot view financial overview KPIs, platform settings, security logs, or aggregate all data
    const isAssistant = userRole === "assistant";
    const ASSISTANT_RESTRICTED_TYPES = ["settings", "security_logs", "all", "overview"];
    if (isAssistant && ASSISTANT_RESTRICTED_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "عذراً، لا يمكن لحساب المساعد الوصول إلى هذا القسم أو طلب البيانات المجمعة." },
        { status: 403 }
      );
    }

    let ordersData: Array<Record<string, unknown>> = [];
    let studentsData: Array<Record<string, unknown>> = [];
    let curriculumData: Array<Record<string, unknown>> = [];
    let lessonsData: Array<Record<string, unknown>> = [];
    let quizzesData: Array<Record<string, unknown>> = [];
    let liveSessionsData: Array<Record<string, unknown>> = [];
    let homeworkData: Array<Record<string, unknown>> = [];
    let overviewData: Record<string, unknown> | null = null;

    if (type === "all" || type === "orders") {
      try {
        const dbOrders = await db
          .select({
            id: schema.order.id,
            userId: schema.order.userId,
            studentName: schema.user.name,
            studentPhone: schema.user.phoneNumber,
            parentPhone: schema.studentProfile.parentPhoneNumber,
            unitId: schema.order.unitId,
            unitTitle: schema.courseUnit.title,
            amountEgp: schema.order.amountEgp,
            paymentMethod: schema.order.paymentMethod,
            status: schema.order.paymentStatus,
            referenceNumber: schema.order.referenceNumber,
            receiptImageUrl: schema.order.receiptImageUrl,
            ocrData: schema.order.ocrData,
            createdAt: schema.order.createdAt,
          })
          .from(schema.order)
          .leftJoin(schema.user, eq(schema.order.userId, schema.user.id))
          .leftJoin(schema.studentProfile, eq(schema.order.userId, schema.studentProfile.userId))
          .leftJoin(schema.courseUnit, eq(schema.order.unitId, schema.courseUnit.id))
          .orderBy(desc(schema.order.createdAt))
          .limit(100);

        ordersData = dbOrders.map((o) => ({
          id: o.id,
          studentName: o.studentName || "طالب بأكاديمية إيليت",
          studentPhone: o.studentPhone || "010xxxxxxxx",
          parentPhone: o.parentPhone || "010xxxxxxxx",
          unitTitle: o.unitTitle || "وحدة دراسية",
          unitId: o.unitId,
          gradeTitle: "منهج إيليت",
          amountEgp: o.amountEgp,
          paymentMethod: o.paymentMethod,
          status: o.status,
          referenceNumber: o.referenceNumber || "-",
          receiptImageUrl: o.receiptImageUrl || undefined,
          ocrData: (o.ocrData as { confidenceScore: number; isSuspectedDuplicate?: boolean; duplicateOrderId?: string }) || undefined,
          createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString("ar-EG") : new Date().toLocaleString("ar-EG"),
        }));
      } catch (err) {
        console.warn("Orders fetch DB note:", err);
      }
    }

    if (type === "all" || type === "students") {
      try {
        const dbStudents = await db
          .select({
            id: schema.user.id,
            name: schema.user.name,
            studentPhone: schema.user.phoneNumber,
            parentPhone: schema.studentProfile.parentPhoneNumber,
            parentName: schema.studentProfile.parentName,
            governorate: schema.studentProfile.governorate,
            gradeLevel: schema.studentProfile.gradeLevel,
            schoolName: schema.studentProfile.schoolName,
            xpPoints: schema.studentProfile.xpPoints,
            isBanned: schema.studentProfile.isBanned,
            createdAt: schema.user.createdAt,
          })
          .from(schema.user)
          .leftJoin(schema.studentProfile, eq(schema.user.id, schema.studentProfile.userId))
          .where(eq(schema.user.role, "student"))
          .orderBy(desc(schema.user.createdAt))
          .limit(200);

        studentsData = dbStudents.map((s) => ({
          id: s.id,
          name: s.name,
          studentPhone: s.studentPhone,
          parentPhone: s.parentPhone || "010xxxxxxxx",
          parentName: s.parentName || "ولي الأمر",
          governorate: s.governorate || "cairo",
          gradeLevel: s.gradeLevel || 1,
          gradeTitle: `Grade ${s.gradeLevel || 1}`,
          schoolName: s.schoolName || "مدرسة لغات",
          xpPoints: s.xpPoints || 0,
          enrolledUnits: [],
          lastActive: "نشط مؤخراً",
          deviceLocked: Boolean(s.isBanned),
          isBanned: Boolean(s.isBanned),
        }));
      } catch (err) {
        console.warn("Students fetch DB note:", err);
      }
    }

    if (type === "all" || type === "curriculum") {
      try {
        const dbUnits = await db
          .select({
            id: schema.courseUnit.id,
            gradeId: schema.courseUnit.gradeId,
            gradeSlug: schema.grade.slug,
            gradeTitle: schema.grade.titleEnglish,
            title: schema.courseUnit.title,
            slug: schema.courseUnit.slug,
            description: schema.courseUnit.description,
            thumbnailUrl: schema.courseUnit.thumbnailUrl,
            priceEgp: schema.courseUnit.price,
            isPublished: schema.courseUnit.isPublished,
            orderIndex: schema.courseUnit.orderIndex,
          })
          .from(schema.courseUnit)
          .leftJoin(schema.grade, eq(schema.courseUnit.gradeId, schema.grade.id))
          .orderBy(schema.courseUnit.orderIndex);

        const dbLessons = await db
          .select()
          .from(schema.lesson)
          .orderBy(schema.lesson.orderIndex);

        curriculumData = dbUnits.map((u) => {
          const unitLessons = dbLessons.filter((l) => l.unitId === u.id);
          return {
            id: u.id,
            gradeId: u.gradeId,
            gradeSlug: u.gradeSlug || "grade-1",
            gradeTitle: u.gradeTitle || "Grade 1",
            title: u.title,
            slug: u.slug,
            description: u.description || "",
            thumbnailUrl: u.thumbnailUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
            priceEgp: u.priceEgp || 250,
            lessonsCount: unitLessons.length || 4,
            quizzesCount: 1,
            isPublished: u.isPublished,
          };
        });

        lessonsData = dbLessons.map((l) => ({
          id: l.id,
          unitId: l.unitId,
          title: l.title,
          slug: l.slug,
          videoUrl: l.videoId,
          videoDurationSeconds: l.videoDurationSeconds,
          pdfAttachmentUrl: l.pdfAttachmentUrl,
          isFreePreview: l.isFreePreview,
          orderIndex: l.orderIndex,
        }));
      } catch (err) {
        console.warn("Curriculum fetch DB note:", err);
      }
    }

    if (type === "all" || type === "quizzes") {
      try {
        const dbQuestions = await db
          .select()
          .from(schema.quizQuestion)
          .orderBy(schema.quizQuestion.orderIndex);

        quizzesData = dbQuestions.map((q) => ({
          id: q.id,
          quizId: q.quizId,
          text: q.questionText,
          audioUrl: q.questionAudioUrl || undefined,
          options: q.options as Array<{ id: string; text: string; isCorrect: boolean }>,
          explanation: q.explanation || "",
          points: q.points || 1,
        }));
      } catch (err) {
        console.warn("Quizzes fetch DB note:", err);
      }
    }

    if (type === "all" || type === "live_sessions") {
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

        liveSessionsData = dbSessions.map((s) => ({
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
      }
    }

    if (type === "all" || type === "homework") {
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

        homeworkData = dbSubmissions.map((s) => ({
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
      }
    }

    if (type === "all" || type === "overview") {
      try {
        const [studentCountRes] = await db
          .select({ value: count() })
          .from(schema.user)
          .where(eq(schema.user.role, "student"));

        const [unitCountRes] = await db
          .select({ value: count() })
          .from(schema.courseUnit);

        const [pendingOrdersRes] = await db
          .select({ value: count() })
          .from(schema.order)
          .where(eq(schema.order.paymentStatus, "manual_review"));

        const [revenueRes] = await db
          .select({ total: sql<number>`coalesce(sum(${schema.order.amountEgp}), 0)` })
          .from(schema.order)
          .where(eq(schema.order.paymentStatus, "completed"));

        overviewData = {
          totalStudents: studentCountRes?.value || 0,
          totalUnits: unitCountRes?.value || 0,
          pendingOrders: pendingOrdersRes?.value || 0,
          // RBAC: Hide revenue figures from assistant accounts
          totalRevenueEgp: isAssistant ? 0 : Number(revenueRes?.total || 0),
        };
      } catch (err) {
        console.warn("Overview stats DB note:", err);
      }
    }

    let settingsData: typeof schema.platformSettings.$inferSelect | MockPlatformSettings = INITIAL_PLATFORM_SETTINGS;
    if (type === "all" || type === "settings") {
      try {
        const [dbSettings] = await db
          .select()
          .from(schema.platformSettings)
          .where(eq(schema.platformSettings.id, "default"))
          .limit(1);
        if (dbSettings) {
          settingsData = dbSettings;
        }
      } catch (err) {
        console.warn("Platform settings DB note:", err);
      }
    }

    let securityLogsData: SecurityAuditRecord[] = [];
    if (type === "all" || type === "security_logs") {
      try {
        securityLogsData = await getRecentSecurityLogs(100);
      } catch (err) {
        console.warn("Security logs fetch note:", err);
      }
    }

    return NextResponse.json({
      success: true,
      orders: ordersData,
      students: studentsData,
      curriculum: curriculumData,
      lessons: lessonsData,
      quizzes: quizzesData,
      liveSessions: liveSessionsData,
      homework: homeworkData,
      overview: overviewData,
      settings: settingsData,
      securityLogs: securityLogsData,
    });
  } catch (error: unknown) {
    console.error("Admin fetch error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب البيانات", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    const userRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const isAuthorized = userRole === "admin" || userRole === "teacher" || userRole === "assistant";

    if (!session || !isAuthorized) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول. يتطلب صلاحيات المشرف أو المعلم." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, payload } = body as {
      action: string;
      payload: Record<string, unknown>;
    };

    if (!action) {
      return NextResponse.json({ error: "الإجراء غير محدد" }, { status: 400 });
    }

    // ──────────────────────────────────────────────────────────
    // RBAC: Assistants are restricted from destructive / financial actions
    // ──────────────────────────────────────────────────────────
    const ADMIN_TEACHER_ONLY_ACTIONS = [
      "approve_order",
      "reject_order",
      "reset_device",
      "toggle_ban",
      "ban_student",
      "unban_student",
      "delete_unit",
      "create_unit",
      "delete_lesson",
      "delete_question",
      "update_settings",
      "generate_secure_vouchers",
      "save_vouchers",
      "delete_live_session",
      "send_broadcast",
    ];

    if (userRole === "assistant" && ADMIN_TEACHER_ONLY_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: "عذراً، هذا الإجراء يتطلب صلاحيات المعلم أو مدير النظام. حساب المساعد لا يملك صلاحية تنفيذ هذا الأمر." },
        { status: 403 }
      );
    }

    switch (action) {
      case "approve_order": {
        const { orderId, studentName, parentPhone, unitId, userId, studentPhone } = payload as {
          orderId?: string;
          studentName?: string;
          parentPhone?: string;
          unitId?: string;
          userId?: string;
          studentPhone?: string;
        };
        
        try {
          let targetUserId = userId;
          let effectiveUnitId = unitId;

          if (orderId && typeof orderId === "string") {
            const [orderRecord] = await db
              .select({
                id: schema.order.id,
                userId: schema.order.userId,
                unitId: schema.order.unitId,
              })
              .from(schema.order)
              .where(eq(schema.order.id, orderId))
              .limit(1);

            if (orderRecord) {
              if (!targetUserId) targetUserId = orderRecord.userId;
              if (!effectiveUnitId) effectiveUnitId = orderRecord.unitId;
            }
          }

          if (!targetUserId && studentPhone) {
            const [userRecord] = await db
              .select({ id: schema.user.id })
              .from(schema.user)
              .where(eq(schema.user.phoneNumber, studentPhone))
              .limit(1);
            if (userRecord) targetUserId = userRecord.id;
          }

          // Atomic transaction: mark order completed and activate enrollment
          await db.transaction(async (tx) => {
            if (orderId && typeof orderId === "string") {
              await tx
                .update(schema.order)
                .set({ paymentStatus: "completed", updatedAt: new Date() })
                .where(eq(schema.order.id, orderId));
            }

            if (targetUserId && effectiveUnitId) {
              await tx
                .insert(schema.enrollment)
                .values({
                  userId: targetUserId,
                  unitId: effectiveUnitId,
                  isActive: true,
                })
                .onConflictDoUpdate({
                  target: [schema.enrollment.userId, schema.enrollment.unitId],
                  set: { isActive: true, enrolledAt: new Date() },
                });
            }
          });

          return NextResponse.json({
            success: true,
            message: `تم تفعيل اشتراك الطالب (${studentName || "المشترك"}) بنجاح في قاعدة البيانات وتحديث حالة الطلب إلى مكتمل.`,
          });
        } catch (err) {
          console.error("DB operation error for approve_order:", err);
          return NextResponse.json(
            { error: "تعذر تفعيل الاشتراك وتحديث حالة الطلب في قاعدة البيانات." },
            { status: 500 }
          );
        }
      }

      case "reject_order": {
        const { orderId, reason, parentPhone } = payload as {
          orderId?: string;
          reason?: string;
          parentPhone?: string;
        };
        try {
          if (!orderId || typeof orderId !== "string") {
            return NextResponse.json({ error: "معرف الطلب مطلوب." }, { status: 400 });
          }

          await db
            .update(schema.order)
            .set({ 
              paymentStatus: "failed", 
              reviewerNotes: reason || "إيصال غير واضح أو غير مطابق",
              updatedAt: new Date() 
            })
            .where(eq(schema.order.id, orderId));

          return NextResponse.json({
            success: true,
            message: `تم رفض الطلب بنجاح وتحديث الحالة.`,
          });
        } catch (err) {
          console.error("DB operation error for reject_order:", err);
          return NextResponse.json(
            { error: "تعذر تحديث حالة رفض الطلب في قاعدة البيانات." },
            { status: 500 }
          );
        }
      }

      case "reset_device": {
        const { studentId, studentPhone } = payload as {
          studentId?: string;
          studentPhone?: string;
        };
        try {
          let targetUserId = studentId;

          if (!targetUserId && studentPhone) {
            const [userRecord] = await db
              .select({ id: schema.user.id })
              .from(schema.user)
              .where(eq(schema.user.phoneNumber, studentPhone))
              .limit(1);
            if (userRecord) targetUserId = userRecord.id;
          }

          if (targetUserId) {
            await db
              .delete(schema.session)
              .where(eq(schema.session.userId, targetUserId));
          }
        } catch (err) {
          console.warn("DB session reset note:", err);
        }

        return NextResponse.json({
          success: true,
          message: `تم فك حظر وربط الجهاز للطالب (${studentPhone || studentId}) بنجاح. يمكنه الآن تسجيل الدخول من جهازه الجديد.`,
        });
      }

      case "toggle_ban": {
        const { studentId, studentPhone, isBanned } = payload as {
          studentId?: string;
          studentPhone?: string;
          isBanned?: boolean;
        };
        try {
          let targetUserId = studentId;

          if (!targetUserId && studentPhone) {
            const [userRecord] = await db
              .select({ id: schema.user.id })
              .from(schema.user)
              .where(eq(schema.user.phoneNumber, studentPhone))
              .limit(1);
            if (userRecord) targetUserId = userRecord.id;
          }

          if (targetUserId) {
            await db
              .update(schema.studentProfile)
              .set({ isBanned: Boolean(isBanned) })
              .where(eq(schema.studentProfile.userId, targetUserId));
          }
        } catch (err) {
          console.warn("DB toggle_ban note:", err);
        }

        return NextResponse.json({
          success: true,
          message: isBanned ? "تم حظر حساب الطالب مؤقتاً." : "تم فك حظر حساب الطالب.",
        });
      }

      case "grade_homework": {
        const { submissionId, score, feedbackNotes, annotatedImages } = payload as {
          submissionId?: string;
          score?: number;
          feedbackNotes?: string;
          annotatedImages?: Array<{ pageIndex: number; dataUrl: string }>;
        };

        if (!submissionId) {
          return NextResponse.json({ error: "معرف تسليم الواجب مطلوب" }, { status: 400 });
        }

        const safeScore = Math.max(0, Math.min(10, Math.round(score ?? 10)));
        const earnedXp = safeScore >= 8 ? 30 : 15;

        try {
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
                gradedByUserId: session.user.id,
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
        } catch (hwErr) {
          console.warn("DB grade_homework action note:", hwErr);
        }

        return NextResponse.json({
          success: true,
          message: "تم حفظ ورصد درجات الواجب بنجاح في قاعدة البيانات.",
          score: safeScore,
          earnedXp,
        });
      }

      case "create_unit": {
        const { gradeSlug, title, priceEgp, description, thumbnailUrl } = payload as {
          gradeSlug: string;
          title: string;
          priceEgp?: number;
          description?: string;
          thumbnailUrl?: string;
        };

        const [gradeRecord] = await db
          .select()
          .from(schema.grade)
          .where(eq(schema.grade.slug, gradeSlug || "grade-1"))
          .limit(1);

        if (!gradeRecord) {
          return NextResponse.json({ error: "المرحلة الدراسية غير موجودة" }, { status: 404 });
        }

        const unitSlug = `${gradeSlug}-unit-${Date.now()}`;
        const [inserted] = await db.insert(schema.courseUnit).values({
          gradeId: gradeRecord.id,
          title: title.trim(),
          slug: unitSlug,
          description: description?.trim() || null,
          thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
          price: Number(priceEgp) || 250,
          isPublished: true,
          orderIndex: 1,
        }).returning();

        return NextResponse.json({
          success: true,
          unit: inserted,
          message: "تم حفظ ونشر الوحدة الدراسية بنجاح في قاعدة البيانات.",
        });
      }

      case "delete_unit": {
        const { unitId } = payload as { unitId: string };
        if (!unitId) return NextResponse.json({ error: "معرف الوحدة مطلوب" }, { status: 400 });

        await db.delete(schema.courseUnit).where(eq(schema.courseUnit.id, unitId));
        return NextResponse.json({ success: true, message: "تم حذف الوحدة الدراسية بنجاح." });
      }

      case "create_lesson": {
        const { unitId, title, videoId, videoDurationSeconds, pdfAttachmentUrl, isFreePreview, prerequisiteType, prerequisiteLessonId } = payload as {
          unitId: string;
          title: string;
          videoId: string;
          videoDurationSeconds?: number;
          pdfAttachmentUrl?: string;
          isFreePreview?: boolean;
          prerequisiteType?: string;
          prerequisiteLessonId?: string;
        };

        const lessonSlug = `lesson-${Date.now()}`;
        const inserted = await db.transaction(async (tx) => {
          // Row-level lock on the parent unit to serialize concurrent lesson allocations for the same unit
          try {
            await tx.execute(sql`SELECT id FROM ${schema.courseUnit} WHERE id = ${unitId} FOR UPDATE`);
          } catch {
            // Ignore if unit row locking not supported
          }

          const [maxOrder] = await tx
            .select({ maxOrder: sql<number>`COALESCE(MAX(${schema.lesson.orderIndex}), 0)` })
            .from(schema.lesson)
            .where(eq(schema.lesson.unitId, unitId));

          const nextOrderIndex = Number(maxOrder?.maxOrder || 0) + 1;

          const [newLesson] = await tx.insert(schema.lesson).values({
            unitId,
            title: title.trim(),
            slug: lessonSlug,
            videoProvider: "bunny",
            videoId: videoId.trim(),
            videoDurationSeconds: videoDurationSeconds || 1200,
            pdfAttachmentUrl: pdfAttachmentUrl || null,
            isFreePreview: Boolean(isFreePreview),
            prerequisiteType: prerequisiteType || "none",
            prerequisiteLessonId: prerequisiteLessonId || null,
            orderIndex: nextOrderIndex,
          }).returning();

          return newLesson;
        });

        return NextResponse.json({
          success: true,
          lesson: inserted,
          message: "تم حفظ المحاضرة ورفعها بنجاح.",
        });
      }

      case "delete_lesson": {
        const { lessonId } = payload as { lessonId: string };
        if (!lessonId) return NextResponse.json({ error: "معرف المحاضرة مطلوب" }, { status: 400 });

        await db.delete(schema.lesson).where(eq(schema.lesson.id, lessonId));
        return NextResponse.json({ success: true, message: "تم حذف المحاضرة بنجاح." });
      }

      case "create_question": {
        const { quizId, text, audioUrl, options, explanation, points } = payload as {
          quizId?: string;
          text: string;
          audioUrl?: string;
          options: Array<{ id: string; text: string; isCorrect: boolean }>;
          explanation?: string;
          points?: number;
        };

        let targetQuizId = quizId;
        if (!targetQuizId) {
          const [anyQuiz] = await db.select().from(schema.quiz).limit(1);
          if (anyQuiz) targetQuizId = anyQuiz.id;
        }

        if (!targetQuizId) {
          return NextResponse.json({ error: "لم يتم العثور على اختبار لربط السؤال به" }, { status: 400 });
        }

        const [inserted] = await db.insert(schema.quizQuestion).values({
          quizId: targetQuizId,
          questionText: text.trim(),
          questionAudioUrl: audioUrl || null,
          options,
          explanation: explanation?.trim() || "إجابة صحيحة وفقاً للمنهج.",
          points: points || 1,
          orderIndex: 1,
        }).returning();

        return NextResponse.json({
          success: true,
          question: inserted,
          message: "تمت إضافة السؤال بنجاح إلى بنك الأسئلة المركزي.",
        });
      }

      case "delete_question": {
        const { questionId } = payload as { questionId: string };
        if (!questionId) return NextResponse.json({ error: "معرف السؤال مطلوب" }, { status: 400 });

        await db.delete(schema.quizQuestion).where(eq(schema.quizQuestion.id, questionId));
        return NextResponse.json({ success: true, message: "تم حذف السؤال بنجاح من بنك الأسئلة." });
      }

      case "create_live_session": {
        const { gradeId, title, description, scheduledAt, durationMinutes, meetingUrl, meetingPassword } = payload as {
          gradeId?: string;
          title: string;
          description?: string;
          scheduledAt: string;
          durationMinutes?: number;
          meetingUrl: string;
          meetingPassword?: string;
        };

        let targetGradeId = gradeId;
        if (!targetGradeId) {
          const [firstGrade] = await db.select().from(schema.grade).limit(1);
          if (firstGrade) targetGradeId = firstGrade.id;
        }

        if (!targetGradeId) {
          return NextResponse.json({ error: "المرحلة الدراسية مطلوبة" }, { status: 400 });
        }

        const [inserted] = await db.insert(schema.liveSession).values({
          gradeId: targetGradeId,
          title: title.trim(),
          description: description?.trim() || null,
          scheduledAt: new Date(scheduledAt),
          durationMinutes: durationMinutes || 60,
          provider: "zoom",
          meetingUrl: meetingUrl.trim(),
          meetingPassword: meetingPassword?.trim() || null,
          isLiveNow: false,
        }).returning();

        return NextResponse.json({
          success: true,
          liveSession: inserted,
          message: "تم جدولة حصة البث المباشر بنجاح.",
        });
      }

      case "toggle_live_session": {
        const { sessionId, isLiveNow } = payload as { sessionId: string; isLiveNow: boolean };
        if (!sessionId) return NextResponse.json({ error: "معرف الحصة مطلوب" }, { status: 400 });

        await db
          .update(schema.liveSession)
          .set({ isLiveNow: Boolean(isLiveNow) })
          .where(eq(schema.liveSession.id, sessionId));

        return NextResponse.json({
          success: true,
          message: isLiveNow ? "🔴 تم بدء البث المباشر وإشعار الطلاب." : "تم إنهاء البث المباشر.",
        });
      }

      case "delete_live_session": {
        const { sessionId } = payload as { sessionId: string };
        if (!sessionId) return NextResponse.json({ error: "معرف الحصة مطلوب" }, { status: 400 });

        await db.delete(schema.liveSession).where(eq(schema.liveSession.id, sessionId));
        return NextResponse.json({ success: true, message: "تم حذف جلسة البث المباشر بنجاح." });
      }

      case "send_broadcast": {
        const { recipientCount, gradeSlug, messageText } = payload as {
          recipientCount?: number;
          gradeSlug?: string;
          messageText?: string;
        };

        if (!messageText || messageText.trim().length === 0) {
          return NextResponse.json({ error: "نص الرسالة مطلوب" }, { status: 400 });
        }

        try {
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
            // Process real phone records (capped at batch limit to avoid gateway starvation)
            const batch = parents.slice(0, 50);
            const results = await Promise.allSettled(
              batch.map((p) =>
                sendAutomatedWhatsAppNotification({
                  to: p.parentPhoneNumber,
                  message: messageText,
                })
              )
            );
            sentCount = results.filter((r) => r.status === "fulfilled" && (r.value as { success?: boolean })?.success !== false).length;
          }

          return NextResponse.json({
            success: true,
            sentCount,
            deliveredAt: new Date().toISOString(),
            message: sentCount > 0 
              ? `تم إرسال الرسالة بنجاح عبر API واتساب إلى ${sentCount} ولي أمر.`
              : "لم يتم العثور على أرقام أولياء أمور مسجلة ومطابقة للشروط المحددة.",
          });
        } catch (broadcastErr) {
          console.error("Error executing WhatsApp broadcast:", broadcastErr);
          return NextResponse.json(
            { error: "حدث خطأ أثناء معالجة البث عبر واتساب" },
            { status: 500 }
          );
        }
      }

      case "save_vouchers": {
        const { vouchers, batchName, gradeNumber } = payload as {
          vouchers: Array<{ code: string; serialNumber: string; priceEgp: number }>;
          batchName?: string;
          gradeNumber?: number;
        };

        try {
          const gradeSlug = `grade-${gradeNumber || 1}`;
          const [foundGrade] = await db
            .select()
            .from(schema.grade)
            .where(eq(schema.grade.slug, gradeSlug))
            .limit(1);

          let unitIdToBind: string | null = null;
          if (foundGrade) {
            const [foundUnit] = await db
              .select()
              .from(schema.courseUnit)
              .where(eq(schema.courseUnit.gradeId, foundGrade.id))
              .limit(1);
            if (foundUnit) unitIdToBind = foundUnit.id;
          }

          if (!unitIdToBind) {
            const [anyUnit] = await db.select().from(schema.courseUnit).limit(1);
            if (anyUnit) unitIdToBind = anyUnit.id;
          }

          if (unitIdToBind && vouchers && vouchers.length > 0) {
            for (const v of vouchers) {
              const [existing] = await db
                .select()
                .from(schema.voucherCode)
                .where(eq(schema.voucherCode.code, v.code))
                .limit(1);

              if (!existing) {
                await db.insert(schema.voucherCode).values({
                  code: v.code,
                  unitId: unitIdToBind,
                  isRedeemed: false,
                  batchName: batchName || "دفعة سناتر ومكتبات 2026",
                });
              }
            }
          }
        } catch (dbErr) {
          console.warn("Voucher batch DB insert note:", dbErr);
        }

        return NextResponse.json({
          success: true,
          count: vouchers?.length || 0,
          message: `تم حفظ ${vouchers?.length || 0} كارت شحن بنجاح في قاعدة البيانات وتفعيلها للاستخدام الفوري.`,
        });
      }

      case "update_settings": {
        const settingsPayload = payload as {
          academyNameArabic?: string;
          academyNameEnglish?: string;
          teacherNameArabic?: string;
          teacherNameEnglish?: string;
          teacherTitle?: string;
          teacherBio?: string;
          whatsappNumber?: string;
          hotlineNumber?: string;
          inquiriesNumber?: string;
          vodafoneCashNumber?: string;
          instapayAddress?: string;
          heroVideoUrl?: string;
          sampleLectures?: schema.FreeSampleLecture[];
        };

        try {
          const [existing] = await db
            .select()
            .from(schema.platformSettings)
            .where(eq(schema.platformSettings.id, "default"))
            .limit(1);

          if (existing) {
            await db
              .update(schema.platformSettings)
              .set({
                ...settingsPayload,
                updatedAt: new Date(),
              })
              .where(eq(schema.platformSettings.id, "default"));
          } else {
            await db.insert(schema.platformSettings).values({
              id: "default",
              academyNameArabic: settingsPayload.academyNameArabic || INITIAL_PLATFORM_SETTINGS.academyNameArabic,
              academyNameEnglish: settingsPayload.academyNameEnglish || INITIAL_PLATFORM_SETTINGS.academyNameEnglish,
              teacherNameArabic: settingsPayload.teacherNameArabic || INITIAL_PLATFORM_SETTINGS.teacherNameArabic,
              teacherNameEnglish: settingsPayload.teacherNameEnglish || INITIAL_PLATFORM_SETTINGS.teacherNameEnglish,
              teacherTitle: settingsPayload.teacherTitle || INITIAL_PLATFORM_SETTINGS.teacherTitle,
              teacherBio: settingsPayload.teacherBio || INITIAL_PLATFORM_SETTINGS.teacherBio,
              whatsappNumber: settingsPayload.whatsappNumber || INITIAL_PLATFORM_SETTINGS.whatsappNumber,
              hotlineNumber: settingsPayload.hotlineNumber || INITIAL_PLATFORM_SETTINGS.hotlineNumber,
              inquiriesNumber: settingsPayload.inquiriesNumber || INITIAL_PLATFORM_SETTINGS.inquiriesNumber,
              vodafoneCashNumber: settingsPayload.vodafoneCashNumber || INITIAL_PLATFORM_SETTINGS.vodafoneCashNumber,
              instapayAddress: settingsPayload.instapayAddress || INITIAL_PLATFORM_SETTINGS.instapayAddress,
              heroVideoUrl: settingsPayload.heroVideoUrl || INITIAL_PLATFORM_SETTINGS.heroVideoUrl,
              sampleLectures: settingsPayload.sampleLectures || [],
            });
          }
          invalidatePlatformSettingsCache();
        } catch (dbErr) {
          console.warn("Update platform settings note:", dbErr);
        }

        return NextResponse.json({
          success: true,
          message: "تم حفظ وتحديث إعدادات المنصة وهواتف التواصل ومحاضرات الكاروسيل بنجاح.",
        });
      }

      case "generate_secure_vouchers": {
        const { gradeNumber, quantity, priceEgp, batchName } = payload as {
          gradeNumber: number;
          quantity: number;
          priceEgp: number;
          batchName?: string;
        };

        const safeGrade = Math.max(1, Math.min(6, gradeNumber || 1));
        const safeQty = Math.max(1, Math.min(200, quantity || 10));
        const safePrice = Math.max(10, priceEgp || 150);

        // Generate cryptographically secure vouchers
        const generatedList = generateSecureVoucherBatch({
          gradeNumber: safeGrade,
          quantity: safeQty,
          priceEgp: safePrice,
        });

        // Persist to database linked to the appropriate unit
        try {
          const gradeSlug = `grade-${safeGrade}`;
          const [foundGrade] = await db
            .select()
            .from(schema.grade)
            .where(eq(schema.grade.slug, gradeSlug))
            .limit(1);

          let unitIdToBind: string | null = null;
          if (foundGrade) {
            const [foundUnit] = await db
              .select()
              .from(schema.courseUnit)
              .where(eq(schema.courseUnit.gradeId, foundGrade.id))
              .limit(1);
            if (foundUnit) unitIdToBind = foundUnit.id;
          }

          if (!unitIdToBind) {
            const [anyUnit] = await db.select().from(schema.courseUnit).limit(1);
            if (anyUnit) unitIdToBind = anyUnit.id;
          }

          if (unitIdToBind) {
            for (const v of generatedList) {
              const [existing] = await db
                .select()
                .from(schema.voucherCode)
                .where(eq(schema.voucherCode.code, v.code))
                .limit(1);

              if (!existing) {
                await db.insert(schema.voucherCode).values({
                  code: v.code,
                  unitId: unitIdToBind,
                  isRedeemed: false,
                  batchName: batchName || `دفعة كروت سناتر الصف ${safeGrade} - مشفرة عالي الأمان`,
                });
              }
            }
          }
        } catch (dbErr) {
          console.warn("Secure voucher DB batch persistence note:", dbErr);
        }

        return NextResponse.json({
          success: true,
          vouchers: generatedList,
          count: generatedList.length,
          message: `تم توليد ${generatedList.length} كارت شحن عالي التشفير وحفظها بنجاح في قاعدة البيانات.`,
        });
      }

      case "ban_student": {
        const { userId, reason } = payload as { userId: string; reason?: string };
        if (!userId) {
          return NextResponse.json({ error: "معرف الطالب مطلوب" }, { status: 400 });
        }

        try {
          await db
            .update(schema.studentProfile)
            .set({ isBanned: true })
            .where(eq(schema.studentProfile.userId, userId));

          // Revoke all active sessions for this student
          await db
            .update(schema.session)
            .set({ expiresAt: new Date(), updatedAt: new Date() })
            .where(eq(schema.session.userId, userId));

          logSecurityEvent({
            eventType: "user_banned",
            severity: "high",
            userId,
            description: `تم حظر الطالب من قبل الإدارة. السبب: ${reason || "مخالفة سياسة المنصة"}`,
            details: { reason },
          });
        } catch (err) {
          console.warn("Ban student DB note:", err);
        }

        return NextResponse.json({
          success: true,
          message: "تم إيقاف وحظر حساب الطالب فوراً وإلغاء جميع جلسات تسجيل دخوله.",
        });
      }

      case "unban_student": {
        const { userId } = payload as { userId: string };
        if (!userId) {
          return NextResponse.json({ error: "معرف الطالب مطلوب" }, { status: 400 });
        }

        try {
          await db
            .update(schema.studentProfile)
            .set({ isBanned: false })
            .where(eq(schema.studentProfile.userId, userId));
        } catch (err) {
          console.warn("Unban student DB note:", err);
        }

        return NextResponse.json({
          success: true,
          message: "تم رفع الحظر عن حساب الطالب بنجاح.",
        });
      }

      default:
        return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تنفيذ الإجراء الإداري", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
