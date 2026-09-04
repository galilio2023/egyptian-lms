"use client";

import React from "react";
import { Clock } from "lucide-react";
import { ChampionCupSvg } from "@/components/ui/illustrated-icons";
import { INITIAL_QUIZ } from "@/lib/db/mock-data";

export interface QuizOverviewCardsProps {
  questionsCount: number;
}

export const QuizOverviewCards: React.FC<QuizOverviewCardsProps> = ({ questionsCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="modern-card p-6 bg-gradient-vibrant text-white border-0 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full border border-white/30">
            امتحان نشط
          </span>
          <Clock className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <h3 className="font-black text-lg">{INITIAL_QUIZ.title}</h3>
          <p className="text-xs text-purple-100 mt-1">اختبار تقييم شامل مطابق لأحدث مواصفات المنهج</p>
        </div>
        <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-white/20">
          <span>المدة: {INITIAL_QUIZ.timeLimitMinutes} دقائق</span>
          <span>درجة النجاح: {INITIAL_QUIZ.passPercentage}%</span>
        </div>
      </div>

      <div className="modern-card p-6 bg-white/95 border border-purple-100 shadow-sm flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400">إجمالي الأسئلة في بنك المنهج</span>
          <div className="text-3xl font-black text-slate-900">{questionsCount} سؤال</div>
        </div>
        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 mt-3 inline-block w-fit">
          ✓ بنك متوافق مع نظام كويزات الأبطال
        </div>
      </div>

      <div className="modern-card p-6 bg-white/95 border border-purple-100 shadow-sm flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400">معدل الإجابات الصحيحة</span>
          <div className="text-3xl font-black text-purple-700">88.5%</div>
        </div>
        <div className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 mt-3 flex items-center gap-1.5 w-fit">
          <ChampionCupSvg className="w-4 h-4" />
          <span>+420 طالب اجتازوا الامتحان بنجاح</span>
        </div>
      </div>
    </div>
  );
};
