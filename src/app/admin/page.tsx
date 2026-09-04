"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { EgyptianWalletSvg } from "@/components/ui/illustrated-icons";
import { INITIAL_ORDERS } from "@/lib/db/mock-data";
import {
  OverviewKpiCards,
  PendingOrdersCallout,
  GradesQuickGrid,
} from "@/features/admin-overview";

export default function AdminOverviewPage() {
  const [pendingOrders] = useState(() =>
    INITIAL_ORDERS.filter((o) => o.status === "manual_review")
  );
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
      <AdminPageHeader
        title="لوحة قيادة الأكاديمية (Dashboard)"
        description="متابعة فورية للطلاب، الاشتراكات الجديدة، وإيصالات التحويل عبر إنستاباي وفودافون كاش."
        actions={
          <Link
            href="/admin/orders"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <EgyptianWalletSvg className="w-5 h-5" />
            <span>مراجعة الإيصالات ({pendingOrders.length} معلق)</span>
          </Link>
        }
      />

      {/* KPI Stats Grid */}
      <OverviewKpiCards stats={stats} />

      {/* Pending InstaPay Review Callout */}
      <PendingOrdersCallout pendingCount={pendingOrders.length} />

      {/* Grade Quick View */}
      <GradesQuickGrid />
    </div>
  );
}
