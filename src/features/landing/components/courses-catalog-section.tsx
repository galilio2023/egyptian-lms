import React from "react";
import { INITIAL_GRADES, type MockUnit } from "@/lib/db/mock-data";
import { UnitCard } from "@/entities/unit";

export interface CoursesCatalogSectionProps {
  units: MockUnit[];
  activeGradeFilter: string;
  onGradeFilterChange: (grade: string) => void;
  onSelectUnit: (unit: MockUnit) => void;
}

export const CoursesCatalogSection: React.FC<CoursesCatalogSectionProps> = ({
  units,
  activeGradeFilter,
  onGradeFilterChange,
  onSelectUnit,
}) => {
  const filteredUnits =
    activeGradeFilter === "all"
      ? units
      : units.filter((u) => u.gradeSlug === activeGradeFilter);

  return (
    <section id="courses_section" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-purple-800 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200">
              الوحدات والشهور الدراسية
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-3">
              اختر المرحلة وابدأ رحلة <span className="text-gradient-purple">التعلم الذكي</span>
            </h2>
          </div>

          {/* Grades Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            <button
              onClick={() => onGradeFilterChange("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeGradeFilter === "all"
                  ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20"
                  : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              جميع المراحل
            </button>
            {INITIAL_GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => onGradeFilterChange(g.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeGradeFilter === g.slug
                    ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20"
                    : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
                }`}
              >
                {g.titleEnglish} ({g.titleArabic})
              </button>
            ))}
          </div>
        </div>

        {/* Units Grid using centralized UnitCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              variant="catalog"
              onEnroll={onSelectUnit}
              ctaText={`اشتراك فوري (${unit.priceEgp} ج.م)`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
