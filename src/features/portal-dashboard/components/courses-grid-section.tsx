import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { INITIAL_GRADES, type MockUnit } from "@/lib/db/mock-data";
import { ChampionCupSvg } from "@/components/ui/illustrated-icons";
import { UnitCard } from "@/entities/unit";
import { StudentDashboardProfile } from "../types";

export interface CoursesGridSectionProps {
  units: MockUnit[];
  enrolledUnitIds: string[];
  student: StudentDashboardProfile;
  viewAllGrades: boolean;
  onToggleViewAllGrades: () => void;
  onSelectLockedUnit: (unit: MockUnit) => void;
}

export const CoursesGridSection: React.FC<CoursesGridSectionProps> = ({
  units,
  enrolledUnitIds,
  student,
  viewAllGrades,
  onToggleViewAllGrades,
  onSelectLockedUnit,
}) => {
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>("all");

  const gradeUnits = units.filter(
    (u) =>
      u.gradeSlug === student.gradeSlug ||
      u.gradeTitle?.toLowerCase().includes(`grade ${student.gradeLevel}`) ||
      enrolledUnitIds.includes(u.id) ||
      enrolledUnitIds.includes(u.slug)
  );

  const baseUnits = viewAllGrades
    ? units
    : gradeUnits.length > 0
    ? gradeUnits
    : units;

  const displayedUnits = viewAllGrades && activeGradeFilter !== "all"
    ? baseUnits.filter((u) => u.gradeSlug === activeGradeFilter)
    : baseUnits;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ChampionCupSvg className="w-6 h-6" />
            <span>
              {viewAllGrades
                ? "جميع المناهج والمراحل الدراسية"
                : `الوحدات المفعلة ومنهج (${student.gradeTitle})`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {viewAllGrades
              ? "تصفح وحدات المنهج لجميع الصفوف من الصف الأول إلى السادس الابتدائي"
              : "الوحدات المشترك بها والمقررة لبطلنا الصغير"}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onToggleViewAllGrades}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              viewAllGrades
                ? "bg-purple-100 text-purple-900 border-purple-300 shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700"
            }`}
          >
            {viewAllGrades ? "عرض صفي فقط 🎯" : "استعراض باقي الصفوف 📚"}
          </button>

          <Link
            href="/courses"
            className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>كتالوج الدورات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grade Selector Tabs when viewing all grades */}
      {viewAllGrades && (
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs font-bold max-w-full overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveGradeFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeGradeFilter === "all"
                ? "bg-purple-600 text-white shadow-xs font-black"
                : "text-purple-800 hover:bg-purple-100"
            }`}
          >
            الكل ({units.length})
          </button>
          {INITIAL_GRADES.map((g) => {
            const countInGrade = units.filter((u) => u.gradeSlug === g.slug).length;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveGradeFilter(g.slug)}
                className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                  activeGradeFilter === g.slug
                    ? "bg-purple-600 text-white shadow-xs font-black"
                    : "text-purple-800 hover:bg-purple-100"
                }`}
              >
                {g.titleEnglish} {countInGrade > 0 ? `(${countInGrade})` : ""}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {displayedUnits.map((unit) => {
          const isUnlocked =
            enrolledUnitIds.includes(unit.id) || enrolledUnitIds.includes(unit.slug);

          return (
            <UnitCard
              key={unit.id}
              unit={unit}
              variant="student"
              isUnlocked={isUnlocked}
              onSelectLockedUnit={onSelectLockedUnit}
            />
          );
        })}
      </div>
    </div>
  );
};
