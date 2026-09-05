"use client";

import { Save, Sparkles, Volume2, ArrowLeft, FastForward } from "lucide-react";
import type { MockHomeworkSubmission } from "@/lib/db/mock-data";

interface GraderSidebarProps {
  submission: MockHomeworkSubmission;
  score: number;
  feedbackNotes: string;
  isSaving: boolean;
  totalPages: number;
  hasNextSubmission?: boolean;
  onChangeScore: (score: number) => void;
  onChangeNotes: (notes: string) => void;
  onSave: () => void;
  onSaveNext?: () => void;
}

const PRESET_FEEDBACK_PHRASES = [
  "خط ممتاز ومنظم جداً يا بطل! 🌟",
  "أحسنت مع التنبيه على المسافات بين الكلمات 👍",
  "بطل الأكاديمية الأول! استمر في التألق 🔥",
];

export function GraderSidebar({
  submission,
  score,
  feedbackNotes,
  isSaving,
  totalPages,
  hasNextSubmission = false,
  onChangeScore,
  onChangeNotes,
  onSave,
  onSaveNext,
}: GraderSidebarProps) {
  const handleQuickGrade = (points: number, notes: string) => {
    onChangeScore(points);
    onChangeNotes(notes);
  };

  return (
    <div className="lg:col-span-4 xl:col-span-3 p-5 bg-slate-850 flex flex-col justify-between space-y-6 overflow-y-auto">
      <div className="space-y-5">
        {/* Oral Voice Note Player (if student submitted speaking phonics) */}
        {submission.audioVoiceNoteUrl && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border-2 border-purple-500/40 text-xs space-y-2">
            <div className="flex items-center justify-between text-purple-300 font-black">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>تسجيل صوتي مرفق (قراءة شفهية)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-800/80 text-purple-200">
                صوت البطل 🎙️
              </span>
            </div>
            <audio
              controls
              src={submission.audioVoiceNoteUrl}
              className="w-full h-8 rounded-lg outline-none"
            />
          </div>
        )}

        {/* 1-Click Fast-Queue Presets */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[11px] font-black text-amber-400 block">
            ⚡ تصحيح فوري بنقرة واحدة (Fast Grade):
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickGrade(submission.maxScore, "خط ممتاز ومنظم جداً يا بطل! أحسنت 🌟")}
              className="py-2 px-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-black border border-emerald-700/60 transition-all text-center cursor-pointer"
            >
              10/10 مبدع 🌟
            </button>
            <button
              type="button"
              onClick={() => handleQuickGrade(Math.max(1, submission.maxScore - 1), "أحسنت مع التنبيه على المسافات بين الكلمات 👍")}
              className="py-2 px-1 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-[10px] font-black border border-indigo-700/60 transition-all text-center cursor-pointer"
            >
              9/10 رائع 👏
            </button>
            <button
              type="button"
              onClick={() => handleQuickGrade(Math.max(1, submission.maxScore - 3), "جيد جداً، نرجو التركيز على كتابة الحروف بين السطرين ✍️")}
              className="py-2 px-1 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 text-[10px] font-black border border-amber-700/60 transition-all text-center cursor-pointer"
            >
              7/10 جيد 💪
            </button>
          </div>
        </div>

        {/* Score Selector */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-300 flex items-center justify-between">
            <span>درجة الكراسة المكتسبة</span>
            <span className="text-purple-400">الدرجة العظمى: {submission.maxScore}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={submission.maxScore}
              value={score}
              onChange={(e) =>
                onChangeScore(
                  Math.min(
                    submission.maxScore,
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                )
              }
              className="w-24 px-4 py-2.5 rounded-2xl bg-slate-900 border-2 border-purple-500/50 text-white font-black text-2xl text-center focus:outline-none focus:border-purple-400"
            />
            <span className="text-slate-400 font-black text-lg">من {submission.maxScore}</span>

            {score === submission.maxScore && (
              <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-black flex items-center gap-1 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>درجة نهائية!</span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Note */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-300">
            ملاحظات وتوجيهات المعلم للطفل
          </label>
          <textarea
            rows={3}
            value={feedbackNotes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="اكتب تشجيعاً أو ملاحظة صوتية حول تنظيم الخط..."
            className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-purple-500 font-medium resize-none"
          />
        </div>

        {/* Quick Preset Feedback Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-bold block">
            عبارات تشجيع سريعة:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_FEEDBACK_PHRASES.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeNotes(phrase)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-colors text-right cursor-pointer"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Student Metadata Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>تاريخ الرفع:</span>
            <span className="font-bold text-slate-200">{submission.submittedAt}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>عدد الصفحات:</span>
            <span className="font-bold text-slate-200">{totalPages} صفحات</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>رقم الطالب:</span>
            <span className="font-mono font-bold text-indigo-400">
              {submission.studentPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        {hasNextSubmission && onSaveNext && (
          <button
            type="button"
            onClick={onSaveNext}
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <FastForward className="w-4 h-4" />
            <span>حفظ والانتقال للتالي (Fast Next)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4 text-purple-400" />
          <span>حفظ التعديلات وإنهاء</span>
        </button>
      </div>
    </div>
  );
}
