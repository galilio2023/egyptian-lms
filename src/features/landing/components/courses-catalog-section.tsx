import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { INITIAL_GRADES, type MockUnit } from "@/lib/db/mock-data";
import { XpGemSvg } from "@/components/ui/illustrated-icons";

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
              المراحل الدراسية والكورسات
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              اختر المرحلة التعليمية للبطل الصغير
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full">
            <button
              onClick={() => onGradeFilterChange("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGradeFilter === "all"
                  ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/20"
                  : "bg-white text-slate-700 border border-purple-200 hover:bg-purple-50"
              }`}
            >
              جميع الصفوف
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

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="modern-card overflow-hidden flex flex-col group bg-white border-2 border-purple-100 hover:border-purple-300 shadow-md"
            >
              {/* Thumbnail Header */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={unit.thumbnailUrl}
                  alt={unit.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-purple-200 text-xs font-extrabold text-purple-700 shadow-sm">
                  {unit.gradeTitle}
                </div>
                <div className="absolute bottom-3 start-3 text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-xl shadow-md">
                  {unit.priceEgp} ج.م
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                    {unit.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {unit.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-bold py-2.5 border-y border-purple-50">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {unit.lessonsCount} محاضرات فيديو
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {unit.quizzesCount} اختبارات تفاعلية
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectUnit(unit)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-vibrant hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <XpGemSvg className="w-4 h-4" />
                    اشتراك فوري ({unit.priceEgp} ج.م)
                  </button>
                  <Link
                    href={`/portal/learn/${unit.slug}`}
                    className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors"
                    title="عرض محتوى الوحدة"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
