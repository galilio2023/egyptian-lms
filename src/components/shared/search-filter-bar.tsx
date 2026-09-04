import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  placeholder = "بحث...",
  filters,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "modern-card p-4 bg-white/95 backdrop-blur-md border-2 border-purple-100 flex flex-col sm:flex-row items-center gap-3 rounded-2xl shadow-sm",
        className
      )}
    >
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-purple-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-purple-600 font-medium transition-colors"
        />
      </div>

      {filters && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          {filters}
        </div>
      )}

      {actions && (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};
