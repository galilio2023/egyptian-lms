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
  ToyMagmaAppleSvg,
  ToyPrincessUnicornSvg,
  ToyTeddyBearSvg,
  ToyHappyPearSvg,
  ToyRocketShuttleSvg,
  MascotStarSvg,
  MascotFalconSvg,
  ToySpiderHeroSvg,
  ToyStackingBlocksSvg
} from "@/components/ui/illustrated-icons";
import { MascotChampionCard } from "./mascot-champion-card";
import type { MockPlatformSettings } from "@/lib/db/mock-data";

interface HeroSectionProps {
  teacherName?: string;
  settings?: MockPlatformSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ teacherName, settings }) => {
  const showToys = settings ? settings.enableHeroToys !== false : true;
  const showPhonicsStrip = settings ? settings.enableHeroPhonicsStrip !== false : true;
  const showMascotCards = settings ? settings.enableMascotCards !== false : true;
  const isAcademic = settings?.themeVibe === "academic_elite" || settings?.themeVibe === "minimal_clean" || settings?.themeVibe === "thanawya_prep";

  const getSquadCards = (squad?: string) => {
    if (squad === "space_galaxy") {
      return [
        {
          name: "صاروخ الفضاء 🚀",
          catchphrase: "Blast Off to Success!",
          description: "انطلاق في عالم الإنجليزية الممتعة",
          SvgIcon: ToyRocketShuttleSvg,
          badgeColorClass: "text-sky-800 bg-sky-100",
          borderColorClass: "border-sky-300",
          shadowColorClass: "shadow-sky-500/15",
          animationClass: "animate-float-slow",
        },
        {
          name: "نجم التفوق ⭐",
          catchphrase: "Shine Bright Like A Star!",
          description: "رفيقك في جمع النقاط والمراكز الأولى",
          SvgIcon: MascotStarSvg,
          badgeColorClass: "text-amber-800 bg-amber-100",
          borderColorClass: "border-amber-300",
          shadowColorClass: "shadow-amber-500/15",
          animationClass: "animate-pulse-soft",
        },
        {
          name: "صقر المعرفة 🦅",
          catchphrase: "Fly High With English!",
          description: "سرعة في فهم القواعد والكلمات",
          SvgIcon: MascotFalconSvg,
          badgeColorClass: "text-purple-800 bg-purple-100",
          borderColorClass: "border-purple-300",
          shadowColorClass: "shadow-purple-500/15",
          animationClass: "animate-toy-wiggle",
        },
      ];
    }
    if (squad === "magic_unicorns") {
      return [
        {
          name: "اليونيكورن السحري 🦄",
          catchphrase: "Magic Phonics Power!",
          description: "رحلة خيالية ممتعة في نطق الحروف",
          SvgIcon: ToyPrincessUnicornSvg,
          badgeColorClass: "text-pink-800 bg-pink-100",
          borderColorClass: "border-pink-300",
          shadowColorClass: "shadow-pink-500/15",
          animationClass: "animate-float-slow",
        },
        {
          name: "دبدوب تيدي 🧸",
          catchphrase: "Friendly Words Practice!",
          description: "مساعدتك في حل الواجبات اليومية",
          SvgIcon: ToyTeddyBearSvg,
          badgeColorClass: "text-amber-800 bg-amber-100",
          borderColorClass: "border-amber-300",
          shadowColorClass: "shadow-amber-500/15",
          animationClass: "animate-pulse-soft",
        },
        {
          name: "الكمثرى السعيدة 🍐",
          catchphrase: "Sweet English Smiles!",
          description: "تشجيع دائم وحماس في كل درس",
          SvgIcon: ToyHappyPearSvg,
          badgeColorClass: "text-lime-800 bg-lime-100",
          borderColorClass: "border-lime-300",
          shadowColorClass: "shadow-lime-500/15",
          animationClass: "animate-toy-wiggle",
        },
      ];
    }
    if (squad === "magma_heroes") {
      return [
        {
          name: "تفاحة الماجما 🍎🔥",
          catchphrase: "Magma Super Power!",
          description: "طاقة وحماس التعلم الذكي",
          SvgIcon: ToyMagmaAppleSvg,
          badgeColorClass: "text-red-900 bg-red-100",
          borderColorClass: "border-red-400",
          shadowColorClass: "shadow-red-500/20",
          animationClass: "animate-pulse-soft",
        },
        {
          name: "سبايدر هيرو 🕷️",
          catchphrase: "Web of Super Words!",
          description: "شبكة مفردات وقواعد قوية",
          SvgIcon: ToySpiderHeroSvg,
          badgeColorClass: "text-indigo-900 bg-indigo-100",
          borderColorClass: "border-indigo-400",
          shadowColorClass: "shadow-indigo-500/20",
          animationClass: "animate-float-slow",
        },
        {
          name: "مكعبات التأسيس 🔤",
          catchphrase: "Build Strong Skills!",
          description: "تأسيس سليم من الحرف للكلمة",
          SvgIcon: ToyStackingBlocksSvg,
          badgeColorClass: "text-purple-900 bg-purple-100",
          borderColorClass: "border-purple-300",
          shadowColorClass: "shadow-purple-500/15",
          animationClass: "animate-toy-wiggle",
        },
      ];
    }
    // Default: Dino Safari
    return [
      {
        name: "الديناصور داينو 🦕",
        catchphrase: "Dino Loves Phonics!",
        description: "رفيقك في نطق الحروف والصوتيات",
        SvgIcon: ToyDinoDinoSvg,
        badgeColorClass: "text-emerald-800 bg-emerald-100",
        borderColorClass: "border-emerald-300",
        shadowColorClass: "shadow-emerald-500/15",
        animationClass: "animate-float-slow",
      },
      {
        name: "تفاحة الماجما 🍎🔥",
        catchphrase: "Magma Super Power!",
        description: "طاقة وحماس التعلم الذكي",
        SvgIcon: ToyMagmaAppleSvg,
        badgeColorClass: "text-red-900 bg-red-100",
        borderColorClass: "border-red-400",
        shadowColorClass: "shadow-red-500/20",
        animationClass: "animate-pulse-soft",
      },
      {
        name: "التمساح جيتور 🐊",
        catchphrase: "Alligator Loves Words!",
        description: "رفيقك في حفظ الكلمات والجرامر",
        SvgIcon: ToyAlligatorGatorSvg,
        badgeColorClass: "text-lime-900 bg-lime-100",
        borderColorClass: "border-lime-300",
        shadowColorClass: "shadow-lime-500/15",
        animationClass: "animate-toy-wiggle",
      },
    ];
  };

  const activeMascotSquad = getSquadCards(settings?.toySquad);

  return (
    <section className="relative pt-12 pb-24 overflow-hidden">
      {/* Playful Floating Kids Toys Decor (Conditionally Rendered) */}
      {showToys && <FloatingKidsToysHeroDecor />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-purple-200 text-xs font-bold text-purple-900 shadow-md shadow-purple-500/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-gradient-purple">
              {isAcademic ? "المنهاج التعليمي الأكاديمي المعتمد 2026 - 2027" : "منهاج اللغة الإنجليزية الحديث 2026 - 2027"}
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.2] text-slate-900">
            {isAcademic ? (
              <>
                التميز الأكاديمي والتأسيس اللغوي المتكامل <br />
                <span className="text-gradient-purple">
                  بأعلى معايير الجودة والتدريس الحديث
                </span>
              </>
            ) : (
              <>
                تعليم وتأسيس اللغة الإنجليزية <br />
                <span className="text-gradient-purple">
                  بأسلوب كرتوني تفاعلي وممتع
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            رحلة تعلم شيقة للأبطال الصغار من الصف الأول إلى السادس الابتدائي تحت إشراف <strong className="text-purple-900 font-bold">{teacherName || "نخبة من خبراء التأسيس الأكاديمي"}</strong>. صوتيات (Phonics)، اختبارات ذكية، ألعاب ومسابقات، وتقارير أسبوعية مباشرة لولي الأمر.
          </p>

          {/* Hero Mascot Champions Spotlight (Conditionally Rendered by Squad) */}
          {showMascotCards && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 py-2">
              {activeMascotSquad.map((champion, idx) => (
                <MascotChampionCard
                  key={idx}
                  name={champion.name}
                  catchphrase={champion.catchphrase}
                  description={champion.description}
                  SvgIcon={champion.SvgIcon}
                  badgeColorClass={champion.badgeColorClass}
                  borderColorClass={champion.borderColorClass}
                  shadowColorClass={champion.shadowColorClass}
                  animationClass={champion.animationClass}
                />
              ))}
            </div>
          )}

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

          {/* Interactive Kids Toys Strip (Conditionally Rendered) */}
          {showPhonicsStrip && (
            <div className="pt-2">
              <span className="text-[11px] font-black text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full border border-purple-200 inline-block mb-1">
                🧸 أصدقاء الأكاديمية الصغار يرحبون بكم! اضغط والعب معهم ✨
              </span>
              <KidsToysMiniStrip />
            </div>
          )}

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
