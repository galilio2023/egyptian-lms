import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "purple" | "emerald" | "amber" | "rose" | "slate" | "sky" | "gradient";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "purple",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 font-bold rounded-full border transition-colors select-none";

  const variantStyles = {
    purple: "bg-purple-50 text-purple-900 border-purple-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    sky: "bg-sky-50 text-sky-800 border-sky-200",
    gradient: "bg-gradient-vibrant text-white border-transparent shadow-sm",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props}>
      {children}
    </span>
  );
};
