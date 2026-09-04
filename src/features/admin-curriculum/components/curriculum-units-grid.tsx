import React from "react";
import { Film, UploadCloud, Trash2 } from "lucide-react";
import { type MockUnit } from "@/lib/db/mock-data";
import { EmptyState } from "@/components/ui/empty-state";

export interface CurriculumUnitsGridProps {
  units: MockUnit[];
  onOpenUpload: (unit: MockUnit) => void;
  onDeleteUnit: (unit: MockUnit) => void;
}

export const CurriculumUnitsGrid: React.FC<CurriculumUnitsGridProps> = ({
  units,
  onOpenUpload,
  onDeleteUnit,
}) => {
  if (units.length === 0) {
    return (
      <EmptyState
        title="لا توجد وحدات دراسية لهذا الصف"
        description="اضغط على زر 'إضافة وحدة دراسية جديدة' لإضافة أول وحدة في المنهج."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {units.map((unit) => (
        <div
          key={unit.id}
          className="modern-card overflow-hidden bg-white border border-slate-200 flex flex-col justify-between"
        >
          {/* Thumbnail */}
          <div className="relative h-44 w-full overflow-hidden bg-slate-100">
            <img
              src={unit.thumbnailUrl}
              alt={unit.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 start-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-slate-900 font-bold text-xs shadow-sm border border-slate-200">
              {unit.priceEgp} ج.م
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">{unit.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{unit.description}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium py-2 border-y border-slate-100">
              <span className="flex items-center gap-1 font-bold text-purple-700">
                <Film className="w-3.5 h-3.5" />
                {unit.lessonsCount} فيديوهات مشفرة
              </span>
              <span>{unit.quizzesCount} اختبارات</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onOpenUpload(unit)}
                className="flex-1 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-purple-600" />
                <span>رفع فيديو للمحاضرة</span>
              </button>
              <button
                onClick={() => onDeleteUnit(unit)}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                title="حذف الوحدة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
