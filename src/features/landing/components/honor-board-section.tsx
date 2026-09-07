import React, { useState } from "react";
import { Trophy, Crown } from "lucide-react";
import { 
  INITIAL_GRADES, 
  INITIAL_GRADE_CHAMPIONS 
} from "@/lib/db/mock-data";
import { ChampionCupSvg, XpGemSvg } from "@/components/ui/illustrated-icons";

export const HonorBoardSection: React.FC = () => {
  const [activeHonorGrade, setActiveHonorGrade] = useState<string>("grade-3");

  const currentChampions = INITIAL_GRADE_CHAMPIONS[activeHonorGrade] || INITIAL_GRADE_CHAMPIONS["grade-3"];
  const champ1 = currentChampions.find((c) => c.rank === 1);
  const champ2 = currentChampions.find((c) => c.rank === 2);
  const champ3 = currentChampions.find((c) => c.rank === 3);

  return (
    <section id="honor_board" className="py-20 bg-gradient-to-b from-white/80 via-purple-50/40 to-white/90 border-t border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-amber-800 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200 inline-flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>لوحة الشرف — أبطال إيليت المتميزين</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            أوائل الطلاب وأعلى نقاط تفوق (XP)
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
            نحتفي بأبطالنا الصغار الذين أظهروا التزاماً فائقاً وحققوا أعلى الدرجات في اختبارات وتحديات الأكاديمية.
          </p>
        </div>

        {/* Interactive Grade Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 max-w-full no-scrollbar px-2">
          {INITIAL_GRADES.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveHonorGrade(g.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeHonorGrade === g.slug
                  ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-md shadow-amber-500/25 scale-105"
                  : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50 hover:text-purple-900 shadow-2xs"
              }`}
            >
              {g.titleEnglish} ({g.titleArabic})
            </button>
          ))}
        </div>

        {/* Top 3 Honor Roll Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto">
          {/* Rank 2 (Silver) */}
          {champ2 && (
            <div className="modern-card p-6 bg-white/95 border-2 border-slate-200 rounded-3xl shadow-lg text-center relative overflow-hidden order-2 md:order-1 hover:scale-105 transition-all">
              <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-black text-slate-700 text-sm">
                2
              </div>
              <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-slate-200 to-slate-400 p-1 mb-3 shadow-md">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-xl text-slate-700">
                  {champ2.initials}
                </div>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{champ2.name}</h3>
              <span className="text-xs font-bold text-purple-700 block mt-0.5">{champ2.gradeBadge}</span>
              <span className="text-[11px] text-slate-500 block">{champ2.schoolName} — {champ2.city}</span>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-amber-600 font-black text-sm">
                <XpGemSvg className="w-4 h-4" />
                <span>{champ2.xpPoints} نقطة XP</span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold - Elevated Champion) */}
          {champ1 && (
            <div className="modern-card p-7 bg-gradient-to-b from-amber-500/10 via-white to-white border-2 border-amber-400 rounded-3xl shadow-2xl text-center relative overflow-hidden order-1 md:order-2 md:-translate-y-4 hover:scale-105 transition-all">
              <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs flex items-center gap-1 shadow-md">
                <Crown className="w-3.5 h-3.5" />
                <span>المركز الأول 🥇</span>
              </div>
              <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1.5 mb-3 shadow-xl shadow-amber-500/30">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-2xl text-amber-600">
                  {champ1.initials}
                </div>
              </div>
              <h3 className="font-black text-lg text-slate-900">{champ1.name}</h3>
              <span className="text-xs font-black text-purple-800 block mt-0.5">{champ1.gradeBadge}</span>
              <span className="text-[11px] text-slate-500 block">{champ1.schoolName} — {champ1.city}</span>
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-center gap-2 text-amber-600 font-black text-base">
                <ChampionCupSvg className="w-5 h-5" />
                <span>{champ1.xpPoints} نقطة XP</span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {champ3 && (
            <div className="modern-card p-6 bg-white/95 border-2 border-orange-200 rounded-3xl shadow-lg text-center relative overflow-hidden order-3 hover:scale-105 transition-all">
              <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center font-black text-orange-800 text-sm">
                3
              </div>
              <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-amber-600 to-orange-400 p-1 mb-3 shadow-md">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-xl text-orange-800">
                  {champ3.initials}
                </div>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{champ3.name}</h3>
              <span className="text-xs font-bold text-purple-700 block mt-0.5">{champ3.gradeBadge}</span>
              <span className="text-[11px] text-slate-500 block">{champ3.schoolName} — {champ3.city}</span>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-amber-600 font-black text-sm">
                <XpGemSvg className="w-4 h-4" />
                <span>{champ3.xpPoints} نقطة XP</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <span className="text-xs font-bold text-purple-800 bg-purple-100/80 px-4 py-2 rounded-full border border-purple-200 inline-block shadow-2xs">
            🌟 يتم تحديث لوحة الشرف أسبوعياً بناءً على نتائج الاختبارات التفاعلية ومجموع نقاط الـ XP
          </span>
        </div>
      </div>
    </section>
  );
};
