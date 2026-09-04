"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ChevronLeft,
  Trophy,
  Play,
  Crown
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/layout/whatsapp-floating-btn";
import { ProtectedVideoPlayer } from "@/components/lms/protected-video-player";
import { EgyptianCheckoutModal } from "@/components/checkout/egyptian-checkout-modal";
import { AdventureQuizzesSection } from "@/components/home/adventure-quizzes-section";
import { 
  INITIAL_GRADES, 
  INITIAL_UNITS, 
  INITIAL_GRADE_CHAMPIONS, 
  INITIAL_PLATFORM_SETTINGS,
  type MockUnit,
  type MockPlatformSettings 
} from "@/lib/db/mock-data";
import { 
  EliteLogoBadge,
  ChampionCupSvg,
  PhonicsSpeechSvg,
  DrmVideoShieldSvg,
  EgyptianWalletSvg,
  CenterVoucherCardSvg,
  ExamQuizSheetSvg,
  StreakFlameSvg,
  XpGemSvg,
  WhatsAppBubbleSvg,
  WorksheetPdfSvg,
  ToyDinoDinoSvg,
  ToyAlligatorGatorSvg,
  ToyMagmaAppleSvg
} from "@/components/ui/illustrated-icons";
import { 
  FloatingKidsToysHeroDecor, 
  KidsToysMiniStrip 
} from "@/components/ui/floating-kids-toys";

