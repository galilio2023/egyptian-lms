import React from "react";
import { Sparkles, Trophy } from "lucide-react";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";

export default function PortalLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm mx-auto p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-purple-100 shadow-lg relative">
        <div className="w-16 h-16 mx-auto relative animate-bounce-slow">
          <EliteLogoBadge className="w-full h-full drop-shadow-md" />
          <div className="absolute -bottom-1 -end-1 w-6 h-6 rounded-full bg-amber-400 text-purple-950 flex items-center justify-center shadow-md">
            <Trophy className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>بوابة الأبطال الذكية</span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            جاري تحضير الدرس ومكافآت الـ XP... 🚀
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            استعد للمغامرة التعليمية الشيقة!
          </p>
        </div>
      </div>
    </div>
  );
}
