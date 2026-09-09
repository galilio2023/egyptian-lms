import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export type AllowedAdminRole = "admin" | "teacher" | "assistant";

export interface AuthenticatedAdminContext {
  userId: string;
  userName: string;
  userRole: AllowedAdminRole;
  isAssistant: boolean;
  session: Record<string, unknown>;
}

export type AuthCheckResult =
  | { authorized: true; context: AuthenticatedAdminContext }
  | { authorized: false; response: NextResponse };

/**
 * Server-side authorization guard for administrative API routes.
 * Enforces session validity and restricts access to admin, teacher, and assistant roles.
 */
export async function requireAdminAuth(options?: {
  allowAssistant?: boolean;
}): Promise<AuthCheckResult> {
  const allowAssistant = options?.allowAssistant ?? true;

  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    const cookieHeader = headerList.get("cookie") || "";
    const isDevBypass =
      process.env.NODE_ENV === "development" &&
      (cookieHeader.includes("dev_bypass=true") || process.env.DEV_BYPASS_AUTH === "true");

    const rawRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const isAuthorizedRole = rawRole === "admin" || rawRole === "teacher" || (allowAssistant && rawRole === "assistant");

    if (!session?.user?.id || !isAuthorizedRole) {
      if (isDevBypass) {
        return {
          authorized: true,
          context: {
            userId: "admin-primary",
            userName: "المشرف الأكاديمي (وضع التطوير)",
            userRole: "admin",
            isAssistant: false,
            session: { id: "session-dev-admin", role: "admin" },
          },
        };
      }

      return {
        authorized: false,
        response: NextResponse.json(
          { error: "غير مصرح لك بالوصول. يتطلب صلاحيات المشرف أو المعلم." },
          { status: 403 }
        ),
      };
    }

    const role = rawRole as AllowedAdminRole;

    return {
      authorized: true,
      context: {
        userId: session.user.id,
        userName: session.user.name || "مشرف النظام",
        userRole: role,
        isAssistant: role === "assistant",
        session: session as unknown as Record<string, unknown>,
      },
    };
  } catch (error) {
    console.error("Authentication assertion failed:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "فشل التحقق من جلسة المستخدم." },
        { status: 401 }
      ),
    };
  }
}

export interface AuthenticatedStudentContext {
  userId: string;
  userName: string;
  userRole: string;
  phoneNumber?: string;
  userEmail: string;
  sessionId?: string;
  sessionDeviceId?: string;
  session: Record<string, unknown>;
}

export type StudentAuthCheckResult =
  | { authorized: true; context: AuthenticatedStudentContext }
  | { authorized: false; response: NextResponse };

/**
 * Server-side authorization guard for student-facing API routes.
 * Ensures the student session is valid and active.
 */
export async function requireStudentAuth(customUnauthorizedMessage?: string): Promise<StudentAuthCheckResult> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    const cookieHeader = headerList.get("cookie") || "";
    const isDevBypass =
      process.env.NODE_ENV === "development" &&
      (cookieHeader.includes("dev_bypass=true") || process.env.DEV_BYPASS_AUTH === "true");

    if (!session?.user?.id) {
      if (isDevBypass) {
        return {
          authorized: true,
          context: {
            userId: "student-dev-primary",
            userName: "طالب تجريبي (وضع التطوير)",
            userRole: "student",
            phoneNumber: "01012345678",
            userEmail: "student.dev@elite-academy.edu.eg",
            sessionId: "session-dev-student",
            sessionDeviceId: "dev-device-student",
            session: { id: "session-dev-student", role: "student" },
          },
        };
      }

      return {
        authorized: false,
        response: NextResponse.json(
          { error: customUnauthorizedMessage || "يجب تسجيل الدخول بحساب الطالب للوصول إلى هذه الخدمة." },
          { status: 401 }
        ),
      };
    }

    const sessionDeviceId = (session.session as { deviceId?: string } | undefined)?.deviceId;
    const phoneNumber = (session.user as Record<string, unknown> | undefined)?.phoneNumber as string | undefined;

    return {
      authorized: true,
      context: {
        userId: session.user.id,
        userName: session.user.name || "طالب الأكاديمية",
        userRole: (session.user as Record<string, unknown> | undefined)?.role as string || "student",
        phoneNumber,
        userEmail: session.user.email,
        sessionId: session.session?.id,
        sessionDeviceId,
        session: session as unknown as Record<string, unknown>,
      },
    };
  } catch (error) {
    console.error("Student authentication assertion failed:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "فشل التحقق من جلسة المستخدم." },
        { status: 401 }
      ),
    };
  }
}

/**
 * Optional session extractor for public or hybrid endpoints (e.g. public units or quizzes).
 */
export async function getOptionalSessionContext(): Promise<{
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  phoneNumber?: string;
  sessionDeviceId?: string;
}> {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    const cookieHeader = headerList.get("cookie") || "";
    const isDevBypass =
      process.env.NODE_ENV === "development" &&
      (cookieHeader.includes("dev_bypass=true") || process.env.DEV_BYPASS_AUTH === "true");

    if (!session?.user?.id) {
      if (isDevBypass) {
        const isStudent = cookieHeader.includes("dev_role=student") || !cookieHeader.includes("dev_role=admin");
        return {
          userId: isStudent ? "student-dev-primary" : "admin-primary",
          userName: isStudent ? "طالب تجريبي (وضع التطوير)" : "المشرف الأكاديمي (وضع التطوير)",
          userRole: isStudent ? "student" : "admin",
          phoneNumber: isStudent ? "01012345678" : "01000000000",
          sessionDeviceId: isStudent ? "dev-device-student" : "dev-device-admin",
        };
      }
      return { userId: null, userName: null, userRole: null };
    }

    return {
      userId: session.user.id,
      userName: session.user.name || null,
      userRole: (session.user as Record<string, unknown> | undefined)?.role as string || "student",
      phoneNumber: (session.user as Record<string, unknown> | undefined)?.phoneNumber as string | undefined,
      sessionDeviceId: (session.session as { deviceId?: string } | undefined)?.deviceId,
    };
  } catch {
    return { userId: null, userName: null, userRole: null };
  }
}

