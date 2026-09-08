import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { AdminLayoutClient } from "@/components/layout/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  const cookieHeader = headerList.get("cookie") || "";
  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    (cookieHeader.includes("dev_bypass=true") || process.env.DEV_BYPASS_AUTH === "true");

  const userRole =
    ((session?.user as Record<string, unknown> | undefined)?.role as string | undefined) ||
    (isDevBypass ? "admin" : undefined);
  const isAuthorizedAdmin = userRole === "admin" || userRole === "teacher" || userRole === "assistant";

  if (!session && !isDevBypass) {
    redirect("/student-login?callbackUrl=/admin");
  }

  if (session && !isAuthorizedAdmin) {
    redirect("/student-login?callbackUrl=/admin");
  }

  const adminDisplayName = session?.user?.name || (isDevBypass ? "المشرف الأكاديمي (وضع التطوير)" : "المشرف الأكاديمي");
  const adminRoleTitle =
    userRole === "admin"
      ? "مدير النظام العام"
      : userRole === "teacher"
      ? "المعلم المشرف"
      : "مساعد تعليمي";

  return (
    <AdminLayoutClient
      userRole={userRole}
      adminDisplayName={adminDisplayName}
      adminRoleTitle={adminRoleTitle}
    >
      {children}
    </AdminLayoutClient>
  );
}
