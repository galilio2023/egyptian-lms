"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  EliteLogoBadge, 
  XpGemSvg,
  StudentRegisterPencilSvg,
  CurriculumBookSvg,
  ExamQuizSheetSvg,
  PhonicsSpeechSvg,
  CartoonMenuBurgerSvg,
  CartoonCloseCrossSvg
} from "@/components/ui/illustrated-icons";

interface HeaderProps {
  academyName?: string;
  teacherName?: string;
}

export function Header({
  academyName = "أكاديمية إيليت",
  teacherName = "Lead Instructor",
}: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
      isScrolled
        ? "bg-white/90 backdrop-blur-xl border-purple-200/80 shadow-[0_4px_24px_rgba(139,92,246,0.12)]"
        : "bg-white/40 backdrop-blur-md border-white/50 shadow-xs"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo - Bigger & Multi-layer SVG */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <EliteLogoBadge className="w-11 h-11 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-none">
                {academyName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-purple-700 font-bold mt-0.5">
                {teacherName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Clean, Balanced & Harmonized */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-bold text-slate-600 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-xs">
            <Link 
              href="/" 
              className="px-3.5 py-1.5 rounded-xl text-slate-900 bg-white shadow-xs transition-all font-black"
            >
              الرئيسية
            </Link>
            <Link 
              href="/#courses_section" 
              className="px-3.5 py-1.5 rounded-xl hover:text-purple-800 hover:bg-white/80 transition-all"
            >
              المراحل الدراسية
            </Link>
            <Link 
              href="/#adventure_quizzes" 
              className="px-3.5 py-1.5 rounded-xl hover:text-purple-800 hover:bg-white/80 transition-all"
            >
              الاختبارات الذكية
            </Link>
            <Link 
              href="/#honor_board" 
              className="px-3.5 py-1.5 rounded-xl hover:text-purple-800 hover:bg-white/80 transition-all"
            >
              لوحة الشرف
            </Link>
            <Link 
              href="/#about_section" 
              className="px-3.5 py-1.5 rounded-xl hover:text-purple-800 hover:bg-white/80 transition-all"
            >
              عن المحاضر
            </Link>
            <Link 
              href="/#features_section" 
              className="px-3.5 py-1.5 rounded-xl hover:text-purple-800 hover:bg-white/80 transition-all"
            >
              المميزات
            </Link>
          </nav>

          {/* Action CTAs: Unambiguous Hierarchy (1 Primary + 1 Clean Secondary) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Secondary: Text Login */}
            <Link
              href="/student-login"
              className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            >
              تسجيل الدخول
            </Link>
            
            {/* Primary CTA: Student Portal Gate */}
            <Link
              href="/portal/dashboard"
              className="px-4 py-2 rounded-2xl bg-gradient-vibrant hover:scale-105 active:scale-95 text-white flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all text-xs font-black"
              title="بوابة الطالب الذكية"
            >
              <XpGemSvg className="w-4 h-4 shrink-0" />
              <span>بوابة الطالب</span>
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-purple-50/80 hover:bg-purple-100 text-purple-800 transition-colors cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <CartoonCloseCrossSvg className="w-6 h-6" />
              ) : (
                <CartoonMenuBurgerSvg className="w-6 h-6" />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown with Playful Custom SVGs */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-6xl mx-3 sm:mx-6 lg:mx-auto mt-2 rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-purple-200 p-4 sm:p-5 space-y-3 shadow-2xl animate-in fade-in-50 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-bold text-slate-900 py-2 border-b border-purple-50"
          >
            <span>الرئيسية</span>
            <EliteLogoBadge className="w-6 h-6" />
          </Link>
          <Link
            href="/#courses_section"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-bold text-slate-700 py-2 border-b border-purple-50"
          >
            <span>المراحل الدراسية والكورسات</span>
            <CurriculumBookSvg className="w-6 h-6" />
          </Link>
          <Link
            href="/#adventure_quizzes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-black text-amber-700 py-2 border-b border-purple-50"
          >
            <span>مغامرات الاختبارات السحرية ✨</span>
            <ExamQuizSheetSvg className="w-6 h-6" />
          </Link>
          <Link
            href="/#honor_board"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-bold text-purple-800 py-2 border-b border-purple-50"
          >
            <span>لوحة الشرف للأبطال المتفوقين</span>
            <XpGemSvg className="w-6 h-6" />
          </Link>
          <Link
            href="/portal/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-black text-purple-700 py-2 border-b border-purple-50"
          >
            <span>بوابة الطالب الذكية</span>
            <XpGemSvg className="w-6 h-6" />
          </Link>
          <Link
            href="/#features_section"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-bold text-slate-700 py-2 border-b border-purple-50"
          >
            <span>مميزات المنصة الفائقة</span>
            <PhonicsSpeechSvg className="w-6 h-6" />
          </Link>
          <div className="pt-2 flex items-center gap-2">
            <Link
              href="/student-login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 rounded-2xl text-center font-bold text-slate-800 bg-purple-50 border border-purple-200 text-xs"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/student-register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2.5 rounded-2xl text-center font-black text-white bg-gradient-vibrant shadow-md shadow-purple-500/25 text-xs flex items-center justify-center gap-1.5"
            >
              <StudentRegisterPencilSvg className="w-4 h-4" />
              <span>حساب جديد ✨</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
