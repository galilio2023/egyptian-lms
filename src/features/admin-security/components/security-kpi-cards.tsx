"use client";

import React from "react";
import { ShieldCheck, Lock, Smartphone, Ticket } from "lucide-react";
import type { SecurityAuditRecord } from "../types";

export interface SecurityKpiCardsProps {
  logs: SecurityAuditRecord[];
}

export const SecurityKpiCards: React.FC<SecurityKpiCardsProps> = ({ logs }) => {
  const rateLimitEvents = logs.filter((l) => l.eventType.includes("rate_limit")).length;
  const deviceEvents = logs.filter((l) => l.eventType.includes("device")).length;
  const voucherEvents = logs.filter((l) => l.eventType.includes("voucher")).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="modern-card p-4 bg-white/95 border border-purple-100 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
          <span>إجمالي الأحداث المسجلة</span>
          <ShieldCheck className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-2xl font-black text-slate-900">{logs.length}</div>
        <span className="text-[10px] text-purple-600 font-semibold mt-1 block">محفوظة في سجل الرقابة</span>
      </div>

      <div className="modern-card p-4 bg-white/95 border border-rose-100 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between text-rose-600 text-xs font-bold mb-2">
          <span>تجاوز معدل الطلب (Rate Limit)</span>
          <Lock className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-black text-rose-700">{rateLimitEvents}</div>
        <span className="text-[10px] text-rose-600 font-semibold mt-1 block">تم حجبهم تلقائياً</span>
      </div>

      <div className="modern-card p-4 bg-white/95 border border-amber-100 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-2">
          <span>محاولات قفل ونقل الأجهزة</span>
          <Smartphone className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-black text-amber-800">{deviceEvents}</div>
        <span className="text-[10px] text-amber-600 font-semibold mt-1 block">حماية لمنع مشاركة الحسابات</span>
      </div>

      <div className="modern-card p-4 bg-white/95 border border-teal-100 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between text-teal-700 text-xs font-bold mb-2">
          <span>محاولات شحن الكروت</span>
          <Ticket className="w-4 h-4 text-teal-500" />
        </div>
        <div className="text-2xl font-black text-teal-800">{voucherEvents}</div>
        <span className="text-[10px] text-teal-600 font-semibold mt-1 block">ناجحة وفاشلة تحت الرصد</span>
      </div>
    </div>
  );
};
