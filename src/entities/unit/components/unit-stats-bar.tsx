import React from "react";
import { Film, Award, Clock } from "lucide-react";

export interface UnitStatsBarProps {
  lessonsCount: number;
  quizzesCount: number;
  durationText?: string;
  className?: string;
}

export const UnitStatsBar: React.FC<UnitStatsBarProps> = ({
  lessonsCount,
  quizzesCount,
  durationText,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between text-xs text-slate-500 font-bold py-2.5 border-y border-purple-50/80 ${className}`}
    >
      <span className="flex items-center gap-1.5 text-purple-700">
        <Film className="w-4 h-4 text-purple-600" />
        <span>{lessonsCount} محاضرات</span>
      </span>

      <span className="flex items-center gap-1.5 text-amber-600">
        <Award className="w-4 h-4 text-amber-500" />
        <span>{quizzesCount} كويزات ذكية</span>
      </span>

      {durationText && (
        <span className="hidden sm:flex items-center gap-1 text-slate-400 font-normal">
          <Clock className="w-3.5 h-3.5" />
          <span>{durationText}</span>
        </span>
      )}
    </div>
  );
};
