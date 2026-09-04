import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "vibrant" | "primary" | "secondary" | "outline" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-black rounded-2xl transition-all cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none gap-2";

    const variantStyles = {
      vibrant: "bg-gradient-vibrant hover:scale-[1.02] text-white shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30",
      primary: "bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/20",
      secondary: "bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200",
      outline: "bg-white hover:bg-purple-50 border-2 border-purple-200 text-purple-900 shadow-2xs",
      danger: "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs",
      success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20",
      ghost: "hover:bg-purple-50 text-slate-700 hover:text-purple-900",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs rounded-xl",
      md: "px-5 py-2.5 text-xs sm:text-sm",
      lg: "px-8 py-3.5 text-sm sm:text-base",
      icon: "p-2 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
