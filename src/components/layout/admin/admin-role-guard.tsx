"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";

export interface AdminRoleGuardProps {
  isPending: boolean;
  isAuthorized: boolean;
  children: React.ReactNode;
}

export const AdminRoleGuard: React.FC<AdminRoleGuardProps> = ({
  isPending,
  isAuthorized,
  children,
}) => {
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#faf5ff] flex items-center justify-center">
        <div className="text-center space-y-3">
          <EliteLogoBadge className="w-16 h-16 mx-auto animate-bounce" />
          <p className="text-sm font-bold text-purple-900">جاري فتح لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border border-purple-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black">منطقة إدارة محمية</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              يتطلب الوصول إلى لوحة تحكم واستوديو الأكاديمية حساب مشرف معتمد (Admin أو Teacher أو Assistant).
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/student-login?callbackUrl=/admin"
              className="w-full py-3 rounded-2xl bg-gradient-vibrant text-white font-black text-xs shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition-all text-center block"
            >
              تسجيل الدخول بحساب المشرف
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-2xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors text-center block"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
