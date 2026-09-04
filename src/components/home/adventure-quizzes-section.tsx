"use client";

import Link from "next/link";
import { 
  Sparkles, 
  Clock, 
  HelpCircle, 
  ChevronLeft
} from "lucide-react";
import { INITIAL_ADVENTURE_QUIZZES } from "@/lib/db/mock-data";
import { 
  ChampionCupSvg, 
  XpGemSvg,
  ToyDinoDinoSvg,
  ToyAlligatorGatorSvg,
  ToyMagmaAppleSvg,
  ToyStackingBlocksSvg
} from "@/components/ui/illustrated-icons";

export function AdventureQuizzesSection() {
  return (
    <section id="adventure_quizzes" className="py-20 bg-gradient-to-b from-white/70 via-purple-50/30 to-white/80 border-t border-purple-100 relative overflow-hidden">
      
      {/* Decorative Sparkles & Ambient Glows */}
      <div className="absolute top-1/4 -start-24 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -end-24 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/90 border border-purple-200 text-purple-900 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>مغامرات الاختبارات السحرية — اتعلم والعب في نفس الوقت</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            اختبارات كرتونية وتحديات ذكية بدون خوف
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            حوّلنا الامتحانات المدرسية التقليدية إلى مغامرات تفاعلية شيقة! اختر بطلك المفضل، جاوب على الأسئلة، واجمع نقاط الـ XP وجوائز التميز فورياً.
          </p>
        </div>

        {/* 4 Themed Adventure Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_ADVENTURE_QUIZZES.map((adv) => (
            <div
              key={adv.id}
              className={`modern-card p-6 flex flex-col justify-between rounded-3xl bg-gradient-to-b ${adv.accentBg} border-2 ${adv.accentBorder} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden`}
            >
              
              {/* Background Mascot Watermark */}
              <div className="absolute -bottom-4 -start-4 opacity-10 group-hover:opacity-20 transition-opacity w-28 h-28 pointer-events-none">
                {adv.theme === "zoo" && <ToyDinoDinoSvg className="w-full h-full" />}
                {adv.theme === "spiderman" && <ToyMagmaAppleSvg className="w-full h-full" />}
                {adv.theme === "fruits" && <ToyAlligatorGatorSvg className="w-full h-full" />}
                {adv.theme === "numbers" && <ToyStackingBlocksSvg className="w-full h-full" />}
              </div>

              {/* Top Tag & Grade Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700 shadow-2xs">
                  {adv.gradeBadge}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <XpGemSvg className="w-3.5 h-3.5" />
                  <span>+{adv.xpReward} XP</span>
                </span>
              </div>

              {/* Central Mascot Icon */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white shadow-md p-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/80 my-2">
                {adv.theme === "zoo" && <ToyDinoDinoSvg className="w-full h-full drop-shadow" />}
                {adv.theme === "spiderman" && <ToyMagmaAppleSvg className="w-full h-full drop-shadow" />}
                {adv.theme === "fruits" && <ToyAlligatorGatorSvg className="w-full h-full drop-shadow" />}
                {adv.theme === "numbers" && <ToyStackingBlocksSvg className="w-full h-full drop-shadow" />}
              </div>

              {/* Title & Subtitle */}
              <div className="text-center space-y-1.5 my-3">
                <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
                  {adv.tag}
                </span>
                <h3 className="text-base font-black text-slate-900 group-hover:text-purple-900 transition-colors">
                  {adv.title}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed">
                  {adv.subtitle}
                </p>
              </div>

              {/* Metrics Pill (Questions & Time) */}
              <div className="flex items-center justify-center gap-4 py-2 border-y border-purple-100/60 text-[11px] font-bold text-slate-600 mb-4 bg-white/50 rounded-xl">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  {adv.questionsCount} أسئلة
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {adv.durationMinutes} دقائق
                </span>
              </div>

              {/* Action Button */}
              <Link
                href={`/portal/quiz/${adv.slug}`}
                className={`w-full py-2.5 px-4 rounded-xl ${adv.buttonColor} text-white font-extrabold text-xs shadow-md shadow-purple-500/15 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all`}
              >
                <span>ابدأ الاختبار السحري</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>

            </div>
          ))}
        </div>

        {/* Bottom Encouragement Callout */}
        <div className="mt-12 p-4 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-dashed border-purple-200 text-center max-w-2xl mx-auto flex items-center justify-center gap-3 shadow-xs">
          <ChampionCupSvg className="w-7 h-7 shrink-0" />
          <p className="text-xs font-bold text-slate-700">
            🎯 كل مغامرة تنجح فيها تضيف إلى رصيدك نقاط XP ترفع ترتيبك مباشرة داخل <strong className="text-purple-800 font-black">لوحة الشرف الأسبوعية</strong>!
          </p>
        </div>

      </div>
    </section>
  );
}
