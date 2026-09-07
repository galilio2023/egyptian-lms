import React from "react";
import Link from "next/link";
import { PlayCircle, ChevronLeft } from "lucide-react";

export interface NextLessonBannerProps {
  instructorName?: string;
  lessonTitle?: string;
  unitTitle?: string;
  lessonSlug?: string;
  durationMinutes?: number;
  isCompleted?: boolean;
}

export const NextLessonBanner: React.FC<NextLessonBannerProps> = ({ 
  instructorName = "المعلم المشرف",
  lessonTitle = "الدرس 1 و 2: الحروف والنطق الصوتي (Phonics & Letters)",
  unitTitle = "Unit 1: Hello & My Class",
  lessonSlug = "phonics-and-letters",
  durationMinutes = 24,
  isCompleted = false,
}) => {
  return (
    <div className="modern-card p-4 sm:p-6 bg-white/95 backdrop-blur-md border-2 border-purple-200/80 hover:border-purple-300 rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 shadow-md transition-all">
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 text-right">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25">
          <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-2">
            {!isCompleted && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-purple-700 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                المحاضرة التالية للمشاهدة
              </span>
            )}
            {isCompleted && (
              <span className="text-[11px] font-black text-purple-700 uppercase tracking-wider">
                خطة التعلم الحالية مكتملة
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
              {isCompleted ? "✅ مكتمل" : `⏱️ ${durationMinutes} دقيقة`}
            </span>
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 leading-snug">
            {isCompleted ? "لا توجد دروس متبقية في وحداتك الحالية" : lessonTitle}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {isCompleted ? "اختر وحدة جديدة أو راجع دروسك المكتملة" : `${unitTitle} • ${instructorName}`}
          </p>
        </div>
      </div>

      <Link
        href={isCompleted ? "/portal/dashboard#courses" : `/portal/lesson/${lessonSlug}`}
        className="w-full sm:w-auto px-6 sm:px-7 py-3 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
      >
        <span>{isCompleted ? "عرض وحداتك" : "متابعة الدرس الآن"}</span>
        <ChevronLeft className="w-4 h-4" />
      </Link>
    </div>
  );
};
