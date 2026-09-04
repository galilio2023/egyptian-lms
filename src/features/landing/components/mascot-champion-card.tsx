import React from "react";

export interface MascotChampionCardProps {
  name: string;
  catchphrase: string;
  description: string;
  SvgIcon: React.ComponentType<{ className?: string }>;
  badgeColorClass: string;
  borderColorClass: string;
  shadowColorClass: string;
  animationClass?: string;
}

export const MascotChampionCard: React.FC<MascotChampionCardProps> = ({
  name,
  catchphrase,
  description,
  SvgIcon,
  badgeColorClass,
  borderColorClass,
  shadowColorClass,
  animationClass = "animate-float-slow",
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-3xl bg-white/95 backdrop-blur-md border-2 ${borderColorClass} shadow-xl ${shadowColorClass} hover:scale-105 transition-all text-right w-full sm:w-auto`}
    >
      <div className={`w-16 h-16 sm:w-18 sm:h-18 drop-shadow-lg shrink-0 ${animationClass}`}>
        <SvgIcon className="w-full h-full" />
      </div>
      <div>
        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block ${badgeColorClass}`}>
          {name}
        </span>
        <span className="text-sm font-black text-slate-900 block mt-0.5">
          &quot;{catchphrase}&quot;
        </span>
        <span className="text-[11px] text-purple-700 font-bold block">
          {description}
        </span>
      </div>
    </div>
  );
};
