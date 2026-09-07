"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/auth-client";
import { EliteLogoBadge, StreakFlameSvg } from "@/components/ui/illustrated-icons";
import { StudentDashboardProfile, MascotItem } from "../types";

export interface StudentNavHeaderProps {
  student: StudentDashboardProfile;
  activeMascot: MascotItem;
}

export const StudentNavHeader: React.FC<StudentNavHeaderProps> = ({
  student,
  activeMascot,
}) => {
  const router = useRouter();
  const ActiveMascotSvg = activeMascot.SvgComponent;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-purple-100/90 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <EliteLogoBadge className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-105 transition-transform shrink-0 drop-shadow-xs" />
          <div>
            <span className="font-black text-xs sm:text-base text-slate-900 block leading-tight">
              المنصة <span className="text-gradient-purple">التعليمية</span>
            </span>
            <span className="text-[9px] sm:text-[11px] text-purple-700 font-bold block">
              بوابة الطالب الذكية
            </span>
          </div>
        </Link>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Streak Counter (visible on tablet and desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-900 text-xs font-black shadow-xs">
            <StreakFlameSvg className="w-4 h-4 text-orange-500" />
            <span>{student.streakDays} أيام حماس</span>
          </div>

          {/* XP Pill */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black shadow-xs">
            <span className="text-sm leading-none">💎</span>
            <span>{student.xpPoints} <span className="text-[10px] sm:text-xs text-amber-700 font-bold">XP</span></span>
          </div>

          {/* Student Profile Pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/80 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-xs">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-xs flex items-center justify-center p-0.5 shrink-0 border border-purple-100">
              <ActiveMascotSvg className="w-full h-full object-contain" />
            </div>
            <div className="text-right hidden xs:block">
              <span className="text-xs sm:text-sm font-black text-slate-900 block leading-tight max-w-[90px] xs:max-w-[120px] sm:max-w-none">
                {student.name}
              </span>
              <span className="text-[9px] sm:text-[10px] text-purple-700 font-bold block max-w-[90px] xs:max-w-[120px] sm:max-w-none">
                {student.gradeTitle}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => { router.push("/"); } } })}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors bg-white border border-rose-100 shadow-xs cursor-pointer shrink-0"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
