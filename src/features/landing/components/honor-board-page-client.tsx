"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Crown, 
  Share2, 
  Sparkles, 
  Flame, 
  Medal, 
  Star, 
  GraduationCap,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/layout/whatsapp-floating-btn";
import { 
  INITIAL_GRADES, 
  INITIAL_GRADE_CHAMPIONS, 
  type MockGradeChampion,
  type MockPlatformSettings 
} from "@/lib/db/mock-data";
import { ChampionCupSvg, XpGemSvg } from "@/components/ui/illustrated-icons";

interface HonorBoardPageClientProps {
  settings: MockPlatformSettings;
}

export function HonorBoardPageClient({ settings }: HonorBoardPageClientProps) {
  const [activeGrade, setActiveGrade] = useState<string>("grade-3");

  const champions: MockGradeChampion[] =
    INITIAL_GRADE_CHAMPIONS[activeGrade] || INITIAL_GRADE_CHAMPIONS["grade-3"] || [];

  const champ1 = champions.find((c) => c.rank === 1);
  const champ2 = champions.find((c) => c.rank === 2);
  const champ3 = champions.find((c) => c.rank === 3);
  const otherChamps = champions.filter((c) => c.rank > 3);

  const currentGradeObj = INITIAL_GRADES.find((g) => g.slug === activeGrade) || INITIAL_GRADES[2];

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏆 شاهد لوحة الشرف وأبطال التميز في أكاديمية ${settings.academyNameArabic || "المنصة التعليمية"} لـ ${currentGradeObj.titleArabic}!\n\nرابط لوحة الشرف: ${typeof window !== "undefined" ? window.location.href : ""}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-amber-50/50 via-white to-purple-50/40 text-slate-900 font-sans selection:bg-purple-500 selection:text-white">
      <Header
        academyName={settings.academyNameArabic}
        teacherName={settings.teacherNameArabic}
      />

      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="relative overflow-hidden py-14 sm:py-18 bg-linear-to-b from-amber-100/60 via-amber-50/30 to-white border-b border-amber-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black shadow-2xs">
              <Trophy className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>لوحة الشرف الوطنية — تكريم أبطال الجمهورية</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              أوائل الطلاب وقادة <span className="text-gradient-purple">لوحة التميز</span> 👑
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
              نحتفي بأبطالنا الصغار الذين حققوا أعلى درجات التفوق والالتزام في اختبارات المناهج وواجبات الكشكول ونالوا شرف الصدارة.
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 min-h-[44px]"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span>مشاركة لوحة الشرف على واتساب</span>
              </button>
            </div>
          </div>
        </section>

        {/* Grade Selector Tabs */}
        <section className="py-4 sm:py-5 border-b border-amber-200/60 bg-white/95 backdrop-blur-md sticky top-[70px] sm:top-[74px] z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1.5 pt-0.5 px-2 max-w-full scroll-smooth overscroll-x-contain">
            {INITIAL_GRADES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveGrade(g.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeGrade === g.slug
                    ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-md shadow-amber-500/25 scale-105"
                    : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50 hover:text-purple-900 shadow-2xs"
                }`}
              >
                {g.titleEnglish} ({g.titleArabic})
              </button>
            ))}
          </div>
        </section>

        {/* Top 3 Champions Podium */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-1">
              <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                أبطال الصدارة الثلاثة
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                فرسان {currentGradeObj.titleArabic} 🥇
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto mb-14">
              
              {/* Rank 2 (Silver) */}
              {champ2 && (
                <div className="p-6 bg-white/95 border-2 border-slate-300 rounded-3xl shadow-lg text-center relative overflow-hidden order-2 md:order-1 hover:scale-105 transition-all">
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
                  <span className="text-[11px] text-slate-500 block mt-1">{champ2.schoolName} — {champ2.city}</span>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-700 font-black text-sm">
                    <Medal className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span>{champ2.xpPoints} نقطة XP</span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold - Champion) */}
              {champ1 && (
                <div className="p-7 bg-gradient-to-b from-amber-500/15 via-white to-white border-2 border-amber-400 rounded-3xl shadow-2xl text-center relative overflow-hidden order-1 md:order-2 md:-translate-y-4 hover:scale-105 transition-all">
                  <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs flex items-center gap-1 shadow-md">
                    <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>المركز الأول 🥇</span>
                  </div>
                  <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1.5 mb-3 shadow-xl shadow-amber-500/30">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-2xl text-amber-600">
                      {champ1.initials}
                    </div>
                  </div>
                  <h3 className="font-black text-lg text-slate-900">{champ1.name}</h3>
                  <span className="text-xs font-black text-purple-800 block mt-0.5">{champ1.gradeBadge}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">{champ1.schoolName} — {champ1.city}</span>
                  <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-center gap-2 text-amber-600 font-black text-base">
                    <ChampionCupSvg className="w-5 h-5" aria-hidden="true" />
                    <span>{champ1.xpPoints} نقطة XP</span>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {champ3 && (
                <div className="p-6 bg-white/95 border-2 border-amber-300 rounded-3xl shadow-lg text-center relative overflow-hidden order-3 hover:scale-105 transition-all">
                  <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center font-black text-amber-800 text-sm">
                    3
                  </div>
                  <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-amber-300 to-amber-600 p-1 mb-3 shadow-md">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-xl text-amber-800">
                      {champ3.initials}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{champ3.name}</h3>
                  <span className="text-xs font-bold text-purple-700 block mt-0.5">{champ3.gradeBadge}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">{champ3.schoolName} — {champ3.city}</span>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-amber-700 font-black text-sm">
                    <Medal className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span>{champ3.xpPoints} نقطة XP</span>
                  </div>
                </div>
              )}

            </div>

            {/* Additional Champions List (Ranks 4+) */}
            {otherChamps.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-3">
                <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" aria-hidden="true" />
                  <span>باقي أبطال الشرف المتألقين</span>
                </h3>

                <div className="bg-white rounded-3xl border border-purple-100 shadow-md divide-y divide-purple-50 overflow-hidden">
                  {otherChamps.map((c) => (
                    <div
                      key={c.rank}
                      className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-purple-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center">
                          {c.rank}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                          <span className="text-[11px] text-slate-500">{c.schoolName} — {c.city}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-amber-600 font-black text-xs">
                        <XpGemSvg className="w-4 h-4" aria-hidden="true" />
                        <span>{c.xpPoints} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* How to Qualify Explainer */}
        <section className="py-14 bg-purple-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold inline-block">
                طريقك إلى لوحة الشرف
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                كيف تصبح بطلاً وتظهر في لوحة الشرف؟
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 font-medium">
                تُحسب نقاط التميز تلقائياً بناءً على 3 ركائز أساسية:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Flame className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-black text-base">1. التتابع اليومي (Streaks)</h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  سجل دخولك يومياً وشاهد الفيديوهات التدريبية لتحصل على مضاعف النقاط اليومي.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-black text-base">2. الاختبارات الذكية</h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  حقق نسبة نجاح 85% أو أكثر في التحديات ومسابقات الوحدات لتحصل على حتى +200 XP.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-black text-base">3. واجبات الكشكول</h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  ارفع صور واجباتك ليصححها المعلم بالقلم الرقمي، وتحصل على الدرجة الكاملة وشارة التميز.
                </p>
              </div>
            </div>

            <div className="text-center pt-10">
              <Link
                href="/quizzes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-lg hover:scale-105 min-h-[44px]"
              >
                <span>ابدأ جمع النقاط الآن عبر التحديات</span>
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer
        academyName={settings.academyNameArabic}
        teacherName={settings.teacherNameArabic}
        whatsappNumber={settings.whatsappNumber}
        hotlineNumber={settings.hotlineNumber}
      />

      <WhatsAppFloatingButton
        phoneNumber={settings.whatsappNumber}
        teacherName={settings.teacherNameArabic}
        academyName={settings.academyNameArabic}
      />
    </div>
  );
}
