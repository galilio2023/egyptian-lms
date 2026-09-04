"use client";

import { BookmarkCheck } from "lucide-react";

interface ResumePlaybackToastProps {
  savedTime: number | null;
  isPlaying: boolean;
  onResume: () => void;
  onDismiss: () => void;
}

function formatTime(secs: number) {
  const mins = Math.floor(secs / 60);
  const remainder = Math.floor(secs % 60);
  return `${mins}:${remainder.toString().padStart(2, "0")}`;
}

export function ResumePlaybackToast({
  savedTime,
  isPlaying,
  onResume,
  onDismiss,
}: ResumePlaybackToastProps) {
  if (!savedTime || isPlaying) return null;

  return (
    <div className="absolute top-16 start-4 z-30 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
        <BookmarkCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-medium">
          توقفت سابقاً عند <strong className="font-mono text-amber-300">{formatTime(savedTime)}</strong>
        </span>
        <button
          type="button"
          onClick={onResume}
          className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          استئناف من هناك
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-slate-400 hover:text-white cursor-pointer"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
