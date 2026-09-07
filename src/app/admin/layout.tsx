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

  const userRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
  const isAuthorizedAdmin = userRole === "admin" || userRole === "teacher" || userRole === "assistant";

  if (!session || !isAuthorizedAdmin) {
    redirect("/student-login?callbackUrl=/admin");
  }

  const adminDisplayName = session.user.name || "المشرف الأكاديمي";
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
