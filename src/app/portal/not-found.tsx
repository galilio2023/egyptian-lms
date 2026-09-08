"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Compass, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  MessageCircle, 
  Volume2, 
  RotateCcw,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { StudentPortal404Svg } from "@/components/ui/not-found-illustrations";

const PORTAL_ACTIONS = [
  {
    href: "/portal/dashboard",
    title: "لوحة تحكم الأبطال",
    subtitle: "العودة لمحطتك القادمة ومتابعة الدروس",
    icon: GraduationCap,
    gradient: "from-purple-500 to-indigo-600",
    badge: "محطة البطل",
  },
  {
    href: "/portal/dashboard#courses",
    title: "وحداتي الدراسية",
    subtitle: "تصفح جميع الفصول والمناهج المتاحة",
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-500",
    badge: "المناهج",
  },
  {
    href: "/portal/dashboard",
    title: "رصيد النقاط وXP",
    subtitle: "تفقد إنجازاتك وترتيبك بين زملائك",
    icon: Trophy,
    gradient: "from-pink-500 to-rose-600",
    badge: "الجوائز",
  },
  {
    href: "https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%8A%D8%A7%20%D9%85%D8%B3%D8%AA%D8%B1%D8%8C%20%D9%84%D9%85%20%D8%A3%D8%AC%D8%AF%20%D8%A7%D9%84%D8%AF%D8%B1%D8%B3%20%D8%A7%D9%84%D9%85%D8%B7%D9%84%D9%88%D8%A8%20%D9%81%D9%8A%20%D8%AD%D8%B3%D8%A7%D8%A8%D9%8A",
    title: "مراسلة المعلم والدعم",
    subtitle: "إذا كان الدرس مفقوداً أو تحتاج مساعدة",
    icon: MessageCircle,
    gradient: "from-emerald-500 to-teal-600",
    badge: "واتساب",
    isExternal: true,
  },
];

export default function PortalNotFound() {
  const router = useRouter();

  const playLionVoice = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          "Roar! Hello brave hero! This lesson island is not on the map yet! Let's go back to our dashboard and keep learning!"
        );
        utterance.lang = "en-US";
        utterance.rate = 0.88;
        utterance.pitch = 1.25;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error", e);
      }
    }
    toast.info("🦁 أسد الشجاعة: أهلاً يا بطل! هذه الجزيرة لم تُفتح بعد، دعنا نعود للوحة التحكم!");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 via-indigo-50/40 to-white text-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* 1. Cheerful Background Ambient Glows */}
      <div className="absolute top-0 start-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 end-1/4 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Top Bar */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 flex items-center justify-between">
        <Link
          href="/portal/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 hover:bg-white border border-purple-200 shadow-xs text-purple-900 text-xs sm:text-sm font-black transition-all hover:scale-105"
        >
          <Compass className="w-4 h-4 text-purple-600" />
          <span>بوابة الطالب التعليمية</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/portal/dashboard");
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 hover:bg-white border border-purple-200 shadow-xs text-slate-700 text-xs sm:text-sm font-black transition-all hover:scale-105 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-purple-600" />
          <span>الرجوع للمحطة السابقة</span>
        </button>
      </header>

      {/* 3. Main Center Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-center space-y-6 my-auto">
        {/* Vector Mascot with Floating Animation */}
        <div className="relative inline-block mx-auto animate-float-slow">
          <StudentPortal404Svg className="w-56 h-48 sm:w-72 sm:h-60 mx-auto drop-shadow-xl" />

          {/* Voice Speaker Trigger */}
          <button
            type="button"
            onClick={playLionVoice}
            className="absolute bottom-2 end-4 sm:end-6 p-3 rounded-full bg-amber-400 hover:bg-amber-300 text-purple-950 shadow-lg shadow-amber-400/40 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="انقر للاستماع لرسالة أسد الشجاعة 🦁"
            aria-label="استمع لرسالة الأسد"
          >
            <Volume2 className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Headings */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>خريطة الكنز • الصفحة غير متوفرة (404)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            أهلاً يا بطل! هذه الجزيرة التعليمية غير موجودة على الخريطة 🗺️🏝️
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
            يبدو أن الدرس أو الوحدة أو الاختبار الذي تحاول الوصول إليه غير متاح حالياً أو قد تم تحديث رابطه. لا تقلق، تقدمك محفوظ ويمكنك العودة لدروسك بضغطة زر!
          </p>
        </div>

        {/* Quick Hub Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-right">
          {PORTAL_ACTIONS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                target={card.isExternal ? "_blank" : undefined}
                rel={card.isExternal ? "noopener noreferrer" : undefined}
                className="group p-4 rounded-2xl bg-white hover:bg-purple-50/50 border-2 border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                      {card.title}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="relative z-10 text-center py-5 text-[11px] text-slate-400 font-medium">
        <p>بوابة البطل الذكية • معاً نحو القمة والتفوق 🚀🌟</p>
      </footer>
    </div>
  );
}
