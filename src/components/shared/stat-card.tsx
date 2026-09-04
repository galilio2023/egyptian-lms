"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export type StatCardVariant =
  | "purple"
  | "emerald"
  | "amber"
  | "rose"
  | "teal"
  | "indigo"
  | "default";

export interface StatCardProps {
  title: React.ReactNode;
  value: string | number;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  trend?: {
    value: string | number;
    label?: string;
    positive?: boolean;
  };
  variant?: StatCardVariant;
  className?: string;
  onClick?: () => void;
}

const VARIANT_STYLES: Record<
  StatCardVariant,
  {
    border: string;
    bg: string;
    valueColor: string;
    iconColor: string;
    subtextColor: string;
  }
> = {
  purple: {
    border: "border-purple-100 hover:border-purple-200",
    bg: "bg-white/95",
    valueColor: "text-slate-900",
    iconColor: "text-purple-600",
    subtextColor: "text-purple-700",
  },
  emerald: {
    border: "border-emerald-100 hover:border-emerald-200",
    bg: "bg-white/95",
    valueColor: "text-emerald-700",
    iconColor: "text-emerald-600",
    subtextColor: "text-emerald-600",
  },
  amber: {
    border: "border-amber-100 hover:border-amber-200",
    bg: "bg-white/95",
    valueColor: "text-amber-600",
    iconColor: "text-amber-600",
    subtextColor: "text-amber-700",
  },
  rose: {
    border: "border-rose-100 hover:border-rose-200",
    bg: "bg-white/95",
    valueColor: "text-rose-700",
    iconColor: "text-rose-600",
    subtextColor: "text-rose-600",
  },
  teal: {
    border: "border-teal-100 hover:border-teal-200",
    bg: "bg-white/95",
    valueColor: "text-teal-800",
    iconColor: "text-teal-600",
    subtextColor: "text-teal-700",
  },
  indigo: {
    border: "border-indigo-100 hover:border-indigo-200",
    bg: "bg-white/95",
    valueColor: "text-indigo-700",
    iconColor: "text-indigo-600",
    subtextColor: "text-indigo-600",
  },
  default: {
    border: "border-slate-100 hover:border-slate-200",
    bg: "bg-white/95",
    valueColor: "text-slate-900",
    iconColor: "text-slate-500",
    subtextColor: "text-slate-500",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  variant = "default",
  className = "",
  onClick,
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-3xl border-2 shadow-xs transition-all duration-200 ${styles.bg} ${styles.border} ${
        isClickable ? "cursor-pointer hover:shadow-md hover:scale-[1.01]" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500 text-xs font-bold gap-2">
        <span className="truncate">{title}</span>
        {icon && (
          <div className={`shrink-0 ${styles.iconColor}`}>
            {icon}
          </div>
        )}
      </div>

      <div className={`text-2xl sm:text-3xl font-black mt-2 tracking-tight ${styles.valueColor}`}>
        {value}
      </div>

      {trend && (
        <div
          className={`text-[11px] font-bold flex items-center gap-1 mt-1.5 ${
            trend.positive !== false ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {trend.positive !== false ? (
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{trend.value}</span>
          {trend.label && <span className="text-slate-400 font-normal">({trend.label})</span>}
        </div>
      )}

      {description && (
        <div className={`text-[10px] sm:text-[11px] font-medium mt-1 leading-snug ${styles.subtextColor}`}>
          {description}
        </div>
      )}
    </div>
  );
};
