"use client";

import { ShieldCheck } from "lucide-react";

interface WindowBlurShieldProps {
  visible: boolean;
  onResume: () => void;
}

export function WindowBlurShield({ visible, onResume }: WindowBlurShieldProps) {
  if (!visible) return null;

  return (
    <div
      onClick={onResume}
      className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl z-40 flex flex-col items-center justify-center p-6 text-center space-y-4 cursor-pointer animate-in fade-in duration-200"
    >
      <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
        <ShieldCheck className="w-8 h-8" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-black text-white">المحاضرة محمية بنظام DRM</h3>
        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          تم إيقاف تشغيل المحاضرة مؤقتاً لمغادرة النافذة أو تفعيل برنامج خارجي. اضغط هنا للاستئناف.
        </p>
      </div>
      <button
        type="button"
        className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
      >
        استئناف المشاهدة الآن ▶
      </button>
    </div>
  );
}
