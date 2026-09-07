"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface PortalTopBarProps {
  backHref: string;
  backLabel: string;
  actions?: ReactNode;
  maxWidthClass?: string;
}

export function PortalTopBar({
  backHref,
  backLabel,
  actions,
  maxWidthClass = "max-w-5xl",
}: PortalTopBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-purple-100/90 shadow-xs">
      <div
        className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3`}
      >
        <Link
          href={backHref}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-purple-700 transition-colors min-w-0"
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
          <span className="truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">{backLabel}</span>
        </Link>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
