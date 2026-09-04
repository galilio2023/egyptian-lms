import React from "react";
import { cn } from "@/lib/utils";

export interface AdminPageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  description,
  icon,
  actions,
  className,
}) => {
  const displaySubtitle = subtitle || description;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
        className
      )}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
          {icon && <div className="shrink-0">{icon}</div>}
          <span>{title}</span>
        </h1>
        {displaySubtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            {displaySubtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
};
