import React from "react";
import { cn } from "@/lib/utils";
import { FolderSearch } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-6 sm:p-12 text-center gap-3 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-purple-200 bg-purple-50/30",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-purple-100/70 border border-purple-200 text-purple-600 flex items-center justify-center shadow-2xs" aria-hidden="true">
        {icon || <FolderSearch className="w-7 h-7" />}
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="text-base font-black text-slate-900">{title}</h3>
        {description && (
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
