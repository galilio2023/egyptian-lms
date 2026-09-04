"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, UploadCloud, Trash2, CheckCircle2 } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { UnitThumbnail } from "./unit-thumbnail";
import { UnitStatsBar } from "./unit-stats-bar";
import type { UnitCardProps } from "../types";

export const UnitCard: React.FC<UnitCardProps> = (props) => {
  const { unit, className = "" } = props;

  // 1. Catalog Variant (Landing Page)
  if (props.variant === "catalog") {
    const { onEnroll, ctaText = "اشترك الآن وفعل المنهج" } = props;

    return (
      <div
        className={`modern-card overflow-hidden flex flex-col group bg-white border-2 border-purple-100 hover:border-purple-300 shadow-md transition-all duration-300 ${className}`}
      >
        <UnitThumbnail
          thumbnailUrl={unit.thumbnailUrl}
          title={unit.title}
          gradeTitle={unit.gradeTitle}
          priceEgp={unit.priceEgp}
        />

        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
              {unit.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
              {unit.description}
            </p>
          </div>

          <UnitStatsBar
            lessonsCount={unit.lessonsCount}
            quizzesCount={unit.quizzesCount}
          />

          <div className="pt-1 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">قيمة الاشتراك</span>
              <span className="text-lg font-black text-purple-900">{unit.priceEgp} ج.م</span>
            </div>

            {onEnroll ? (
              <Button
                variant="vibrant"
                size="sm"
                onClick={() => onEnroll(unit)}
                className="font-bold text-xs"
              >
                <span>{ctaText}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Link
                href={`/student-register?grade=${unit.gradeSlug}`}
                className="py-2.5 px-4 rounded-xl bg-gradient-vibrant text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:scale-[1.02] transition-all flex items-center gap-1.5"
              >
                <span>{ctaText}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Student Portal Variant
  if (props.variant === "student") {
    const { isUnlocked, onSelectLockedUnit } = props;

    return (
      <div
        className={`modern-card overflow-hidden bg-white border-2 flex flex-col justify-between group shadow-md transition-all ${
          isUnlocked
            ? "border-purple-100 hover:border-purple-300"
            : "border-slate-200 opacity-90"
        } ${className}`}
      >
        <UnitThumbnail
          thumbnailUrl={unit.thumbnailUrl}
          title={unit.title}
          gradeTitle={unit.gradeTitle}
          priceEgp={isUnlocked ? undefined : unit.priceEgp}
          isLocked={!isUnlocked}
        />

        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                {unit.title}
              </h3>
              {isUnlocked ? (
                <Badge variant="emerald" size="sm">
                  <CheckCircle2 className="w-3.5 h-3.5 me-1" />
                  <span>مفعل</span>
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  <span>{unit.priceEgp} ج.م</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
              {unit.description}
            </p>
          </div>

          <UnitStatsBar
            lessonsCount={unit.lessonsCount}
            quizzesCount={unit.quizzesCount}
          />

          <div className="pt-2">
            {isUnlocked ? (
              <Link
                href={`/portal/learn/${unit.slug}`}
                className="w-full py-2.5 rounded-xl bg-gradient-vibrant text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
              >
                <span>ادخل وتعلّم الآن 🚀</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onSelectLockedUnit?.(unit)}
                className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>تفعيل فوري بكارت سنتر أو إنستاباي 🎟️</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Admin Curriculum Variant
  const { onOpenUpload, onDeleteUnit } = props;

  return (
    <div
      className={`modern-card overflow-hidden bg-white border border-slate-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <UnitThumbnail
        thumbnailUrl={unit.thumbnailUrl}
        title={unit.title}
        priceEgp={unit.priceEgp}
      />

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h3 className="font-bold text-base text-slate-900">{unit.title}</h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
            {unit.description}
          </p>
        </div>

        <UnitStatsBar
          lessonsCount={unit.lessonsCount}
          quizzesCount={unit.quizzesCount}
        />

        <div className="pt-2 flex items-center justify-between gap-2">
          <Button
            variant="vibrant"
            size="sm"
            onClick={() => onOpenUpload?.(unit)}
            className="flex-1 text-xs"
          >
            <UploadCloud className="w-4 h-4 me-1" />
            <span>رفع فيديو مشفر</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteUnit?.(unit)}
            className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs px-2.5"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
