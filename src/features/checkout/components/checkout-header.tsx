"use client";

import { X, Sparkles } from "lucide-react";
import type { MockUnit } from "@/lib/db/mock-data";

interface CheckoutHeaderProps {
  unit: MockUnit;
  onClose: () => void;
  effectivePrice?: number;
  discountAmount?: number;
}

export function CheckoutHeader({ unit, onClose, effectivePrice, discountAmount }: CheckoutHeaderProps) {
  const displayPrice = effectivePrice !== undefined ? effectivePrice : unit.priceEgp;
  const hasDiscount = Boolean(discountAmount && discountAmount > 0);

  return (
    <>
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 end-5 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none"
        aria-label="إغلاق"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Modal Header */}
      <div className="text-center space-y-1">
        <span className="text-xs font-black text-purple-800 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-pink-500" aria-hidden="true" />
          <span>تفعيل الاشتراك الفوري للبطل</span>
        </span>
        <h2 id="checkout-modal-title" className="text-xl font-black text-slate-900 pt-1.5">{unit.title}</h2>
        <p className="text-xs text-slate-500 font-medium">
          {unit.gradeTitle} • {unit.description}
        </p>
        <div className="pt-2 flex items-center justify-center gap-2">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-500 line-through">
                <span className="sr-only">السعر الأصلي قبل الخصم: </span>
                {unit.priceEgp} ج.م
              </span>
              <span className="text-3xl font-black text-emerald-600">{displayPrice} ج.م</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                وفرت {discountAmount} ج.م 🎉
              </span>
            </div>
          ) : (
            <>
              <span className="text-3xl font-black text-gradient-purple">{unit.priceEgp} ج.م</span>
              <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                / للوحدة كاملة
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
