"use client";

import React from "react";
import { ShieldCheck, Lock, Smartphone, Ticket } from "lucide-react";
import { StatCard } from "@/components/shared";
import type { SecurityAuditRecord } from "../types";

export interface SecurityKpiCardsProps {
  logs: SecurityAuditRecord[];
}

export const SecurityKpiCards: React.FC<SecurityKpiCardsProps> = ({ logs }) => {
  const rateLimitEvents = logs.filter((l) => l.eventType.includes("rate_limit")).length;
  const deviceEvents = logs.filter((l) => l.eventType.includes("device")).length;
  const voucherEvents = logs.filter((l) => l.eventType.includes("voucher")).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="إجمالي الأحداث المسجلة"
        value={logs.length}
        icon={<ShieldCheck className="w-5 h-5" />}
        variant="purple"
        description="محفوظة في سجل الرقابة والأمان"
      />

      <StatCard
        title="تجاوز معدل الطلب (Rate Limit)"
        value={rateLimitEvents}
        icon={<Lock className="w-5 h-5" />}
        variant="rose"
        description="تم حجبهم تلقائياً من الفايروول"
      />

      <StatCard
        title="محاولات قفل ونقل الأجهزة"
        value={deviceEvents}
        icon={<Smartphone className="w-5 h-5" />}
        variant="amber"
        description="حماية لمنع مشاركة الحسابات"
      />

      <StatCard
        title="محاولات شحن الكروت"
        value={voucherEvents}
        icon={<Ticket className="w-5 h-5" />}
        variant="teal"
        description="ناجحة وفاشلة تحت الرصد"
      />
    </div>
  );
};
