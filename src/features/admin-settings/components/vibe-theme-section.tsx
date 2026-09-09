"use client";

import { useState } from "react";
import { 
  Palette, 
  Sparkles, 
  RotateCcw, 
  ToyBrick, 
  Volume2, 
  LayoutTemplate, 
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Rocket,
  Compass,
  Layers,
  Eye
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ToyDinoDinoSvg, 
  ToyRocketShuttleSvg, 
  ToyPrincessUnicornSvg, 
  ToyMagmaAppleSvg
} from "@/components/ui/illustrated-icons";
import type { MockPlatformSettings } from "@/lib/db/mock-data";

interface VibeThemeSectionProps {
  settings: MockPlatformSettings;
  onChange: (field: keyof MockPlatformSettings, value: unknown) => void;
  onResetToStandard: () => void;
  isSaving?: boolean;
}

export function VibeThemeSection({
  settings,
  onChange,
  onResetToStandard,
  isSaving = false,
}: VibeThemeSectionProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "squads" | "backgrounds" | "cards">("presets");

  // 1. Eight Comprehensive Academy Presets
  const presets = [
    {
      id: "playful_kids",
      title: "أطفال ومرح 🧸",
      subtitle: "Playful Kids Foundation",
      description: "رسومات كرتونية كاملة، ألعاب هيرو طافية، شريط صوتي، وتدرجات ملونة للمراحل الابتدائية.",
      badge: "الافتراضي",
      toys: true,
      phonics: true,
      mascots: true,
      squad: "dino_safari" as const,
      palette: "purple" as const,
      cardVibe: "cartoon_playful" as const,
      bgStyle: "default_gradient" as const,
    },
    {
      id: "academic_elite",
      title: "أكاديمي ونخبة 🎓",
      subtitle: "Academic Elite Honors",
      description: "مظهر رسمي راقٍ باللون الكحلي والذهبي، إخفاء الألعاب، مناسب للشهادات والإعدادي والثانوي.",
      badge: "إعدادي وثانوي",
      toys: false,
      phonics: false,
      mascots: false,
      squad: "all_toys" as const,
      palette: "blue" as const,
      cardVibe: "sharp_luxury" as const,
      bgStyle: "academic_blue" as const,
    },
    {
      id: "modern_vibrant",
      title: "عصري وتفاعلي ⚡",
      subtitle: "Modern Vibrant Tech",
      description: "توهج زجاجي، ألوان نيون حيوية، تركيز على نقاط الـ XP والمنافسات مع رواد الفضاء.",
      badge: "عصري",
      toys: false,
      phonics: true,
      mascots: true,
      squad: "space_galaxy" as const,
      palette: "purple" as const,
      cardVibe: "glass_glow" as const,
      bgStyle: "warm_playful" as const,
    },
    {
      id: "science_stem",
      title: "علوم واستكشاف 🔬",
      subtitle: "STEM & Science Explorer",
      description: "طابع علمي استكشافي مع رواد الفضاء والزمرد المنعش لبيئة تعليمية محفزة للابتكار.",
      badge: "استكشاف علمي",
      toys: true,
      phonics: true,
      mascots: true,
      squad: "space_galaxy" as const,
      palette: "emerald" as const,
      cardVibe: "glass_glow" as const,
      bgStyle: "emerald_oasis" as const,
    },
    {
      id: "cyber_gamer",
      title: "ألعاب وتحديات 🎮",
      subtitle: "Gamified XP Arena",
      description: "أجواء حماسية تحول الدروس إلى مستويات لعب وجوائز مع أبطال الماجما والطاقة.",
      badge: "تحديات وجوائز",
      toys: true,
      phonics: true,
      mascots: true,
      squad: "magma_heroes" as const,
      palette: "amber" as const,
      cardVibe: "glass_glow" as const,
      bgStyle: "cosmic_purple" as const,
    },
    {
      id: "thanawya_prep",
      title: "ثانوية عامة ومتقدم 📚",
      subtitle: "High-School Intensive",
      description: "تصميم خالٍ من أي مشتتات للأطفال، منظم، بألوان رسمية مناسبة للمراجعات المكثفة.",
      badge: "ثانوي ومكثف",
      toys: false,
      phonics: false,
      mascots: false,
      squad: "all_toys" as const,
      palette: "blue" as const,
      cardVibe: "modern_flat" as const,
      bgStyle: "academic_blue" as const,
    },
    {
      id: "midnight_luxury",
      title: "أناقة ليلية داكنة 🌙",
      subtitle: "Midnight Sleek Luxury",
      description: "تصميم فخم مستوحى من الوضع الليلي والأرجواني الملكي مع كروت ذات توهج ناعم.",
      badge: "فخامة هادئة",
      toys: false,
      phonics: true,
      mascots: true,
      squad: "space_galaxy" as const,
      palette: "purple" as const,
      cardVibe: "glass_glow" as const,
      bgStyle: "cosmic_purple" as const,
    },
    {
      id: "minimal_clean",
      title: "هادئ وبسيط 🌿",
      subtitle: "Minimal Distraction-Free",
      description: "تصميم أبيض نظيف وناصع يركز بنسبة 100% على الكتب والفيديوهات والواجبات.",
      badge: "تركيز كامل",
      toys: false,
      phonics: false,
      mascots: false,
      squad: "all_toys" as const,
      palette: "emerald" as const,
      cardVibe: "soft_neumorphic" as const,
      bgStyle: "doodle_pattern" as const,
    },
  ];

  // 2. Five Toy & Mascot Squad Themes
  const toySquads = [
    {
      id: "dino_safari",
      title: "سفاري الداينو والتمساح 🦕🐊",
      members: "الديناصور داينو، تفاحة الماجما، وتمساح جيتور",
      desc: "طابع الغابة والمرح التأسيسي المحبب لطلاب الصفوف الأولى.",
      icon: "🦕",
    },
    {
      id: "space_galaxy",
      title: "رواد الفضاء والصواريخ 🚀⭐",
      members: "صاروخ الفضاء، نجم التفوق، وصقر المعرفة",
      desc: "طابع استكشاف الفضاء والعلوم والنجاح الأكاديمي السريع.",
      icon: "🚀",
    },
    {
      id: "magic_unicorns",
      title: "اليونيكورن والدبدوب السحري 🦄🧸",
      members: "اليونيكورن السحري، دبدوب تيدي، والكمثرى السعيدة",
      desc: "طابع الخيال اللطيف والألوان الباستيل المبهجة.",
      icon: "🦄",
    },
    {
      id: "magma_heroes",
      title: "أبطال الطاقة والماجما 🍎🔥",
      members: "تفاحة الماجما، سبايدر هيرو، ومكعبات التأسيس",
      desc: "طابع القوة والشجاعة والحماس الرياضي في إتقان الإنجليزية.",
      icon: "🔥",
    },
    {
      id: "all_toys",
      title: "مزيج شامل لكافة الألعاب 🎪✨",
      members: "تشكيلة متكاملة من كافة التمائم والمجسمات",
      desc: "العرض الكلاسيكي الكامل مع جميع كروت وشخصيات المنصة.",
      icon: "🎪",
    },
  ];

  // 3. Eight Background Styles
  const backgroundStyles = [
    { id: "default_gradient", label: "تدرج كرتوني مشرق 🌈", desc: "بنفسجي ووردي ناعم مع غلاف مريح", preview: "from-purple-200 via-pink-100 to-emerald-100" },
    { id: "warm_playful", label: "شروق عنبري دافئ ☀️", desc: "أصفر وعنبر دافئ حيوي ومبهج", preview: "from-amber-200 via-yellow-100 to-orange-100" },
    { id: "academic_blue", label: "أزرق ملكي أكاديمي 📘", desc: "كحلي وسماوي رسمي للشهادات", preview: "from-sky-200 via-indigo-100 to-blue-200" },
    { id: "cosmic_purple", label: "فضاء كوني ومجرات 🌌", desc: "بنفسجي ليلي عميق وهادئ", preview: "from-purple-300 via-fuchsia-200 to-indigo-300" },
    { id: "emerald_oasis", label: "واحة زمردية منعشة 🍃", desc: "نعناع وأخضر طبيعي مريح للعين", preview: "from-emerald-200 via-teal-100 to-green-100" },
    { id: "doodle_pattern", label: "نقشة تفاعلية هادئة 🎨", desc: "خلفية فاتحة بلمسات تفاعلية دقيقة", preview: "from-slate-100 via-purple-50 to-indigo-100" },
    { id: "sunset_rose", label: "غروب وردي ناعم 🌅", desc: "درجات الياقوت والوردي الهادئ", preview: "from-rose-200 via-pink-100 to-amber-100" },
    { id: "custom_image", label: "صورة أو بوستر مخصص 🖼️", desc: "رابط لصورة أو خلفية خاصة بالأكاديمية", preview: "from-slate-200 to-slate-400" },
  ];

  // 4. Five Card Elevation & Border Styles
  const cardStyles = [
    {
      id: "cartoon_playful",
      title: "كرتوني مرح (Playful Bubbly) 🎈",
      desc: "حواف دائرية كبيرة، ظلال ملونة عريضة، وحركات وتفاعل كرتوني.",
    },
    {
      id: "glass_glow",
      title: "توهج زجاجي (Glassmorphic Glow) 💎",
      desc: "خلفيات زجاجية نصف شفافة مع هالة توهج نيون محيطة بالكروت.",
    },
    {
      id: "modern_flat",
      title: "عصري ناصع (Clean Modern Flat) 📐",
      desc: "خطوط هندسية مسطحة أنيقة مع تركيز مباشر على محتوى الدرس.",
    },
    {
      id: "sharp_luxury",
      title: "إطار فاخر كلاسيكي (Sharp Luxury) 🏛️",
      desc: "أركان دقيقة وإطارات مميزة بلون ذهبي أو كحلي فاخر للشهادات.",
    },
    {
      id: "soft_neumorphic",
      title: "ظلال ناعمة هادئة (Soft Neumorphic) ☁️",
      desc: "تأثير عمق ملموس وظلال خفيفة ناعمة مريحة للقراءة الطويلة.",
    },
  ];

  // 5. Five Accent Color Palettes
  const colorPalettes = [
    { id: "purple", label: "البنفسجي الملكي 🟣", class: "bg-purple-600", border: "border-purple-300" },
    { id: "blue", label: "الأزرق المحيطي 🔵", class: "bg-blue-600", border: "border-blue-300" },
    { id: "emerald", label: "الأخضر الزمردي 🟢", class: "bg-emerald-600", border: "border-emerald-300" },
    { id: "amber", label: "العنبري الذهبي 🟠", class: "bg-amber-500", border: "border-amber-300" },
    { id: "rose", label: "الوردي الياقوتي 🔴", class: "bg-rose-500", border: "border-rose-300" },
  ];

  const handleApplyPreset = (preset: typeof presets[number]) => {
    onChange("themeVibe", preset.id);
    onChange("enableHeroToys", preset.toys);
    onChange("enableHeroPhonicsStrip", preset.phonics);
    onChange("enableMascotCards", preset.mascots);
    onChange("toySquad", preset.squad);
    onChange("accentColorPalette", preset.palette);
    onChange("cardVibeStyle", preset.cardVibe);
    onChange("backgroundStyle", preset.bgStyle);
  };

  return (
    <Card className="border-2 border-purple-100 shadow-sm relative overflow-hidden">
      {/* Header with Preset Quick Actions and Reset Button */}
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg text-slate-900">
                استوديو الهوية البصرية وطابع الأكاديمية (Vibe Studio)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                +30 خيار مخصص
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              تحكم كامل في القوالب الجاهزة، ألعاب الهيرو، فرق التمائم، خلفيات الموقع، وأنماط وتأثيرات الكروت.
            </p>
          </div>
        </div>

        {/* 1-Click Reset to Standard Defaults Trigger Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 text-xs font-bold gap-1.5 shrink-0 self-end sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الوضع القياسي الافتراضي</span>
        </Button>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* ================= LIVE INSTANT VIBE PREVIEW BOX ================= */}
        <div className="p-4 sm:p-5 rounded-3xl border-2 border-purple-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white shadow-xl space-y-3 relative overflow-hidden">
          {/* Glowing Aura Rings */}
          <div className="absolute top-0 end-0 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <Eye className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black text-white">معاينة حية فورية لطابع المنصة (Live Instant Vibe Preview)</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-purple-200">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20">
                القالب: {presets.find(p => p.id === settings.themeVibe)?.title || "أطفال ومرح 🧸"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20">
                الخلفية: {backgroundStyles.find(b => b.id === (settings.backgroundStyle || "default_gradient"))?.label || "تدرج كرتوني 🌈"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20">
                الكروت: {settings.cardVibeStyle || "cartoon_playful"}
              </span>
            </div>
          </div>

          {/* Mini Mock Hero Bar */}
          <div className="relative z-10 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center md:text-right w-full md:w-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-amber-300 border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>منهاج الأكاديمية الذكي 2026 - 2027</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white">
                {settings.academyNameArabic || "أكاديمية إيليت"} — {settings.teacherNameArabic || "المعلم المشرف"}
              </h4>
              <p className="text-[11px] text-slate-300 max-w-md leading-relaxed">
                {settings.enableHeroToys !== false 
                  ? "🦕 الألعاب التفاعلية مفعلة: الداينو، التمساح، ونطق Phonics الصوتي نشط." 
                  : "🎓 طابع أكاديمي هادئ ومركز: تم إخفاء الألعاب والتركيز على المنهج الأكاديمي."}
              </p>
            </div>

            {/* Mascot Squad Preview Badge */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 border border-white/20 shrink-0">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center p-1 shrink-0 drop-shadow-md">
                {settings.toySquad === "space_galaxy" ? (
                  <ToyRocketShuttleSvg className="w-full h-full" />
                ) : settings.toySquad === "magic_unicorns" ? (
                  <ToyPrincessUnicornSvg className="w-full h-full" />
                ) : settings.toySquad === "magma_heroes" ? (
                  <ToyMagmaAppleSvg className="w-full h-full" />
                ) : (
                  <ToyDinoDinoSvg className="w-full h-full" />
                )}
              </div>
              <div className="text-right text-[10px]">
                <span className="font-bold text-amber-300 block">فريق التميمة المختار:</span>
                <span className="text-white font-black block text-xs">
                  {toySquads.find(s => s.id === (settings.toySquad || "all_toys"))?.title || "سفاري الداينو 🦕"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs between Vibe Customization Layers */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "presets"
                ? "bg-white text-purple-900 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>القوالب والطوابع الجاهزة (8 Presets)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("squads")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "squads"
                ? "bg-white text-purple-900 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ToyBrick className="w-3.5 h-3.5 text-purple-600" />
            <span>فريق التمائم وألعاب الهيرو (Mascot Squads)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("backgrounds")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "backgrounds"
                ? "bg-white text-purple-900 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>خلفيات وتدرجات المنصة (8 Backgrounds)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cards")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "cards"
                ? "bg-white text-purple-900 shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>تأثيرات الكروت والألوان (Card Styles & Colors)</span>
          </button>
        </div>

        {/* ================= TAB 1: 8 THEME PRESETS ================= */}
        {activeTab === "presets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>اختر الطابع المتكامل لأكاديميتك بنقرة واحدة:</span>
              </label>
              <span className="text-[11px] text-slate-500">
                الحالي: <strong className="text-purple-700 font-bold">{presets.find(p => p.id === settings.themeVibe)?.title || "أطفال ومرح"}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {presets.map((p) => {
                const isSelected = settings.themeVibe === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className={`relative p-4 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between text-right w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/80 shadow-lg shadow-purple-500/15 scale-[1.02]"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900">{p.title}</span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-purple-700 font-bold block mb-1.5">
                        {p.subtitle}
                      </span>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-semibold w-full">
                      <span>الألعاب: {p.toys ? "مفعلة ✅" : "مخفية ⛔"}</span>
                      <span>الكروت: {p.cardVibe}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: TOY & MASCOT SQUADS ================= */}
        {activeTab === "squads" && (
          <div className="space-y-5">
            {/* Quick Switches */}
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
              <div className="flex items-center gap-2">
                <ToyBrick className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-black text-slate-900">
                  مفاتيح التحكم العامة في ألعاب وأصوات الهيرو
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <label htmlFor="toggle-hero-toys" className="flex items-center justify-between p-3 rounded-xl bg-white border border-purple-100 cursor-pointer hover:border-purple-300 transition-all">
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      مجسمات الألعاب الطافية 🦕
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ظهور الألعاب المتحركة في جوانب الهيرو
                    </span>
                  </div>
                  <input
                    id="toggle-hero-toys"
                    type="checkbox"
                    aria-label="مجسمات الألعاب الطافية"
                    checked={settings.enableHeroToys !== false}
                    onChange={(e) => onChange("enableHeroToys", e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                </label>

                <label htmlFor="toggle-phonics-strip" className="flex items-center justify-between p-3 rounded-xl bg-white border border-purple-100 cursor-pointer hover:border-purple-300 transition-all">
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>شريط النطق الصوتي 🔊</span>
                      <Volume2 className="w-3 h-3 text-purple-600" />
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      نطق الحروف والكلمات الإنجليزية Phonics
                    </span>
                  </div>
                  <input
                    id="toggle-phonics-strip"
                    type="checkbox"
                    aria-label="شريط النطق الصوتي"
                    checked={settings.enableHeroPhonicsStrip !== false}
                    onChange={(e) => onChange("enableHeroPhonicsStrip", e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                </label>

                <label htmlFor="toggle-mascot-cards" className="flex items-center justify-between p-3 rounded-xl bg-white border border-purple-100 cursor-pointer hover:border-purple-300 transition-all">
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      كروت أبطال التمائم الثلاثة 🏆
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      عرض كروت الأبطال المميزين أسفل العنوان
                    </span>
                  </div>
                  <input
                    id="toggle-mascot-cards"
                    type="checkbox"
                    aria-label="كروت أبطال التمائم الثلاثة"
                    checked={settings.enableMascotCards !== false}
                    onChange={(e) => onChange("enableMascotCards", e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Squad Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Rocket className="w-4 h-4 text-purple-600" />
                <span>اختر فريق التمائم والأبطال المعروض في الصفحة الرئيسية (Mascot Squads):</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {toySquads.map((squad) => {
                  const isSelected = (settings.toySquad || "all_toys") === squad.id;
                  return (
                    <button
                      type="button"
                      key={squad.id}
                      onClick={() => onChange("toySquad", squad.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-right w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/70 shadow-md shadow-purple-500/10"
                          : "border-slate-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <span>{squad.title}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-purple-700 font-bold mb-1">
                        {squad.members}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {squad.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 8 BACKGROUND STYLES ================= */}
        {activeTab === "backgrounds" && (
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-sky-600" />
              <span>اختر خلفية وتدرج الموقع العام (8 أنماط حصرية):</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {backgroundStyles.map((bg) => {
                const isSelected = (settings.backgroundStyle || "default_gradient") === bg.id;
                return (
                  <button
                    type="button"
                    key={bg.id}
                    onClick={() => onChange("backgroundStyle", bg.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-right w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isSelected
                        ? "border-purple-600 bg-white shadow-md shadow-purple-500/10"
                        : "border-slate-200 bg-white/80 hover:border-purple-300"
                    }`}
                  >
                    {/* Visual Color Bar Preview */}
                    <div className={`h-12 w-full rounded-xl mb-2.5 bg-gradient-to-r ${bg.preview} border border-slate-200/60 shadow-inner flex items-center justify-center text-xs`}>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-700" />}
                    </div>
                    <div className="text-xs font-bold text-slate-900">{bg.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{bg.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Image URL Field */}
            {settings.backgroundStyle === "custom_image" && (
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2 mt-2">
                <label htmlFor="customBackgroundUrl" className="text-xs font-bold text-slate-800 block">
                  رابط صورة الخلفية أو البوستر المخصص (URL):
                </label>
                <Input
                  id="customBackgroundUrl"
                  type="url"
                  dir="ltr"
                  placeholder="https://example.com/images/academy-hero-bg.jpg"
                  value={settings.customBackgroundUrl || ""}
                  onChange={(e) => onChange("customBackgroundUrl", e.target.value)}
                  className="bg-white border-purple-200 text-xs font-medium text-left"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  💡 نصيحة: يمكنك وضع رابط صورة حائط تعليمي، أو صورة الأكاديمية والمقر، وستظهر بانسيابية كخلفية ناعمة مع طبقة بلور جمالية.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: CARD STYLES & COLOR ACCENTS ================= */}
        {activeTab === "cards" && (
          <div className="space-y-6">
            {/* Card Elevation & Border Style */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4 text-purple-600" />
                <span>نمط وتصميم البطاقات والكروت (Card Vibe Style):</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {cardStyles.map((cs) => {
                  const isSelected = (settings.cardVibeStyle || "cartoon_playful") === cs.id;
                  return (
                    <button
                      type="button"
                      key={cs.id}
                      onClick={() => onChange("cardVibeStyle", cs.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-right flex flex-col justify-between w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/70 shadow-sm"
                          : "border-slate-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{cs.title}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          {cs.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-500" />
                <span>لوحة الألوان الأساسية للمنصة (Accent Color Palette):</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {colorPalettes.map((cp) => {
                  const isSelected = (settings.accentColorPalette || "purple") === cp.id;
                  return (
                    <button
                      type="button"
                      key={cp.id}
                      onClick={() => onChange("accentColorPalette", cp.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/50 shadow-sm font-black"
                          : "border-slate-200 bg-white hover:border-purple-300 font-bold"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${cp.class} shadow-sm shrink-0`} />
                      <span className="text-xs text-slate-800">{cp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Safety Confirmation Modal for Resetting to Standard Defaults */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-red-100 text-right space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                تأكيد استعادة الإعدادات القياسية الافتراضية؟
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                سيتم استرجاع كافة الإعدادات البصرية، ألعاب الهيرو، فرق التمائم، الخلفيات، أسماء المنصة، وأرقام التواصل الافتراضية للوضع القياسي المعتمد.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="danger"
                className="flex-1 font-bold text-xs"
                disabled={isSaving}
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetToStandard();
                }}
              >
                <RotateCcw className="w-4 h-4 me-1" />
                <span>نعم، استعادة الآن</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex-1 font-bold text-xs"
                onClick={() => setShowResetConfirm(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
