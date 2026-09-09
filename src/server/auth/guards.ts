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

    const rawRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const isAuthorizedRole = rawRole === "admin" || rawRole === "teacher" || (allowAssistant && rawRole === "assistant");

    if (!session?.user?.id || !isAuthorizedRole) {
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
