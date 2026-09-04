"use client";

import React from "react";
import { 
  UsersGraduationSvg, 
  EgyptianWalletSvg, 
  CurriculumBookSvg, 
  CenterVoucherCardSvg 
} from "@/components/ui/illustrated-icons";
import { StatCard } from "@/components/shared";

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
      <StatCard
        title="إجمالي الطلاب المسجلين"
        value={stats.totalStudents.toLocaleString()}
        icon={<UsersGraduationSvg className="w-7 h-7" />}
        variant="purple"
        trend={{ value: "طلاب مسجلين ومفعلين", positive: true }}
      />

      <StatCard
        title="إجمالي الإيرادات (ج.م)"
        value={`${stats.totalRevenueEgp.toLocaleString()} ج.م`}
        icon={<EgyptianWalletSvg className="w-7 h-7" />}
        variant="emerald"
        description="مقسمة بين فودافون كاش وإنستاباي وباي موب"
      />

      <StatCard
        title="إيصالات إنستاباي المعلقة"
        value={stats.pendingOrders}
        icon={<CenterVoucherCardSvg className="w-7 h-7" />}
        variant="amber"
        description="بانتظار مراجعة وتأكيد السكرتارية"
      />

      <StatCard
        title="المراحل والوحدات المفعلة"
        value={`${stats.totalUnits} وحدة`}
        icon={<CurriculumBookSvg className="w-7 h-7" />}
        variant="indigo"
        description="متاحة للدراسة والاختبارات"
      />
    </div>
  );
}