export default function HomePage() {
  const [selectedUnit, setSelectedUnit] = useState<MockUnit | null>(null);
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>("all");
  const [activeHonorGrade, setActiveHonorGrade] = useState<string>("grade-3");
  const [units, setUnits] = useState<MockUnit[]>(INITIAL_UNITS);
  const [settings, setSettings] = useState<MockPlatformSettings>(INITIAL_PLATFORM_SETTINGS);

  useEffect(() => {
    let active = true;
    fetch("/api/public/landing-data")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          if (data?.units && data.units.length > 0) {
            setUnits(data.units);
          }
          if (data?.settings) {
            setSettings(data.settings);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filteredUnits = activeGradeFilter === "all"
    ? units
    : units.filter((u) => u.gradeSlug === activeGradeFilter);

  const currentChampions = INITIAL_GRADE_CHAMPIONS[activeHonorGrade] || INITIAL_GRADE_CHAMPIONS["grade-3"];
  const champ1 = currentChampions.find((c) => c.rank === 1);
  const champ2 = currentChampions.find((c) => c.rank === 2);
  const champ3 = currentChampions.find((c) => c.rank === 3);

  return (
    <div className="min-h-screen flex flex-col text-slate-900 overflow-x-hidden relative">
      
      {/* Full-Page Fixed Illustrated Landscape Artwork spanning all the way to the footer */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      
      {/* Ultra-Light Frosted Glass Translucent Overlay across the whole page to expose artwork everywhere */}
      <div className="fixed inset-0 bg-white/35 backdrop-blur-[0.5px] -z-10 pointer-events-none" />

      <Header />

      {/* 1. Hero Section with Illustrated Dreamy Landscape & Playful Toys */}
      <section className="relative pt-12 pb-24 overflow-hidden">

        {/* Playful Floating Kids Toys Decor (Dino, Gator, Pear, Bear, Unicorn, Rocket) */}
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

            {/* Hero Mascot Champions Spotlight: Dino, Magma Apple, and Gator */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 py-2">
              {/* 1. Big Cheerful Dinosaur */}
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

              {/* 2. Fiery Magma Apple */}
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

              {/* 3. Big Clever Alligator */}
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

            {/* Trust Metrics Bar with Custom Illustrated SVGs */}
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

      {/* 2. Interactive Video Preview Section */}
      <section className="py-16 bg-white/60 border-y border-purple-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold text-purple-800 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-2">
              <DrmVideoShieldSvg className="w-5 h-5" />
              <span>معاينة المحاضرة والشرح التفاعلي</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              تجربة حية لمنصة البث والشرح الرقمي
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
              بث فيديو بتقنية HLS مع علامة مائية ديناميكية مخصصة لحماية المحتوى الرقمي وضمان سرعة العرض وجودته.
            </p>
          </div>

          <div className="rounded-3xl p-3 bg-gradient-to-tr from-purple-900 via-indigo-950 to-slate-900 shadow-2xl shadow-indigo-500/20 border-2 border-purple-500/30">
            <ProtectedVideoPlayer
              src={settings.heroVideoUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"}
              studentName={`طالب ${settings.academyNameArabic} (نموذج تجريبي)`}
              studentPhone={settings.whatsappNumber || "01020003000"}
              title="نموذج شرح تفاعلي — Phonics & Letters"
            />
          </div>
        </div>
      </section>

      {/* 2.5. Free Sample Lectures Carousel (المحاضرات المجانية) */}
      <section className="py-16 bg-gradient-to-b from-purple-50/50 to-white/60 border-y border-purple-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold text-purple-800 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span>المحاضرات المجانية — شاهد قبل ما تشترك</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              جرّب أسلوب الشرح التفاعلي مجاناً
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
              اختر أي محاضرة تجريبية من الأسفل وشاهد طريقة الشرح الممتعة والمبسطة قبل الاشتراك في الكورس.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {settings.sampleLectures?.map((lecture) => (
              <a
                key={lecture.id}
                href={lecture.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group modern-card overflow-hidden bg-white border-2 border-purple-100 hover:border-purple-300 shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={lecture.thumbnailUrl}
                    alt={lecture.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-purple-700 fill-purple-700 ms-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2 start-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                    {lecture.badgeText || "مجاني"}
                  </div>
                </div>
                <div className="p-3 text-right">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {lecture.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {lecture.description}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/student-register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-vibrant text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 hover:scale-[1.03] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              سجّل مجاناً وشاهد المزيد من المحاضرات
            </Link>
          </div>
        </div>
      </section>

      {/* 3. About Teacher Section with Colorful Badges */}
      <section id="about_section" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="modern-card p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border border-purple-200 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20">
            
            {/* Teacher Details */}
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-bold">
                <EliteLogoBadge className="w-5 h-5" />
                المشرف الأكاديمي وكبير معلمي اللغة الإنجليزية
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                مستر أحمد عبد الرحمن
              </h2>
              <div className="space-y-3.5 text-sm text-slate-600 leading-relaxed font-medium">
                <p className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-2 shrink-0 shadow-sm" />
                  <span><strong>بكالوريوس التربية واللغات، قسم اللغة الإنجليزية</strong> — خبرة تزيد عن 15 عاماً في تدريس وتأسيس المراحل الابتدائية ومدارس اللغات والتجريبي.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-sm" />
                  <span>حاصل على شهادات معتمدة في تدريس الصوتيات وطرق التدريس التفاعلية (Phonics & Interactive English Methodology).</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-sm" />
                  <span>مبتكر سلاسل الشرح التفاعلي وبنوك الأسئلة الذكية المطابقة لأحدث مواصفات مناهج وزارة التربية والتعليم واللغات (Connect & Connect Plus).</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 mt-2 shrink-0 shadow-sm" />
                  <span><strong>المشرف العام على أكاديمية إيليت:</strong> المنصة التعليمية الرائدة المتخصصة في تأسيس اللغة الإنجليزية للأطفال.</span>
                </p>
              </div>
            </div>

            {/* Teacher Card Profile */}
            <div className="lg:col-span-4 text-center p-7 rounded-3xl bg-white border-2 border-purple-200/80 shadow-lg space-y-4">
              <div className="w-28 h-28 rounded-3xl bg-gradient-vibrant text-white flex items-center justify-center text-3xl font-black mx-auto shadow-xl shadow-purple-500/25">
                EA
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">أ. أحمد عبد الرحمن</h3>
                <span className="text-xs text-purple-700 font-bold block mt-0.5">خبير تدريس وتأسيس اللغة الإنجليزية</span>
              </div>
              <div className="pt-3 border-t border-purple-100 flex items-center justify-around text-xs font-bold text-slate-700">
                <div>
                  <div className="font-black text-2xl text-purple-700">+15</div>
                  <div className="text-slate-500 font-medium text-[11px]">عاماً من الخبرة</div>
                </div>
                <div>
                  <div className="font-black text-2xl text-emerald-600">Grade 1-6</div>
                  <div className="text-slate-500 font-medium text-[11px]">المراحل التأسيسية</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Features Section with Illustrated SVGs */}
      <section id="features_section" className="py-20 bg-white/70 border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-14">
            <span className="text-xs font-bold text-purple-800 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200">
              مميزات منصة إيليت
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              بيئة تعليمية ممتعة تضمن تفوق البطل الصغير
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            
            <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-indigo-300">
              <PhonicsSpeechSvg className="w-14 h-14" />
              <h3 className="text-base font-extrabold text-slate-900">صوتيات Phonics ونطق سليم</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                تدريبات صوتية مسجلة ومباشرة تشجع الطالب على النطق والتحدث باللكنة الصحيحة بأسلوب كرتوني ممتع.
              </p>
            </div>

            <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-amber-100 hover:border-amber-300">
              <ExamQuizSheetSvg className="w-14 h-14" />
              <h3 className="text-base font-extrabold text-slate-900">اختبارات ذكية وتصحيح فوري</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                بنك أسئلة إلكتروني يقدم نتائج فورية ونقاط تقييم تعزز ثقة الطالب بنفسه ومستواه الدراسي.
              </p>
            </div>

            <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-blue-100 hover:border-blue-300">
              <WorksheetPdfSvg className="w-14 h-14" />
              <h3 className="text-base font-extrabold text-slate-900">مذكرات وتمارين شاملة PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                ملازم ملونة وواجبات منظمة تسهل على الطالب وولي الأمر المراجعة اليومية والتطبيق العملي.
              </p>
            </div>

            <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-emerald-100 hover:border-emerald-300">
              <WhatsAppBubbleSvg className="w-14 h-14" />
              <h3 className="text-base font-extrabold text-slate-900">تقارير واتساب لولي الأمر</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                إشعار تلقائي يصل ولي الأمر عبر واتساب بدرجات الطالب في الاختبارات ومستوى حضوره والتزامه.
              </p>
            </div>

            <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-orange-100 hover:border-orange-300">
              <EgyptianWalletSvg className="w-14 h-14" />
              <h3 className="text-base font-extrabold text-slate-900">طرق دفع مصرية مرنة</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                تفعيل فوري للاشتراكات عبر فودافون كاش، إنستاباي، كروت ميزة، أو المحافظ الإلكترونية بضغطة زر.
              </p>
            </div>

            <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-purple-100 hover:border-purple-300">
              <CenterVoucherCardSvg className="w-14 h-14" />
              <h3 className="text-base font-extrabold text-slate-900">كروت شحن السناتر والمكتبات</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                شحن فوري للكورسات باستخدام كروت الخدش المتاحة في السناتر والمكتبات المعتمدة دون الحاجة لبطاقات بنكية.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4.5. Honor Roll Section (لوحة الشرف للأبطال المتفوقين) */}
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

          {/* Interactive Grade Selector Tabs for Honor Board */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 max-w-full">
            {INITIAL_GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveHonorGrade(g.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

      {/* 4.8. Adventure Themed Quizzes Section (مغامرات الاختبارات السحرية للأطفال) */}
      <AdventureQuizzesSection />

      {/* 5. Courses & Grade Hierarchy Section */}
      <section id="courses_section" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-purple-800 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200">
                المراحل الدراسية والكورسات
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-2">
                اختر المرحلة التعليمية للبطل الصغير
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full">
              <button
                onClick={() => setActiveGradeFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeGradeFilter === "all"
                    ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20"
                    : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
                }`}
              >
                جميع الصفوف
              </button>
              {INITIAL_GRADES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGradeFilter(g.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeGradeFilter === g.slug
                      ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20"
                      : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  {g.titleEnglish} ({g.titleArabic})
                </button>
              ))}
            </div>
          </div>

          {/* Units Grid with Vibrant Price Tags & CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="modern-card overflow-hidden flex flex-col group bg-white border-2 border-purple-100 hover:border-purple-300 shadow-md"
              >
                {/* Thumbnail Header */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={unit.thumbnailUrl}
                    alt={unit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-purple-200 text-xs font-extrabold text-purple-700 shadow-sm">
                    {unit.gradeTitle}
                  </div>
                  <div className="absolute bottom-3 start-3 text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-xl shadow-md">
                    {unit.priceEgp} ج.م
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {unit.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold py-2.5 border-y border-purple-50">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      {unit.lessonsCount} محاضرات فيديو
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {unit.quizzesCount} اختبارات تفاعلية
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUnit(unit)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-vibrant hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <XpGemSvg className="w-4 h-4" />
                      اشتراك فوري ({unit.priceEgp} ج.م)
                    </button>
                    <Link
                      href={`/portal/learn/${unit.slug}`}
                      className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors"
                      title="عرض محتوى الوحدة"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Checkout Modal Trigger */}
      {selectedUnit && (
        <EgyptianCheckoutModal
          unit={selectedUnit}
          isOpen={!!selectedUnit}
          onClose={() => setSelectedUnit(null)}
          onSuccess={() => {
            alert("تم تسجيل طلب الاشتراك وتفعيله بنجاح!");
            setSelectedUnit(null);
          }}
        />
      )}

      <Footer 
        whatsappNumber={settings.whatsappNumber}
        hotlineNumber={settings.hotlineNumber}
        inquiriesNumber={settings.inquiriesNumber}
        academyName={settings.academyNameArabic}
        teacherName={settings.teacherNameEnglish}
      />
      <WhatsAppFloatingButton phoneNumber={settings.whatsappNumber} />
    </div>
  );
}
