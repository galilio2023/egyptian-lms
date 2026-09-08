"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, CheckCircle2, XCircle, Trophy, ArrowRight, HelpCircle } from "lucide-react";
import type { VideoCheckpoint } from "@/lib/db/mock-data";

interface VideoCheckpointModalProps {
  checkpoint: VideoCheckpoint;
  onAnswerCorrect: (rewardXp: number) => void;
  onContinue: () => void;
}

export function VideoCheckpointModal({
  checkpoint,
  onAnswerCorrect,
  onContinue,
}: VideoCheckpointModalProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId || hasSubmitted) return;

    const chosenOption = checkpoint.options.find((opt) => opt.id === selectedOptionId);
    const correct = Boolean(chosenOption?.isCorrect);

    setHasSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
      onAnswerCorrect(checkpoint.rewardXp || 10);
    }
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-amber-400 relative overflow-hidden text-right" dir="rtl">
        {/* Glow Header */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Badge & XP */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
            <span>تحدي الفهم السريع 🧠</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            <span>+{checkpoint.rewardXp || 10} XP</span>
          </div>
        </div>

        {/* Question Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 leading-snug">
          {checkpoint.questionText}
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          أجب عن التحدي لإكمال مشاهدة الدرس ومتابعة الشرح مع المعلم.
        </p>

        {/* Options List */}
        <div className="space-y-2.5 mb-6">
          {checkpoint.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-amber-50/50 hover:border-amber-300";

            if (hasSubmitted) {
              if (option.isCorrect) {
                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-200";
              } else if (isSelected && !option.isCorrect) {
                btnStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-200";
              } else {
                btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
              }
            } else if (isSelected) {
              btnStyle = "bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-200";
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option.id)}
                disabled={hasSubmitted}
                className={`w-full p-3.5 rounded-2xl border-2 text-right transition-all flex items-center justify-between gap-3 text-sm sm:text-base ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-500"
                  }`}>
                    {hasSubmitted && option.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : hasSubmitted && isSelected && !option.isCorrect ? (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      "•"
                    )}
                  </div>
                  <span>{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation & Feedback */}
        {hasSubmitted && (
          <div className={`p-4 rounded-2xl mb-5 text-xs sm:text-sm animate-in fade-in-50 duration-200 border ${
            isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
          }`}>
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <HelpCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold mb-1">
                  {isCorrect ? "إجابة عبقرية! 🎉" : "حاول مرة أخرى يا بطل! 💪"}
                </p>
                {checkpoint.explanation && (
                  <p className="opacity-90">{checkpoint.explanation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {!hasSubmitted ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={!selectedOptionId}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>تحقق من الإجابة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          ) : isCorrect ? (
            <button
              type="button"
              onClick={onContinue}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>متابعة الشرح والدرس 🚀</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>إعادة المحاولة 🔄</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
