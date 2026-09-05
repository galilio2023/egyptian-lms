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
}) => {
  return (
    <div className="modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25">
          <PlayCircle className="w-7 h-7" />
        </div>
        <div className="space-y-0.5 text-right">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-purple-700 uppercase tracking-wider">
              المحاضرة التالية للمشاهدة
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
              ⏱️ {durationMinutes} دقيقة
            </span>
          </div>
          <h3 className="font-black text-base text-slate-900">
            {lessonTitle}
          </h3>
          <p className="text-xs text-slate-500 font-medium">{unitTitle} • {instructorName}</p>
        </div>
      </div>

      <Link
        href={`/portal/lesson/${lessonSlug}`}
        className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-vibrant hover:scale-[1.03] text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
      >
        <span>متابعة الدرس الآن</span>
        <ChevronLeft className="w-4 h-4" />
      </Link>
    </div>
  );
};
