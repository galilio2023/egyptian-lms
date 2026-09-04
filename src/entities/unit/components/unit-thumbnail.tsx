import React from "react";
import { Lock } from "lucide-react";

export interface UnitThumbnailProps {
  thumbnailUrl: string;
  title: string;
  gradeTitle?: string;
  priceEgp?: number;
  isLocked?: boolean;
  className?: string;
}

export const UnitThumbnail: React.FC<UnitThumbnailProps> = ({
  thumbnailUrl,
  title,
  gradeTitle,
  priceEgp,
  isLocked = false,
  className = "",
}) => {
  return (
    <div className={`relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 ${className}`}>
      {/* Thumbnail Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Grade Title Badge (Top Start) */}
      {gradeTitle && (
        <div className="absolute top-3 start-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-purple-200 text-xs font-extrabold text-purple-700 shadow-xs">
          {gradeTitle}
        </div>
      )}

      {/* Price Badge (Bottom Start) */}
      {typeof priceEgp === "number" && !isLocked && (
        <div className="absolute bottom-3 start-3 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-xl shadow-md">
          {priceEgp} ج.م
        </div>
      )}

      {/* Locked Overlay Pill */}
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-black shadow-lg flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>يتطلب التفعيل</span>
          </span>
        </div>
      )}
    </div>
  );
};
