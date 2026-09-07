"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";
import { AdminSidebar } from "./admin-sidebar";

export interface AdminLayoutClientProps {
  children: React.ReactNode;
  adminDisplayName: string;
  adminRoleTitle: string;
  userRole?: string;
}

export function AdminLayoutClient({
  children,
  adminDisplayName,
  adminRoleTitle,
  userRole,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isRestrictedForAssistant =
    userRole === "assistant" &&
    (pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/security"));

  return (
    <div className="min-h-screen bg-[#faf5ff] text-slate-900 flex flex-col md:flex-row">
      {/* 1. Mobile Sticky Top Header (Hidden on Desktop) */}
      <header className="sticky top-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-b border-purple-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 transition-colors cursor-pointer"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <EliteLogoBadge className="w-8 h-8" />
            <span className="font-black text-xs text-slate-900 leading-none">
              لوحة تحكم <span className="text-gradient-purple">المنصة</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
            {adminRoleTitle}
          </span>
        </div>
      </header>

      {/* 2. Mobile Off-Canvas Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in-50">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-start duration-200">
            <AdminSidebar
              displayName={adminDisplayName}
              roleTitle={adminRoleTitle}
              onClose={() => setMobileDrawerOpen(false)}
              className="h-full border-0 rounded-none shadow-none"
            />
          </div>
        </div>
      )}

      {/* 3. Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0">
        <AdminSidebar displayName={adminDisplayName} roleTitle={adminRoleTitle} />
      </div>

      {/* 4. Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
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
  );
}
