"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  Flame, 
  CheckCircle, 
  ArrowLeft,
  Zap,
  Target
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/layout/whatsapp-floating-btn";
import { INITIAL_ADVENTURE_QUIZZES, type MockPlatformSettings } from "@/lib/db/mock-data";
import { ChampionCupSvg, XpGemSvg } from "@/components/ui/illustrated-icons";

interface QuizzesPageClientProps {
  settings: MockPlatformSettings;
}

export function QuizzesPageClient({ settings }: QuizzesPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredQuizzes = INITIAL_ADVENTURE_QUIZZES.filter((q) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "phonics" && (q.theme === "zoo" || q.tag.includes("أصوات") || q.tag.includes("حيوانات"))) return true;
    if (activeCategory === "fruits" && (q.theme === "fruits" || q.tag.includes("فواكه") || q.tag.includes("ألوان"))) return true;
    if (activeCategory === "grammar" && (q.theme === "spiderman" || q.tag.includes("قواعد") || q.tag.includes("أبطال"))) return true;
    if (activeCategory === "numbers" && (q.theme === "numbers" || q.tag.includes("أرقام"))) return true;
    return false;
  });

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-amber-50/40 via-white to-purple-50/30 text-slate-900 font-sans selection:bg-purple-500 selection:text-white">
      <Header
        academyName={settings.academyNameArabic}
        teacherName={settings.teacherNameArabic}
      />

      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="relative overflow-hidden py-14 sm:py-18 bg-linear-to-b from-amber-100/50 via-amber-50/20 to-white border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ألعاب وتحديات الأبطال — العب، تعلّم، واجمع نقاط الـ XP</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              تحديات واختبارات <span className="text-gradient-purple">الأبطال التفاعلية</span> 🎮
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
              مسابقات إنجليزية شيقة بأصوات تفاعلية وذكاء اصطناعي. اكسب نقاط التميز فوراً ونافس زملاءك على قمة لوحة الشرف!
            </p>

            {/* Gamification Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 shadow-2xs">
                <XpGemSvg className="w-4 h-4 text-purple-600" />
                <span>حتى +200 نقطة XP لكل اختبار</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 shadow-2xs">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>تعزيز التتابع اليومي (Daily Streaks)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 shadow-2xs">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>تصعيد مباشر إلى لوحة الشرف</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="py-4 sm:py-5 border-b border-purple-100/80 bg-white/95 backdrop-blur-md sticky top-[70px] sm:top-[74px] z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1.5 pt-0.5 px-2 max-w-full scroll-smooth overscroll-x-contain">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === "all"
                  ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20 scale-105"
                  : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              جميع التحديات ({INITIAL_ADVENTURE_QUIZZES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("phonics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === "phonics"
                  ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20 scale-105"
                  : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              حديقة الحيوان والصوتيات 🦁
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("fruits")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === "fruits"
                  ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20 scale-105"
                  : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              الألوان وسلة الفواكه 🍎
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("grammar")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === "grammar"
                  ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20 scale-105"
                  : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              قواعد سبايدر مان 🕷️
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("numbers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === "numbers"
                  ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20 scale-105"
                  : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              صائدي الأرقام والحساب 🔢
            </button>
          </div>
        </section>

        {/* Quizzes Cards Grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${quiz.accentBg} border-2 ${quiz.accentBorder} shadow-lg hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group`}
                >
                  {/* Top Badge Tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-black px-3 py-1 rounded-full bg-white/90 shadow-2xs border border-purple-100 text-slate-800">
                      {quiz.tag}
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                      {quiz.gradeBadge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-purple-950 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {quiz.subtitle}
                    </p>
                  </div>

                  {/* Quiz Meta Specs */}
                  <div className="flex items-center gap-4 py-3 px-4 rounded-2xl bg-white/80 border border-white/60 mb-6 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      <span>{quiz.questionsCount} أسئلة تفاعلية</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{quiz.durationMinutes} دقائق</span>
                    </div>
                    <div className="ms-auto flex items-center gap-1.5 text-amber-600 font-black">
                      <XpGemSvg className="w-4 h-4" />
                      <span>+{quiz.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    href={`/portal/quiz/${quiz.slug}`}
                    className={`w-full py-3.5 px-6 rounded-2xl ${quiz.buttonColor} text-white font-black text-xs sm:text-sm text-center shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98`}
                  >
                    <span>ابدأ مغامرة التحدي الآن</span>
                    <Zap className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Motivation Banner */}
        <section className="py-14 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-md">
              <ChampionCupSvg className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              تريد رؤية اسمك وصورتك في المركز الأول؟
            </h2>
            <p className="text-xs sm:text-sm max-w-xl mx-auto text-amber-100 font-medium">
              كل تحدٍ تكمله يمنحك نقاط تفوق تُضاف فوراً لملفك الشخصي وتصعد بك في لوحة شرف الأكاديمية!
            </p>
            <div className="pt-2">
              <Link
                href="/honor-board"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all shadow-lg hover:scale-105"
              >
                <span>استعرض لوحة الشرف وأوائل الطلاب</span>
                <ArrowLeft className="w-4 h-4" />
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
