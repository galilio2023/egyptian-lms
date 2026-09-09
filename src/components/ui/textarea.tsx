import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, rows = 3, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-black text-slate-700 cursor-pointer">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full p-3 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all leading-relaxed",
            error && "border-rose-400 bg-rose-50/20 focus:border-rose-600 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-[11px] text-rose-600 font-bold">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
