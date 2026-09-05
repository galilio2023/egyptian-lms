"use client";

import Link from "next/link";
import { Volume2, ChevronLeft, Lock } from "lucide-react";
import { 
  PhonicsSpeechSvg, 
  WorksheetPdfSvg, 
  XpGemSvg 
} from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { MockLesson } from "@/lib/db/mock-data";

interface UnitLessonsListProps {
  lessons: MockLesson[];
  speakingId: string | null;
  onSpeak: (text: string, id: string) => void;
}

export function UnitLessonsList({
  lessons,
  speakingId,
  onSpeak,
}: UnitLessonsListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
        <PhonicsSpeechSvg className="w-6 h-6" />
        <span>محاضرات ودروس الوحدة</span>
      </h2>

      {lessons.length === 0 ? (
        <EmptyState
          title="لا توجد دروس متاحة لهذه الوحدة حالياً"
          description="سيتم إضافة الشروحات والملازم قريباً من قِبل إدارة الأكاديمية."
        />
      ) : (
        <div className="space-y-3.5">
          {lessons.map((lesson, idx) => (
            <Card
              key={lesson.id}
              className={`backdrop-blur-md p-5 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                lesson.isPrerequisiteBlocked
                  ? "bg-slate-50/80 border-slate-200 opacity-90"
                  : "bg-white/95 border-purple-100 hover:border-purple-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-sm ${
                    lesson.isPrerequisiteBlocked
                      ? "bg-slate-200 text-slate-500"
                      : idx === 0
                      ? "bg-gradient-vibrant text-white shadow-purple-500/25"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {lesson.isPrerequisiteBlocked ? <Lock className="w-5 h-5" /> : idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base text-slate-900 hover:text-purple-700 transition-colors">
                      {lesson.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => onSpeak(lesson.title, lesson.id)}
                      className={`p-1 rounded-md border transition-colors cursor-pointer ${
                        speakingId === lesson.id
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      }`}
                      title="استمع للنطق"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {lesson.isPrerequisiteBlocked && (
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>{lesson.prerequisiteMessage || "أكمل متطلبات الدرس السابق أولاً"}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mt-1">
                    <span>مدة الفيديو: {lesson.videoDuration}</span>
                    {lesson.pdfAttachmentUrl && !lesson.isPrerequisiteBlocked && (
                      <span className="text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <WorksheetPdfSvg className="w-3.5 h-3.5" />
                        ملزمة ملونة مرفقة
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {lesson.pdfAttachmentUrl && !lesson.isPrerequisiteBlocked && (
                  <a
                    href={lesson.pdfAttachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <WorksheetPdfSvg className="w-4 h-4" />
                    <span className="hidden sm:inline">تحميل الملزمة</span>
                  </a>
                )}
                {lesson.isPrerequisiteBlocked ? (
                  <div
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-not-allowed select-none"
                    title={lesson.prerequisiteMessage || "هذا الدرس مغلق حتى إتمام السابق"}
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>مغلق مؤقتاً 🔒</span>
                  </div>
                ) : (
                  <Link
                    href={`/portal/lesson/${lesson.slug}`}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition-all"
                  >
                    <XpGemSvg className="w-4 h-4" />
                    <span>مشاهدة المحاضرة</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
