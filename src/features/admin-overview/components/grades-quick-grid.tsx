"use client";

import { ChampionCupSvg } from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";
import { INITIAL_GRADES } from "@/lib/db/mock-data";

export function GradesQuickGrid() {
  return (
    <Card className="p-6 bg-white/95 backdrop-blur-md border-2 border-purple-100 space-y-4 shadow-sm">
      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
        <ChampionCupSvg className="w-5 h-5" />
        <span>المراحل الدراسية والصفوف المعتمدة</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {INITIAL_GRADES.map((g) => (
          <div
            key={g.id}
            className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-center space-y-1"
          >
            <span className="font-black text-xs text-purple-900 block">{g.titleEnglish}</span>
            <span className="text-[11px] text-purple-600 font-bold block">{g.titleArabic}</span>
            <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
              متاح ونشط
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
