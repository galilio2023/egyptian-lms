"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { INITIAL_GRADES, INITIAL_ORDERS } from "@/lib/db/mock-data";
import { 
  UsersGraduationSvg, 
  EgyptianWalletSvg, 
  CurriculumBookSvg, 
  CenterVoucherCardSvg, 
  ChampionCupSvg 
} from "@/components/ui/illustrated-icons";

export default function AdminOverviewPage() {
  const [pendingOrders, setPendingOrders] = useState(INITIAL_ORDERS.filter((o) => o.status === "manual_review"));
  const [stats, setStats] = useState<{
    totalStudents: number;
    totalUnits: number;
    pendingOrders: number;
    totalRevenueEgp: number;
  }>({
    totalStudents: 3050,
    totalUnits: 28,
    pendingOrders: 2,
    totalRevenueEgp: 762500,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/admin/actions?type=overview")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.overview) {
          setStats(data.overview);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            لوحة قيادة الأكاديمية <span className="text-gradient-purple">(Dashboard)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            متابعة فورية للطلاب، الاشتراكات الجديدة، وإيصالات التحويل عبر إنستاباي وفودافون كاش.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <EgyptianWalletSvg className="w-5 h-5" />
            <span>مراجعة الإيصالات ({pendingOrders.length} معلق)</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="modern-card p-5 bg-white/95 backdrop-blur-md border-2 border-purple-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>إجمالي الطلاب المسجلين</span>
            <UsersGraduationSvg className="w-7 h-7" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalStudents.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>طلاب مسجلين ومفعلين</span>
          </div>
        </div>

        <div className="modern-card p-5 bg-white/95 backdrop-blur-md border-2 border-emerald-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>إجمالي الإيرادات (ج.م)</span>
            <EgyptianWalletSvg className="w-7 h-7" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{stats.totalRevenueEgp.toLocaleString()} ج.م</div>
          <div className="text-[10px] text-slate-400 font-medium">
            مقسمة بين فودافون كاش وإنستاباي وباي موب
          </div>
        </div>

        <div className="modern-card p-5 bg-white/95 backdrop-blur-md border-2 border-amber-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>إيصالات إنستاباي المعلقة</span>
            <CenterVoucherCardSvg className="w-7 h-7" />
          </div>
          <div className="text-3xl font-black text-amber-600">{stats.pendingOrders}</div>
          <div className="text-[10px] text-slate-400 font-medium">
            بانتظار مراجعة وتأكيد السكرتارية
          </div>
        </div>

        <div className="modern-card p-5 bg-white/95 backdrop-blur-md border-2 border-indigo-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>المراحل والوحدات المفعلة</span>
            <CurriculumBookSvg className="w-7 h-7" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalUnits} وحدة</div>
          <div className="text-[10px] text-slate-400 font-medium">
            متاحة للدراسة والاختبارات
          </div>
        </div>

      </div>

      {/* Pending InstaPay Review Callout */}
      {pendingOrders.length > 0 && (
        <div className="modern-card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <EgyptianWalletSvg className="w-10 h-10 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-sm font-black text-amber-950 block">
                تنبيه: يوجد {pendingOrders.length} طلبات اشتراك تحتاج موافقة وتفعيل فوري
              </span>
              <p className="text-xs text-amber-800 font-medium">
                قام أولياء الأمور بتحويل المبلغ عبر إنستاباي / فودافون كاش وإرفاق الإيصالات. اضغط لمراجعتها والتفعيل بضغطة زر.
              </p>
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/25 shrink-0 transition-all"
          >
            الانتقال لصفحة الإيصالات
          </Link>
        </div>
      )}

      {/* Grade Quick View */}
      <div className="modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-purple-100 space-y-4 shadow-sm">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <ChampionCupSvg className="w-5 h-5" />
          <span>المراحل الدراسية والصفوف المعتمدة</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {INITIAL_GRADES.map((g) => (
            <div key={g.id} className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-center space-y-1">
              <span className="font-black text-xs text-purple-900 block">{g.titleEnglish}</span>
              <span className="text-[11px] text-purple-600 font-bold block">{g.titleArabic}</span>
              <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                متاح ونشط
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
