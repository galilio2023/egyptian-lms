import React from "react";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50/60 via-white to-purple-50/40 flex items-center justify-center p-4">
      <div className="text-center space-y-4 relative">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Animated Brand Logo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto animate-bounce-slow drop-shadow-xl">
          <EliteLogoBadge className="w-full h-full" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            أكاديمية <span className="text-gradient-purple">إيليت</span> التعليمية
          </h3>
          <p className="text-xs sm:text-sm font-bold text-purple-700 animate-pulse">
            جاري تجهيز المنصة التعليمية للأبطال... 🌟
          </p>
        </div>
      </div>
    </div>
  );
}
