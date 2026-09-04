import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = "text", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label className="block text-xs font-black text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-purple-600 transition-colors",
              icon ? "ps-10 pe-4" : "px-4",
              error && "border-rose-400 bg-rose-50/20 focus:border-rose-600",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-rose-600 font-bold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
