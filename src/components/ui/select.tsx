import React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, children, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="w-full space-y-1.5 text-start" dir="ltr">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-black text-slate-700 cursor-pointer text-right">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-800 text-base sm:text-xs font-bold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 text-right",
            error && "border-rose-400 bg-rose-50/20 focus:border-rose-600 focus:ring-rose-500/20",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-rose-600 font-bold text-right">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
