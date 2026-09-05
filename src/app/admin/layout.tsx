"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { AdminRoleGuard, AdminSidebar } from "@/components/layout/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  // Role guard: strict verification for admin/teacher/assistant
  const userRole = session?.user?.role;
  const isAuthorizedAdmin = userRole === "admin" || userRole === "teacher" || userRole === "assistant";
  const isRestrictedForAssistant =
    userRole === "assistant" &&
    (pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/security"));

  const adminDisplayName = session?.user?.name || "المشرف الأكاديمي";
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
          {isRestrictedForAssistant ? (
            <div className="h-full flex items-center justify-center py-16">
              <div className="bg-white p-8 rounded-3xl border border-red-200 text-center max-w-md shadow-lg shadow-red-500/5">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 font-black text-2xl">
                  🚫
                </div>
                <h2 className="text-lg font-black text-slate-900 mb-2">غير مصرح بالوصول</h2>
                <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                  عذراً، يتطلب هذا القسم صلاحيات المعلم المشرف أو مدير النظام العام. لا يمتلك حساب المساعد صلاحية استعراض الإعدادات أو سجل الأمان.
                </p>
                <a
                  href="/admin/curriculum"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition"
                >
                  العودة إلى إدارة المنهج
                </a>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </AdminRoleGuard>
  );
}
