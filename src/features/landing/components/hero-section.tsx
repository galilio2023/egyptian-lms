import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { 
  FloatingKidsToysHeroDecor, 
  KidsToysMiniStrip 
} from "@/components/ui/floating-kids-toys";
import { 
  ChampionCupSvg,
  EgyptianWalletSvg,
  CenterVoucherCardSvg,
  StreakFlameSvg,
  XpGemSvg,
  WhatsAppBubbleSvg,
  ToyDinoDinoSvg,
  ToyAlligatorGatorSvg,
  ToyMagmaAppleSvg
} from "@/components/ui/illustrated-icons";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden">
      {/* Playful Floating Kids Toys Decor */}
      <FloatingKidsToysHeroDecor />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-purple-200 text-xs font-bold text-purple-900 shadow-md shadow-purple-500/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-gradient-purple">منهاج اللغة الإنجليزية الحديث 2026 - 2027</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.2] text-slate-900">
            تعليم وتأسيس اللغة الإنجليزية <br />
            <span className="text-gradient-purple">
              بأسلوب كرتوني تفاعلي وممتع
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            رحلة تعلم شيقة للأبطال الصغار من الصف الأول إلى السادس الابتدائي تحت إشراف <strong className="text-purple-900 font-bold">مستر أحمد عبد الرحمن</strong>. صوتيات (Phonics)، اختبارات ذكية، ألعاب ومسابقات، وتقارير أسبوعية مباشرة لولي الأمر.
          </p>

          {/* Hero Mascot Champions Spotlight */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 py-2">
            {/* 1. Dino */}
            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-emerald-300 shadow-xl shadow-emerald-500/15 hover:scale-105 transition-all text-right w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-18 sm:h-18 drop-shadow-lg shrink-0 animate-float-slow">
                <ToyDinoDinoSvg className="w-full h-full" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                  الديناصور داينو 🦕
                </span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">
                  &quot;Dino Loves Phonics!&quot;
                </span>
                <span className="text-[11px] text-purple-700 font-bold block">
                  رفيقك في نطق الحروف والصوتيات
                </span>
              </div>
            </div>

            {/* 2. Magma Apple */}
            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-red-400 shadow-xl shadow-red-500/20 hover:scale-105 transition-all text-right w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-18 sm:h-18 drop-shadow-lg shrink-0 animate-pulse-soft">
                <ToyMagmaAppleSvg className="w-full h-full" />
              </div>
              <div>
                <span className="text-[10px] font-black text-red-900 bg-red-100 px-2.5 py-0.5 rounded-full inline-block">
                  تفاحة الماجما 🍎🔥
                </span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">
                  &quot;Magma Super Power!&quot;
                </span>
                <span className="text-[11px] text-amber-600 font-bold block">
                  طاقة وحماس التعلم الذكي
                </span>
              </div>
            </div>

            {/* 3. Gator */}
            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-lime-300 shadow-xl shadow-lime-500/15 hover:scale-105 transition-all text-right w-full sm:w-auto">
              <div className="w-16 h-16 sm:w-18 sm:h-18 drop-shadow-lg shrink-0 animate-toy-wiggle">
                <ToyAlligatorGatorSvg className="w-full h-full" />
              </div>
              <div>
                <span className="text-[10px] font-black text-lime-900 bg-lime-100 px-2.5 py-0.5 rounded-full inline-block">
                  التمساح جيتور 🐊
                </span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">
                  &quot;Alligator Loves Words!&quot;
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block">
                  رفيقك في حفظ الكلمات والجرامر
                </span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
            <Link
              href="/student-register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.03] text-white font-extrabold text-sm shadow-xl shadow-purple-500/30 transition-all flex items-center justify-center gap-2.5"
            >
              <XpGemSvg className="w-5 h-5 drop-shadow" />
              <span>سجّل حساب البطل الجديد مجاناً</span>
            </Link>
            <Link
              href="#courses_section"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-purple-50/70 border-2 border-purple-200 text-purple-900 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <CenterVoucherCardSvg className="w-5 h-5" />
              <span>استعراض الوحدات والكورسات</span>
            </Link>
          </div>

          {/* Interactive Kids Toys Strip */}
          <div className="pt-2">
            <span className="text-[11px] font-black text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full border border-purple-200 inline-block mb-1">
              🧸 أصدقاء الأكاديمية الصغار يرحبون بكم! اضغط والعب معهم ✨
            </span>
            <KidsToysMiniStrip />
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-100 shadow-sm">
              <ChampionCupSvg className="w-9 h-9 shrink-0" />
              <div className="text-right">
                <div className="text-slate-900 font-black text-sm">+3000 طالب</div>
                <div className="text-[11px] text-purple-600 font-semibold">بطل متفوق</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-amber-100 shadow-sm">
              <StreakFlameSvg className="w-8 h-8 shrink-0" />
              <div className="text-right">
                <div className="text-slate-900 font-black text-sm">حماس وتحديات</div>
                <div className="text-[11px] text-amber-600 font-semibold">جوائز ونقاط XP</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-emerald-100 shadow-sm">
              <EgyptianWalletSvg className="w-9 h-9 shrink-0" />
              <div className="text-right">
                <div className="text-slate-900 font-black text-sm">دفع مصري سهل</div>
                <div className="text-[11px] text-emerald-600 font-semibold">كاش وإنستاباي</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-teal-100 shadow-sm">
              <WhatsAppBubbleSvg className="w-8 h-8 shrink-0" />
              <div className="text-right">
                <div className="text-slate-900 font-black text-sm">تقارير واتساب</div>
                <div className="text-[11px] text-teal-700 font-semibold">إشعارات ولي الأمر</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
