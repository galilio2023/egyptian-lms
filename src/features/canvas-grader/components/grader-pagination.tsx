"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface GraderPaginationProps {
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function GraderPagination({
  currentPageIndex,
  totalPages,
  onPageChange,
}: GraderPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 text-xs font-bold text-slate-300">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
        disabled={currentPageIndex === 0}
        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <span>
        صفحة {currentPageIndex + 1} من {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPageIndex + 1))}
        disabled={currentPageIndex === totalPages - 1}
        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
