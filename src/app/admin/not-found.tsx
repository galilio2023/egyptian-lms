"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  Settings, 
  ArrowRight, 
  RotateCcw,
  ShieldAlert
} from "lucide-react";
import { AdminShield404Svg } from "@/components/ui/not-found-illustrations";

const ADMIN_SHORTCUTS = [
  {
    href: "/admin",
    title: "لوحة القيادة العامة",
    subtitle: "الإحصائيات ونشاط المنصة اليومي",
    icon: LayoutDashboard,
    gradient: "from-purple-600 to-indigo-600",
  },
  {
    href: "/admin/students",
    title: "سجل الطلاب والمشتركين",
    subtitle: "إدارة الحسابات، الأجهزة، ونقاط XP",
    icon: Users,
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    href: "/admin/curriculum",
    title: "المناهج والوحدات الدراسية",
    subtitle: "إدارة الدروس والفيديوهات والملفات",
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    href: "/admin/orders",
    title: "الطلبات والمدفوعات",
    subtitle: "إيصالات التحويل وكروت شحن السنتر",
    icon: CreditCard,
    gradient: "from-emerald-600 to-teal-600",
  },
];

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
      {/* 1. Subtle High-Tech Blueprint Grids & Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-10 start-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 end-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Top Bar */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all hover:scale-105"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>لوحة التحكم الإدارية</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/admin");
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-bold backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-purple-300" />
          <span>الرجوع للقسم السابق</span>
        </button>
      </header>

      {/* 3. Main Center Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center space-y-6 my-auto">
        {/* Radar & Shield Blueprint SVG */}
        <div className="relative inline-block mx-auto animate-float-slow">
          <AdminShield404Svg className="w-56 h-48 sm:w-64 sm:h-56 mx-auto drop-shadow-2xl" />
        </div>

        {/* Headings */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-black shadow-inner">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>خطأ إداري 404 • سجل غير متوفر</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            عفواً! الصفحة أو السجل الإداري غير موجود 📋🔍
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-medium leading-relaxed">
            لم نتمكن من العثور على السجل المطلوب (طالب، وحدة دراسية، واجب، أو إعدادات). قد يكون تم حذفه أو أن الرابط غير صحيح.
          </p>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-right">
          {ADMIN_SHORTCUTS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 backdrop-blur-md shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {card.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Platform Settings Link */}
        <div className="pt-2">
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span>تعديل إعدادات وهوية المنصة</span>
          </Link>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="relative z-10 text-center py-5 text-[11px] text-slate-500 font-mono">
        Admin Gateway • Status Code 404 (Resource Not Found)
      </footer>
    </div>
  );
}
