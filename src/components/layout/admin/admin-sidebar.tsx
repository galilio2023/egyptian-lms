"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, LogOut, X } from "lucide-react";
import { signOut } from "@/lib/auth/auth-client";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";
import { AdminUserBadge } from "./admin-user-badge";
import { AdminNavLinks } from "./admin-nav-links";

export interface AdminSidebarProps {
  displayName: string;
  roleTitle: string;
  onClose?: () => void;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  displayName,
  roleTitle,
  onClose,
  className = "",
}) => {
  return (
    <aside className={`w-full md:w-72 bg-white/95 backdrop-blur-md border-b md:border-b-0 md:border-l border-purple-100 p-5 flex flex-col justify-between shrink-0 shadow-sm overflow-y-auto ${className}`}>
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-100">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <EliteLogoBadge className="w-10 h-10" />
            <div>
              <span className="font-black text-sm text-slate-900 block">
                لوحة تحكم <span className="text-gradient-purple">المنصة</span>
              </span>
              <span className="text-[10px] text-purple-700 font-bold">Admin CMS Studio</span>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-50 transition-colors cursor-pointer"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Profile Badge */}
        <AdminUserBadge displayName={displayName} roleTitle={roleTitle} />

        {/* Nav Links */}
        <AdminNavLinks onItemClick={onClose} />
      </div>

      {/* Footer Actions */}
      <div className="pt-5 border-t border-purple-100 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors border border-purple-200"
        >
          <span>عرض المنصة التعليمية</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج من الإدارة</span>
        </button>
      </div>
    </aside>
  );
};
