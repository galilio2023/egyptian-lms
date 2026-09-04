"use client";

import React from "react";
import { Radio, Video, CheckCircle2 } from "lucide-react";
import type { MockLiveSession } from "../types";

export interface LiveSessionsStatsProps {
  sessions: MockLiveSession[];
}

export const LiveSessionsStats: React.FC<LiveSessionsStatsProps> = ({ sessions }) => {
  const isAnyLive = sessions.some((s) => s.isLiveNow);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="modern-card p-6 bg-gradient-vibrant text-white border-0 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full border border-white/30">
            حالة البث المباشر
          </span>
          <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
        </div>
        <div className="text-3xl font-black">
          {isAnyLive ? "🔴 بث مباشر نشط الآن" : "⏸️ لا يوجد بث حالياً"}
        </div>
        <p className="text-xs text-purple-100 font-medium">
          تنبيه فوري يظهر في لوحة تحكم الطالب عند بدء الحصة للالتحاق بضغطة زر.
        </p>
      </div>

      <div className="modern-card p-6 bg-white/95 border border-purple-100 shadow-sm flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400">إجمالي الحصص المجدولة</span>
          <div className="text-3xl font-black text-slate-900">{sessions.length} حصة</div>
        </div>
        <div className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 mt-3 inline-block w-fit">
          📅 تشمل مراجعات شهور أكتوبر ونوفمبر ونصف العام
        </div>
      </div>

      <div className="modern-card p-6 bg-white/95 border border-purple-100 shadow-sm flex flex-col justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400">منصة الاجتماعات المعتمدة</span>
          <div className="text-2xl font-black text-indigo-700 flex items-center gap-2">
            <Video className="w-6 h-6" />
            <span>Zoom & WebRTC</span>
          </div>
        </div>
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 mt-3 flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>حماية كلمة المرور لمنع المتطفلين</span>
        </div>
      </div>
    </div>
  );
};
