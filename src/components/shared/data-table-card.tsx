import React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2 } from "lucide-react";

export interface DataTableCardProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  className?: string;
}

export const DataTableCard: React.FC<DataTableCardProps> = ({
  headers,
  children,
  isEmpty = false,
  emptyTitle = "لا توجد سجلات حالياً",
  emptyDescription = "لم يتم العثور على بيانات تطابق شروط البحث والفلترة.",
  isLoading = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "modern-card rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-100 overflow-hidden shadow-md",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-purple-50/70 border-b border-purple-100 text-purple-950 font-black">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 text-slate-700 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={headers.length} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-purple-700">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-bold">جاري تحميل البيانات...</span>
                  </div>
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="p-8 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
