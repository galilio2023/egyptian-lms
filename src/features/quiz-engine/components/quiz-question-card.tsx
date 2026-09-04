"use client";

import { Volume2 } from "lucide-react";
import type { MockQuiz } from "@/lib/db/mock-data";

interface QuizQuestionCardProps {
  question: MockQuiz["questions"][number];
  selectedOptionId?: string;
  isSpeaking: boolean;
  onSelectOption: (optionId: string) => void;
  onSpeakText: (text: string) => void;
}

export function QuizQuestionCard({
  question,
  selectedOptionId,
  isSpeaking,
  onSelectOption,
  onSpeakText,
}: QuizQuestionCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
      {/* Question Header & Audio Pronunciation */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900 leading-relaxed text-right flex-1">
          <bdi dir="ltr">{question.text}</bdi>
        </h3>

        <button
          type="button"
          onClick={() => onSpeakText(question.text)}
          className={`p-2.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
            isSpeaking
              ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
              : "bg-white hover:bg-indigo-50 text-indigo-700 border-slate-200"
          }`}
          title="انقر للاستماع للنطق الإنجليزي السليم"
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden sm:inline">نطق السؤال</span>
        </button>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {question.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <div
              key={opt.id}
              className={`w-full p-4 rounded-xl text-right font-medium text-sm transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 border-2 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-800"
              }`}
              onClick={() => onSelectOption(opt.id)}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeakText(opt.text);
                  }}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title="استمع للنطق"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold">
                  <bdi dir="ltr">{opt.text}</bdi>
                </span>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? "border-white bg-white text-indigo-600" : "border-slate-300"
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
