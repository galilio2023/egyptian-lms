import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/guards";
import { getRecentSecurityLogs, type SecurityAuditRecord } from "@/lib/security/audit-logger";
import { handleRouteError } from "@/server/errors";
import {
  getAdminOrders,
  approveOrder,
  rejectOrder,
  type ApproveOrderPayload,
  type RejectOrderPayload,
} from "@/server/services/admin-orders.service";
import {
  getAdminStudents,
  manualEnrollStudent,
  resetDevice,
  toggleBan,
  banStudent,
  unbanStudent,
  type ManualEnrollPayload,
  type ResetDevicePayload,
  type ToggleBanPayload,
  type BanStudentPayload,
} from "@/server/services/admin-students.service";
import {
  getCurriculumData,
  getLessonsData,
  getQuizzesData,
  createUnit,
  deleteUnit,
  createLesson,
  deleteLesson,
  createQuestion,
  deleteQuestion,
  type CreateUnitPayload,
  type CreateLessonPayload,
  type CreateQuestionPayload,
} from "@/server/services/admin-curriculum.service";
import {
  getLiveSessionsData,
  createLiveSession,
  toggleLiveSession,
  deleteLiveSession,
  type CreateLiveSessionPayload,
} from "@/server/services/admin-live-sessions.service";
import {
  saveVouchers,
  generateSecureVouchers,
  type SaveVouchersPayload,
  type GenerateSecureVouchersPayload,
} from "@/server/services/admin-vouchers.service";
import {
  getAdminSettingsData,
  updatePlatformSettings,
  resetPlatformSettings,
  type UpdateSettingsPayload,
} from "@/server/services/admin-settings.service";
import {
  sendBroadcast,
  type SendBroadcastPayload,
} from "@/server/services/admin-broadcasts.service";
import {
  getAdminHomeworkData,
  gradeHomework,
  type GradeHomeworkPayload,
} from "@/server/services/admin-homework.service";
import { getAdminOverviewData } from "@/server/services/admin-overview.service";

const ASSISTANT_RESTRICTED_QUERY_TYPES = ["settings", "security_logs", "all", "overview"];

