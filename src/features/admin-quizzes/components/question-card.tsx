"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import type { MockQuestion } from "../types";

export interface QuestionCardProps {
  question: MockQuestion;
  index: number;
  onDelete: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onDelete,
}) => {
  return (
    <div className="modern-card p-5 bg-white/95 border-2 border-purple-100 shadow-sm hover:border-purple-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center">
            {index + 1}
          </span>
          <h4 className="font-extrabold text-sm text-slate-900" dir="ltr">
            {question.text}
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" dir="ltr">
          {question.options.map((opt) => (
            <div
              key={opt.id}
              className={`p-2 rounded-xl border font-bold text-center ${
                opt.isCorrect
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-200"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              {opt.text} {opt.isCorrect && "✓"}
            </div>
          ))}
        </div>

        {question.explanation && (
          <p className="text-[11px] text-purple-700 font-medium">
            💡 الشرح والتوضيح: {question.explanation}
          </p>
        )}
      </div>

      <button
        onClick={() => onDelete(question.id)}
        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
        title="حذف السؤال"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
