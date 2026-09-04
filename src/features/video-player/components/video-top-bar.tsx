"use client";

import { Sparkles, ShieldCheck } from "lucide-react";

interface VideoTopBarProps {
  title: string;
  visible: boolean;
}

export function VideoTopBar({ title, visible }: VideoTopBarProps) {
  return (
    <div
      className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-20 transition-opacity duration-300 pointer-events-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">{title}</h4>
          <span className="text-[10px] text-emerald-400 font-semibold">
            أكاديمية إيليت • بث HLS آمن ومحمي
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>DRM ACTIVE</span>
      </div>
    </div>
  );
}
