"use client";

import { TrendingUp } from "lucide-react";
import { 
  UsersGraduationSvg, 
  EgyptianWalletSvg, 
  CurriculumBookSvg, 
  CenterVoucherCardSvg 
} from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";

interface OverviewKpiCardsProps {
  stats: {
    totalStudents: number;
    totalUnits: number;
    pendingOrders: number;
    totalRevenueEgp: number;
  };
}

export function OverviewKpiCards({ stats }: OverviewKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Students */}
      <Card className="p-5 border-2 border-purple-100 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
          <span>إجمالي الطلاب المسجلين</span>
          <UsersGraduationSvg className="w-7 h-7" />
        </div>
        <div className="text-3xl font-black text-slate-900">
          {stats.totalStudents.toLocaleString()}
        </div>
        <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>طلاب مسجلين ومفعلين</span>
        </div>
      </Card>

      {/* Revenue */}
      <Card className="p-5 border-2 border-emerald-100 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
          <span>إجمالي الإيرادات (ج.م)</span>
          <EgyptianWalletSvg className="w-7 h-7" />
        </div>
        <div className="text-3xl font-black text-emerald-700">
          {stats.totalRevenueEgp.toLocaleString()} ج.م
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          مقسمة بين فودافون كاش وإنستاباي وباي موب
        </div>
      </Card>

      {/* Pending Reviews */}
      <Card className="p-5 border-2 border-amber-100 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
          <span>إيصالات إنستاباي المعلقة</span>
          <CenterVoucherCardSvg className="w-7 h-7" />
        </div>
        <div className="text-3xl font-black text-amber-600">
          {stats.pendingOrders}
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          بانتظار مراجعة وتأكيد السكرتارية
        </div>
      </Card>

      {/* Curriculum Units */}
      <Card className="p-5 border-2 border-indigo-100 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
          <span>المراحل والوحدات المفعلة</span>
          <CurriculumBookSvg className="w-7 h-7" />
        </div>
        <div className="text-3xl font-black text-slate-900">
          {stats.totalUnits} وحدة
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          متاحة للدراسة والاختبارات
        </div>
      </Card>
    </div>
  );
}
