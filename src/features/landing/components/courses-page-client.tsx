"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Sparkles, Filter, CheckCircle2, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/layout/whatsapp-floating-btn";
import { EgyptianCheckoutModal } from "@/features/checkout";
import { UnitCard } from "@/entities/unit";
import { INITIAL_GRADES, type MockUnit, type MockPlatformSettings } from "@/lib/db/mock-data";
import { CurriculumBookSvg, XpGemSvg } from "@/components/ui/illustrated-icons";

interface CoursesPageClientProps {
  initialUnits: MockUnit[];
  initialSettings: MockPlatformSettings;
}

export function CoursesPageClient({ initialUnits, initialSettings }: CoursesPageClientProps) {
  const [selectedUnit, setSelectedUnit] = useState<MockUnit | null>(null);
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [units] = useState<MockUnit[]>(initialUnits);
  const [settings] = useState<MockPlatformSettings>(initialSettings);

  const filteredUnits = units.filter((u) => {
    const matchesGrade = activeGradeFilter === "all" || u.gradeSlug === activeGradeFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.description && u.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.gradeTitle && u.gradeTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-purple-50/50 via-white to-purple-50/30 text-slate-900 font-sans selection:bg-purple-500 selection:text-white">
      <Header
        academyName={settings.academyNameArabic}
        teacherName={settings.teacherNameArabic}
      />

      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="relative overflow-hidden py-14 sm:py-18 bg-linear-to-b from-purple-100/60 via-purple-50/30 to-white border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black shadow-2xs">
              <CurriculumBookSvg className="w-4 h-4" />
              <span>دليل المناهج الدراسية الشامل — Connect & Connect Plus</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              استكشف جميع <span className="text-gradient-purple">المناهج والصفوف الدراسية</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
              شرح تفاعلي لكافة وحدات اللغة الإنجليزية للمرحلة الابتدائية من الصف الأول إلى السادس الابتدائي بأسلوب كارتوني مبسط وتقنيات الذكاء الاصطناعي.
            </p>

            {/* Quick Stats Bar */}
            <div className="pt-2 flex items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>6 صفوف دراسية معتمدة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>شرح فيديو عالي الجودة DRM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>تصحيح واجبات واختبارات ذكية</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Search Toolbar */}
        <section className="py-8 border-b border-purple-100/70 bg-white/70 backdrop-blur-md sticky top-16 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                <input
                  type="text"
                  placeholder="ابحث عن وحدة أو موضوع درس..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs font-bold focus:outline-none focus:border-purple-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Grades Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar w-full md:w-auto">
                <button
                  onClick={() => setActiveGradeFilter("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeGradeFilter === "all"
                      ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20 scale-105"
                      : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  جميع الصفوف ({units.length})
                </button>
                {INITIAL_GRADES.map((g) => {
                  const countInGrade = units.filter((u) => u.gradeSlug === g.slug).length;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setActiveGradeFilter(g.slug)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeGradeFilter === g.slug
                          ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20 scale-105"
                          : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
                      }`}
                    >
                      {g.titleEnglish} {countInGrade > 0 ? `(${countInGrade})` : ""}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* Courses Catalog Grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header info */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-bold text-slate-500">
                يتم عرض <strong className="text-purple-700">{filteredUnits.length}</strong> وحدة دراسية
              </span>
              <Link
                href="/quizzes"
                className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1"
              >
                <span>جرب التحديات التفاعلية</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {filteredUnits.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-purple-200 shadow-sm space-y-3">
                <BookOpen className="w-12 h-12 text-purple-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">لا توجد وحدات تطابق بحثك</h3>
                <p className="text-xs text-slate-500">جرب تغيير كلمة البحث أو اختيار صف دراسي آخر.</p>
                <button
                  onClick={() => {
                    setActiveGradeFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-2 px-4 py-2 bg-purple-100 text-purple-800 font-bold rounded-xl text-xs hover:bg-purple-200 transition-colors"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredUnits.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    variant="catalog"
                    onEnroll={(u) => setSelectedUnit(u)}
                    ctaText={`اشتراك فوري (${unit.priceEgp} ج.م)`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* What's Included Banner */}
        <section className="py-14 bg-purple-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold inline-block">
                  ماذا يحصل الطالب مع كل كورس؟
                </span>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                  تجربة تعليمية متكاملة تضمن أعلى الدرجات والتفوق
                </h2>
                <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-medium">
                  نظام تعليمي متكامل صُمم خصيصاً لأبطال المرحلة الابتدائية يجمع بين المتعة البصرية وتأسيس القواعد والصوتيات.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>فيديوهات كارتونية بصرية ممتعة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>معمل فونكس لنطق الكلمات بالذكاء الاصطناعي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تصحيح واجبات كشكول الطالب بالقلم الرقمي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>شهادات تقدير معتمدة قابلة للطباعة</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center space-y-4">
                <XpGemSvg className="w-16 h-16 mx-auto" />
                <h3 className="text-xl font-black">جاهز لبدء رحلة التميز؟</h3>
                <p className="text-xs text-purple-200 font-medium">
                  سجل حسابك الآن واحصل على اختبارات مجانية ونقاط تفوق فورية في لوحة الشرف.
                </p>
                <Link
                  href="/student-register"
                  className="inline-block w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/30"
                >
                  إنشاء حساب طالب مجاناً الآن
                </Link>
              </div>
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

      {/* Egyptian Checkout Modal */}
      {selectedUnit && (
        <EgyptianCheckoutModal
          unit={selectedUnit}
          isOpen={!!selectedUnit}
          onClose={() => setSelectedUnit(null)}
          vodafoneCashNumber={settings.vodafoneCashNumber}
          instapayAddress={settings.instapayAddress}
        />
      )}
    </div>
  );
}
