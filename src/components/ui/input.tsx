import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = "text", id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-black text-slate-700 cursor-pointer">
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
            id={inputId}
            type={type}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full min-h-[42px] py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all",
              icon ? "ps-10 pe-4" : "px-4",
              error && "border-rose-400 bg-rose-50/20 focus:border-rose-600 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-[11px] text-rose-600 font-bold">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
