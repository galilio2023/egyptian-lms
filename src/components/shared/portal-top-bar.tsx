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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
      <div
        className={`${maxWidthClass} mx-auto rounded-full bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-[0_8px_30px_rgba(139,92,246,0.1)] px-5 py-2.5 flex items-center justify-between`}
      >
        <Link
          href={backHref}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-purple-600" />
          <span>{backLabel}</span>
        </Link>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
