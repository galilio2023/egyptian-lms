import React from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";

export interface WeeklyMissionsCardProps {
  studentName: string;
}

export const WeeklyMissionsCard: React.FC<WeeklyMissionsCardProps> = ({ studentName }) => {
  return (
    <div className="modern-card p-4 sm:p-6 bg-gradient-to-r from-purple-50/90 via-white to-pink-50/90 border-2 border-purple-200 rounded-3xl shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <h3 className="font-black text-sm text-slate-900">
            مهام الأسبوع للبطل {studentName} (Weekly Checklist)
          </h3>
        </div>
        <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 shrink-0 self-start sm:self-auto">
          أنجزت 2 من 3 مهام
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Task 1 */}
        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-black text-slate-900 block">1. مشاهدة الحصة الأولى</span>
            <span className="text-[10px] text-emerald-600 font-bold block">تمت المشاهدة بنجاح ✓</span>
          </div>
        </div>

        {/* Task 2 */}
        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-black text-slate-900 block">2. تحميل ملزمة الشرح</span>
            <span className="text-[10px] text-emerald-600 font-bold block">تم حفظ الملزمة PDF ✓</span>
          </div>
        </div>

        {/* Task 3 */}
        <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-400 shadow-sm flex items-start gap-3 animate-pulse-soft">
          <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
            3
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black text-purple-950 block">3. امتحان حديقة الحيوان</span>
            <Link
              href="/portal/quiz/grade-1-unit-1-quiz"
              className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full shadow-xs hover:scale-105 transition-transform"
            >
              <span>ابدأ الاختبار (+50 XP)</span>
              <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
