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
  ({ className, label, options, error, children, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label className="block text-xs font-black text-slate-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-purple-600 transition-colors cursor-pointer",
            error && "border-rose-400 bg-rose-50/20",
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
        {error && <p className="text-[11px] text-rose-600 font-bold">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
