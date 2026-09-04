import React from "react";
import Link from "next/link";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";
import { StudentDashboardProfile, MascotItem } from "../types";

export interface StudentNavHeaderProps {
  student: StudentDashboardProfile;
  activeMascot: MascotItem;
}

export const StudentNavHeader: React.FC<StudentNavHeaderProps> = ({
  student,
  activeMascot,
}) => {
  const ActiveMascotSvg = activeMascot.SvgComponent;

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
      <div className="max-w-6xl mx-auto rounded-full bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-[0_8px_30px_rgba(139,92,246,0.1)] px-5 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <EliteLogoBadge className="w-9 h-9 group-hover:scale-105 transition-transform" />
          <div>
            <span className="font-black text-sm text-slate-900 block leading-none">
              أكاديمية <span className="text-gradient-purple">إيليت</span>
            </span>
            <span className="text-[10px] text-purple-700 font-bold">بوابة الطالب الذكية</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 px-3 py-1 rounded-full shadow-sm">
            <ActiveMascotSvg className="w-7 h-7" />
            <div className="text-right">
              <span className="text-xs font-black text-slate-900 block leading-none">
                {student.name}
              </span>
              <span className="text-[9px] text-purple-700 font-bold">
                {student.gradeTitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