const ADMIN_TEACHER_ONLY_ACTIONS = [
  "approve_order",
  "reject_order",
  "manual_enroll_student",
  "toggle_ban",
  "ban_student",
  "unban_student",
  "delete_unit",
  "create_unit",
  "delete_lesson",
  "delete_question",
  "update_settings",
  "reset_settings",
  "generate_secure_vouchers",
  "save_vouchers",
  "delete_live_session",
  "send_broadcast",
];

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  // RBAC: Assistants cannot view financial overview KPIs, platform settings, security logs, or aggregate all data
  if (context.isAssistant && ASSISTANT_RESTRICTED_QUERY_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "عذراً، لا يمكن لحساب المساعد الوصول إلى هذا القسم أو طلب البيانات المجمعة." },
      { status: 403 }
    );
  }

  try {
    const [
      orders,
      students,
      curriculum,
      lessons,
      quizzes,
      liveSessions,
      homework,
      overview,
      settings,
      securityLogs,
    ] = await Promise.all([
      type === "all" || type === "orders" ? getAdminOrders() : Promise.resolve([]),
      type === "all" || type === "students" ? getAdminStudents() : Promise.resolve([]),
      type === "all" || type === "curriculum" ? getCurriculumData() : Promise.resolve([]),
      type === "all" || type === "curriculum" ? getLessonsData() : Promise.resolve([]),
      type === "all" || type === "quizzes" ? getQuizzesData() : Promise.resolve([]),
      type === "all" || type === "live_sessions" ? getLiveSessionsData() : Promise.resolve([]),
      type === "all" || type === "homework" ? getAdminHomeworkData() : Promise.resolve([]),
      type === "all" || type === "overview" ? getAdminOverviewData(context.isAssistant) : Promise.resolve(null),
      type === "all" || type === "settings" ? getAdminSettingsData() : Promise.resolve(null),
      type === "all" || type === "security_logs" ? getRecentSecurityLogs(100) : Promise.resolve([] as SecurityAuditRecord[]),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      students,
      curriculum,
      lessons,
      quizzes,
      liveSessions,
      homework,
      overview,
      settings,
      securityLogs,
    });
  } catch (error: unknown) {
    console.error("Admin fetch error:", error);
    const { error: message, status } = handleRouteError(error, "حدث خطأ أثناء جلب البيانات");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await request.json();
    const { action, payload = {} } = body as {
      action?: string;
      payload?: unknown;
    };

    if (!action) {
      return NextResponse.json({ error: "الإجراء غير محدد" }, { status: 400 });
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "بيانات الإجراء غير صالحة." }, { status: 400 });
    }

    // RBAC: Assistants are restricted from destructive / financial actions
    if (context.isAssistant && ADMIN_TEACHER_ONLY_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: "عذراً، هذا الإجراء يتطلب صلاحيات المعلم أو مدير النظام. حساب المساعد لا يملك صلاحية تنفيذ هذا الأمر." },
        { status: 403 }
      );
    }

    switch (action) {
      case "approve_order": {
        const result = await approveOrder(payload as ApproveOrderPayload);
        return NextResponse.json(result);
      }

      case "reject_order": {
        const result = await rejectOrder(payload as RejectOrderPayload);
        return NextResponse.json(result);
      }

      case "manual_enroll_student": {
        const result = await manualEnrollStudent(payload as ManualEnrollPayload);
        return NextResponse.json(result);
      }

      case "reset_device": {
        const result = await resetDevice(payload as ResetDevicePayload, {
          userId: context.userId,
          userName: context.userName,
          userRole: context.userRole,
        });
        return NextResponse.json(result);
      }

      case "toggle_ban": {
        const result = await toggleBan(payload as ToggleBanPayload);
        return NextResponse.json(result);
      }

      case "ban_student": {
        const result = await banStudent(payload as BanStudentPayload);
        return NextResponse.json(result);
      }

      case "unban_student": {
        const result = await unbanStudent((payload as { userId: string }).userId);
        return NextResponse.json(result);
      }

      case "grade_homework": {
        const result = await gradeHomework(payload as GradeHomeworkPayload, context.userId);
        return NextResponse.json(result);
      }

      case "create_unit": {
        const result = await createUnit(payload as CreateUnitPayload);
        return NextResponse.json(result);
      }

      case "delete_unit": {
        const result = await deleteUnit((payload as { unitId: string }).unitId);
        return NextResponse.json(result);
      }

      case "create_lesson": {
        const result = await createLesson(payload as CreateLessonPayload);
        return NextResponse.json(result);
      }

      case "delete_lesson": {
        const result = await deleteLesson((payload as { lessonId: string }).lessonId);
        return NextResponse.json(result);
      }

      case "create_question": {
        const result = await createQuestion(payload as CreateQuestionPayload);
        return NextResponse.json(result);
      }

      case "delete_question": {
        const result = await deleteQuestion((payload as { questionId: string }).questionId);
        return NextResponse.json(result);
      }

      case "create_live_session": {
        const result = await createLiveSession(payload as CreateLiveSessionPayload);
        return NextResponse.json(result);
      }

      case "toggle_live_session": {
        const { sessionId, isLiveNow } = payload as { sessionId: string; isLiveNow: boolean };
        const result = await toggleLiveSession(sessionId, isLiveNow);
        return NextResponse.json(result);
      }

      case "delete_live_session": {
        const result = await deleteLiveSession((payload as { sessionId: string }).sessionId);
        return NextResponse.json(result);
      }

      case "send_broadcast": {
        const result = await sendBroadcast(payload as SendBroadcastPayload);
        return NextResponse.json(result);
      }

      case "save_vouchers": {
        const result = await saveVouchers(payload as SaveVouchersPayload);
        return NextResponse.json(result);
      }

      case "generate_secure_vouchers": {
        const result = await generateSecureVouchers(payload as GenerateSecureVouchersPayload);
        return NextResponse.json(result);
      }

      case "update_settings": {
        const result = await updatePlatformSettings(payload as UpdateSettingsPayload);
        return NextResponse.json(result);
      }

      case "reset_settings": {
        const result = await resetPlatformSettings();
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("Admin action error:", error);
    const { error: message, status } = handleRouteError(error, "حدث خطأ أثناء تنفيذ الإجراء الإداري");
    return NextResponse.json({ error: message }, { status });
  }
}
