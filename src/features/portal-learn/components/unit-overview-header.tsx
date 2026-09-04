"use client";

import Link from "next/link";
import { Volume2 } from "lucide-react";
import { CurriculumBookSvg, ChampionCupSvg } from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";
import type { MockUnit } from "@/lib/db/mock-data";

interface UnitOverviewHeaderProps {
  unit: MockUnit;
  quizId: string;
  speakingId: string | null;
  onSpeak: (text: string, id: string) => void;
}

export function UnitOverviewHeader({
  unit,
  quizId,
  speakingId,
  onSpeak,
}: UnitOverviewHeaderProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-md p-6 sm:p-8 space-y-4 border-2 border-purple-100 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <CurriculumBookSvg className="w-14 h-14 shrink-0 drop-shadow-sm" />
          <div className="space-y-1">
            <span className="text-xs font-black text-purple-800 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-1.5 shadow-sm">
              محتوى الوحدة الدراسية
            </span>
            <div className="flex items-center gap-2.5 pt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {unit.title}
              </h1>
              <button
                type="button"
                onClick={() => onSpeak(unit.title, "unit-title")}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  speakingId === "unit-title"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                }`}
                title="استمع لنطق عنوان الوحدة"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
              {unit.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/portal/quiz/${quizId}`}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.03] text-white font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
          >
            <ChampionCupSvg className="w-5 h-5 drop-shadow" />
            <span>دخول الاختبار التفاعلي</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
