"use client";

import React from "react";
import { INITIAL_GRADES, type MockGrade } from "@/lib/db/mock-data";

export interface GradeSelectorTabsProps {
  selectedGrade: string;
  onSelectGrade: (gradeSlug: string) => void;
  grades?: MockGrade[];
}

export const GradeSelectorTabs: React.FC<GradeSelectorTabsProps> = ({
  selectedGrade,
  onSelectGrade,
  grades = INITIAL_GRADES,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {grades.map((grade) => (
        <button
          key={grade.id}
          onClick={() => onSelectGrade(grade.slug)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border-2 cursor-pointer ${
            selectedGrade === grade.slug
              ? "bg-gradient-vibrant text-white border-purple-500 shadow-md shadow-purple-500/20"
              : "bg-white text-slate-700 border-purple-100 hover:border-purple-300 hover:bg-purple-50"
          }`}
        >
          <span>{grade.titleEnglish}</span>
          <span className="text-[10px] opacity-80">({grade.titleArabic})</span>
        </button>
      ))}
    </div>
  );
};
