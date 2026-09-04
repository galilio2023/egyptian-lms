"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface QuizNavFooterProps {
  currentIndex: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function QuizNavFooter({
  currentIndex,
  totalQuestions,
  isSubmitting,
  onPrev,
  onNext,
  onSubmit,
}: QuizNavFooterProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst || isSubmitting}
        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
      >
        <ArrowRight className="w-4 h-4" />
        السابق
      </button>

      {!isLast ? (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          التالي
          <ArrowLeft className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <span>جاري التصحيح واعتماد النتيجة...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>تسليم وإنهاء الاختبار</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
