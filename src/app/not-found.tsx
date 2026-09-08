"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Home, 
  ArrowRight, 
  Sparkles, 
  Search, 
  MessageCircle, 
  Compass, 
  Volume2, 
  GraduationCap,
  BookOpen,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { SpaceExplorer404Svg } from "@/components/ui/not-found-illustrations";

const QUICK_LINKS = [
  {
    href: "/",
    title: "الرئيسية",
    subtitle: "العودة للواجهة الرئيسية للمنصة",
    icon: Home,
    gradient: "from-purple-500 to-indigo-600",
    badge: "Home",
  },
  {
    href: "/portal/dashboard",
    title: "لوحة تحكم البطل",
    subtitle: "متابعة دروسك ونقاط XP والواجبات",
    icon: GraduationCap,
    gradient: "from-amber-500 to-orange-600",
    badge: "Student Portal",
  },
  {
    href: "/student-login",
    title: "تسجيل الدخول",
    subtitle: "الدخول السريع بكلمة سر الطالب",
    icon: BookOpen,
    gradient: "from-pink-500 to-rose-600",
    badge: "Login",
  },
  {
    href: "https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%88%D8%A7%D8%AC%D9%87%D8%AA%20%D8%B5%D9%81%D8%AD%D8%A9%20%D8%BA%D9%8A%D8%B1%20%D9%85%D9%88%D8%AC%D9%88%D8%AF%D8%A9%20404%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%85%D9%86%D8%B5%D8%A9",
    title: "الدعم الفني عبر واتساب",
    subtitle: "تواصل مع فريق المتابعة الفورية",
    icon: MessageCircle,
    gradient: "from-emerald-500 to-teal-600",
    badge: "24/7 Support",
    isExternal: true,
  },
];

const SUGGESTIONS = [
  { label: "الوحدات الدراسية", href: "/#courses" },
  { label: "لوحة الشرف", href: "/#honor" },
  { label: "تسجيل طالب جديد", href: "/student-register" },
  { label: "المحاضرات الكرتونية", href: "/#sample-lectures" },
];

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const playVoice = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          "Attention explorer! Page four zero four! The page is lost in space, let's fly back together!"
        );
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error", e);
      }
    }
    toast.info("🔊 رائد الفضاء: 404! دعنا نعود لمغامراتنا التعليمية الشيقة!");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/#courses`);
    toast.success(`جاري نقلك لتصفح المناهج الدراسية... 🚀`);
  };

  return (
    <div className="min-h-screen bg-radial from-purple-950 via-slate-950 to-indigo-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* 1. Ambient Nebula Glow & Cosmic Backdrop */}
      <div className="absolute top-0 start-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 end-1/4 w-[28rem] h-[28rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 end-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Constellations */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-12 start-12 w-2 h-2 rounded-full bg-white animate-ping" />
        <div className="absolute top-1/4 end-20 w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
        <div className="absolute bottom-1/3 start-24 w-2 h-2 rounded-full bg-pink-300 animate-pulse" />
        <div className="absolute bottom-16 end-1/3 w-1.5 h-1.5 rounded-full bg-indigo-300 animate-ping" />
      </div>

      {/* 2. Top Bar Navigation */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <Link 
          href="/"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-bold transition-all hover:scale-105"
        >
          <Compass className="w-4 h-4 text-amber-300" />
          <span>المنصة التعليمية</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-bold transition-all hover:scale-105 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-purple-300" />
          <span>الرجوع للخلف</span>
        </button>
      </header>

      {/* 3. Hero Visual Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-center space-y-6 sm:space-y-8 my-auto">
        {/* Animated Vector Illustration */}
        <div className="relative inline-block mx-auto animate-float-slow">
          <SpaceExplorer404Svg className="w-64 h-52 sm:w-80 sm:h-64 mx-auto drop-shadow-2xl" />
          
          {/* Interactive Voice Speaker Button */}
          <button
            type="button"
            onClick={playVoice}
            className="absolute bottom-3 end-4 sm:end-8 p-3 rounded-full bg-amber-400 hover:bg-amber-300 text-purple-950 shadow-lg shadow-amber-400/30 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="انقر للاستماع لصوت رائد الفضاء 🔊"
            aria-label="استمع لرسالة رائد الفضاء"
          >
            <Volume2 className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Text Headers */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-black shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>رمز الخطأ 404 • Page Lost in Space</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            أوه يا بطل! كأننا وصلنا لكوكب غير مكتشف 🪐🚀
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-purple-200/90 max-w-2xl mx-auto font-medium leading-relaxed">
            الصفحة أو المغامرة التي تبحث عنها غير موجودة أو تم نقلها. لا تقلق، سفينتنا التعليمية جاهزة لإعادتك إلى طريق التفوق فوراً!
          </p>
        </div>

        {/* Quick Search / Jump Input */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن وحدة، درس، أو مغامرة تعليمية..."
            className="w-full py-3 ps-11 pe-24 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border-2 border-white/20 focus:border-amber-400 text-white placeholder-purple-300/60 text-xs sm:text-sm font-bold backdrop-blur-md outline-hidden transition-all shadow-lg"
          />
          <Search className="w-4 h-4 text-purple-300 absolute start-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute end-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-black transition-all hover:scale-105 cursor-pointer shadow-md"
          >
            بحث 🚀
          </button>
        </form>

        {/* Quick Tags Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-[11px] text-purple-300/80 font-bold">اقتراحات سريعة:</span>
          {SUGGESTIONS.map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-purple-200 hover:text-white text-[11px] font-bold transition-colors"
            >
              {tag.label}
            </Link>
          ))}
        </div>

        {/* Navigation Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 text-right">
          {QUICK_LINKS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                target={card.isExternal ? "_blank" : undefined}
                rel={card.isExternal ? "noopener noreferrer" : undefined}
                className="group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/30 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-purple-200">
                    {card.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {card.title}
                  </h2>
                  <p className="text-[11px] text-purple-200/70 font-medium leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                <div className="pt-1 flex items-center gap-1 text-[11px] font-black text-amber-300 group-hover:gap-2 transition-all">
                  <span>الانتقال فوراً</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* 4. Cheerful Footer */}
      <footer className="relative z-10 text-center py-6 text-[11px] text-purple-300/60 font-medium border-t border-white/5">
        <p>المنصة التعليمية الذكية للأبطال • جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
