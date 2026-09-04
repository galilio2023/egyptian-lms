import React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, Lock } from "lucide-react";
import { type MockUnit } from "@/lib/db/mock-data";
import { ChampionCupSvg, CenterVoucherCardSvg } from "@/components/ui/illustrated-icons";
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
  const gradeUnits = units.filter(
    (u) =>
      u.gradeSlug === student.gradeSlug ||
      u.gradeTitle?.toLowerCase().includes(`grade ${student.gradeLevel}`) ||
      enrolledUnitIds.includes(u.id) ||
      enrolledUnitIds.includes(u.slug)
  );

  const displayedUnits = viewAllGrades
    ? units
    : gradeUnits.length > 0
    ? gradeUnits
    : units;

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

        <div className="flex items-center gap-2">
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
            href="/#courses_section"
            className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>تفعيل وحدات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedUnits.map((unit) => {
          const isUnlocked =
            enrolledUnitIds.includes(unit.id) || enrolledUnitIds.includes(unit.slug);

          return (
            <div
              key={unit.id}
              className={`modern-card overflow-hidden bg-white border-2 flex flex-col justify-between group shadow-md transition-all ${
                isUnlocked
                  ? "border-purple-100 hover:border-purple-300"
                  : "border-slate-200 opacity-90"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={unit.thumbnailUrl}
                  alt={unit.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className={`absolute top-3 start-3 px-3 py-1 rounded-full text-white text-[10px] font-black shadow-md flex items-center gap-1 ${
                    isUnlocked ? "bg-emerald-500" : "bg-slate-900/80 backdrop-blur-xs"
                  }`}
                >
                  {isUnlocked ? (
                    <span>مفعّل ونشط ✓</span>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>غير مفعل (مغلق 🔒)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {unit.gradeTitle}
                    </span>
                    {!isUnlocked && (
                      <span className="text-xs font-black text-pink-600">
                        {unit.priceEgp} ج.م
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                    {unit.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {unit.description}
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-2 pt-2 border-t border-purple-50">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{isUnlocked ? "التقدم في الوحدة" : "حالة الاشتراك"}</span>
                    <span className="text-purple-700 font-black">
                      {isUnlocked
                        ? `${Math.round((2 / unit.lessonsCount) * 100)}%`
                        : "مطلوب الاشتراك"}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-purple-50 rounded-full overflow-hidden border border-purple-200">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all"
                      style={{
                        width: isUnlocked
                          ? `${Math.round((2 / unit.lessonsCount) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* CTA */}
                {isUnlocked ? (
                  <Link
                    href={`/portal/learn/${unit.slug}`}
                    className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-gradient-vibrant hover:text-white text-purple-900 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-purple-200 hover:border-transparent transition-all shadow-sm"
                  >
                    <span>الدخول للوحدة والمحاضرات</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => onSelectLockedUnit(unit)}
                    className="w-full py-2.5 rounded-xl bg-gradient-vibrant hover:scale-[1.02] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                  >
                    <CenterVoucherCardSvg className="w-4 h-4" />
                    <span>تفعيل الوحدة الآن ({unit.priceEgp} ج.م)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
