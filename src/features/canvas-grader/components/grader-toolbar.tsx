"use client";

import { 
  Check, 
  X, 
  Star, 
  RotateCcw, 
  Eraser, 
  Highlighter, 
  PenTool 
} from "lucide-react";
import type { ToolType } from "../types";

interface GraderToolbarProps {
  currentTool: ToolType;
  brushColor: string;
  onSelectPen: (color: string, size: number) => void;
  onSelectTool: (tool: ToolType) => void;
  onUndo: () => void;
  onClear: () => void;
}

export function GraderToolbar({
  currentTool,
  brushColor,
  onSelectPen,
  onSelectTool,
  onUndo,
  onClear,
}: GraderToolbarProps) {
  return (
    <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
        {/* Red Pen */}
        <button
          type="button"
          onClick={() => onSelectPen("#dc2626", 4)}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            currentTool === "pen" && brushColor === "#dc2626"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
              : "text-slate-300 hover:bg-slate-700"
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>القلم الأحمر</span>
        </button>

        {/* Highlighter */}
        <button
          type="button"
          onClick={() => onSelectTool("highlighter")}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            currentTool === "highlighter"
              ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/30"
              : "text-slate-300 hover:bg-slate-700"
          }`}
        >
          <Highlighter className="w-3.5 h-3.5" />
          <span>تحديد فسفوري</span>
        </button>

        {/* Check Stamp */}
        <button
          type="button"
          onClick={() => onSelectTool("check")}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
            currentTool === "check"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "text-emerald-400 hover:bg-slate-700"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>ختم ✓ ممتاز</span>
        </button>

        {/* Cross Stamp */}
        <button
          type="button"
          onClick={() => onSelectTool("cross")}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
            currentTool === "cross"
              ? "bg-rose-700 text-white shadow-md shadow-rose-700/30"
              : "text-rose-400 hover:bg-slate-700"
          }`}
        >
          <X className="w-3.5 h-3.5" />
          <span>ختم ✗ خطأ</span>
        </button>

        {/* Star Stamp */}
        <button
          type="button"
          onClick={() => onSelectTool("star")}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
            currentTool === "star"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
              : "text-amber-400 hover:bg-slate-700"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>⭐ 10/10</span>
        </button>

        {/* Eraser */}
        <button
          type="button"
          onClick={() => onSelectTool("eraser")}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            currentTool === "eraser"
              ? "bg-slate-600 text-white"
              : "text-slate-400 hover:bg-slate-700"
          }`}
          title="ممحاة"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* Undo & Clear */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onUndo}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تراجع خطوة</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-rose-300 font-medium cursor-pointer"
        >
          مسح كل العلامات
        </button>
      </div>
    </div>
  );
}
