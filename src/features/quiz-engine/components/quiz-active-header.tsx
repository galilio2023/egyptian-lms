"use client";

import { Timer, Sparkles, ShieldAlert } from "lucide-react";
import { ExamQuizSheetSvg } from "@/components/ui/illustrated-icons";
import type { MockQuiz } from "@/lib/db/mock-data";

interface QuizActiveHeaderProps {
  quiz: MockQuiz;
  timeLeft: number;
  tabSwitchWarnings: number;
  currentIndex: number;
  selectedAnswers: Record<string, string>;
  onSelectIndex: (index: number) => void;
}

export function QuizActiveHeader({
  quiz,
  timeLeft,
  tabSwitchWarnings,
  currentIndex,
  selectedAnswers,
  onSelectIndex,
}: QuizActiveHeaderProps) {
  const totalQuestions = quiz.questions.length;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <ExamQuizSheetSvg className="w-11 h-11 shrink-0" />
          <div>
            <span className="text-xs font-black text-purple-800 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              الاختبار التفاعلي الذكي
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">{quiz.title}</h2>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950 font-mono font-black text-sm shadow-sm">
          <Timer className="w-4 h-4 text-amber-600" />
          <span>
            {minutes}:{seconds}
          </span>
        </div>
      </div>

      {/* Tab Switch Warning Badge */}
      {tabSwitchWarnings > 0 && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2 font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>
            تحذير أمني: تم رصد مغادرة شاشة الاختبار ({tabSwitchWarnings}/3 مرات). تكرار ذلك سيؤدي إلى تسليم الاختبار تلقائياً.
          </span>
        </div>
      )}

      {/* Question Progress Dots */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>السؤال {currentIndex + 1} من {totalQuestions}</span>
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar py-1">
          {quiz.questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center cursor-pointer group shrink-0"
                title={`السؤال ${idx + 1}`}
              >
                <span
                  className={`w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full transition-all block ${
                    isCurrent
                      ? "bg-indigo-600 ring-4 ring-indigo-100 scale-110"
                      : isAnswered
                      ? "bg-emerald-500 group-hover:scale-110"
                      : "bg-slate-200 group-hover:bg-slate-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
