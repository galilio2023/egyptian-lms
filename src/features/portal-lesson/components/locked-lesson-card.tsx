"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { CenterVoucherCardSvg } from "@/components/ui/illustrated-icons";
import { Button } from "@/components/ui/button";
import type { MockLesson, MockUnit } from "@/lib/db/mock-data";

interface LockedLessonCardProps {
  lesson: MockLesson;
  unit: MockUnit;
  onOpenCheckout: () => void;
}

export function LockedLessonCard({
  lesson,
  unit,
  onOpenCheckout,
}: LockedLessonCardProps) {
  return (
    <div className="rounded-3xl p-8 sm:p-12 bg-slate-900 border-2 border-purple-500/30 text-center text-white space-y-6 shadow-2xl">
      <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto shadow-inner">
        <Lock className="w-8 h-8" />
      </div>
      <div className="max-w-md mx-auto space-y-2">
        <span className="text-xs font-black text-pink-400 uppercase tracking-wider block">
          محتوى تعليمي مدفوع ومحمي
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white">{lesson.title}</h2>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          هذه المحاضرة مخصصة للمشتركين في ({unit.title}). يمكنك تفعيل الاشتراك الفوري بكارت الشحن أو فودافون كاش وإنستاباي لمتابعة الشرح والملازم.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
        <Button
          variant="vibrant"
          size="lg"
          onClick={onOpenCheckout}
          className="w-full sm:w-auto shadow-lg shadow-purple-500/25"
        >
          <CenterVoucherCardSvg className="w-5 h-5" />
          <span>تفعيل الكورس الآن ({unit.priceEgp} ج.م)</span>
        </Button>
        <Link
          href={`/portal/learn/${unit.slug}`}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors text-center"
        >
          العودة للدروس المجانية
        </Link>
      </div>
    </div>
  );
}
