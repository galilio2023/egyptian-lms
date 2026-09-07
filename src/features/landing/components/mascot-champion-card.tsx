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
      className={`flex items-center gap-3 sm:gap-3.5 p-3 sm:p-3.5 rounded-3xl bg-white/95 backdrop-blur-md border-2 ${borderColorClass} shadow-xl ${shadowColorClass} hover:scale-105 transition-all text-right w-full sm:w-auto sm:min-w-[210px] md:min-w-[230px] lg:min-w-[250px] shrink-0 sm:shrink`}
    >
      <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 drop-shadow-lg shrink-0 ${animationClass}`}>
        <SvgIcon className="w-full h-full" />
      </div>
      <div className="min-w-0 flex-1">
        <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full inline-block ${badgeColorClass} whitespace-nowrap`}>
          {name}
        </span>
        <span className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
          &quot;{catchphrase}&quot;
        </span>
        <span className="text-[10px] sm:text-[11px] text-purple-700 font-bold block whitespace-nowrap overflow-hidden text-ellipsis">
          {description}
        </span>
      </div>
    </div>
  );
};
