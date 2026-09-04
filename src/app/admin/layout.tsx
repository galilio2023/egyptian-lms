"use client";

import React from "react";
import { useSession } from "@/lib/auth/auth-client";
import { AdminRoleGuard, AdminSidebar } from "@/components/layout/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();

  // Role guard: strict verification for admin/teacher/assistant
  const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;
  const isAuthorizedAdmin = userRole === "admin" || userRole === "teacher" || userRole === "assistant";

  const adminDisplayName = session?.user?.name || "مستر أحمد عبد الرحمن";
  const adminRoleTitle =
    userRole === "admin"
      ? "مدير النظام العام"
      : userRole === "teacher"
      ? "المعلم المشرف"
      : "مساعد تعليمي";

  return (
    <AdminRoleGuard isPending={isPending} isAuthorized={Boolean(session?.user && isAuthorizedAdmin)}>
      <div className="min-h-screen bg-[#faf5ff] text-slate-900 flex flex-col md:flex-row">
        <AdminSidebar displayName={adminDisplayName} roleTitle={adminRoleTitle} />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminRoleGuard>
  );
}
