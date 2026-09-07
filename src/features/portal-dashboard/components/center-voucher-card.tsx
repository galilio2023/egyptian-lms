import React from "react";
import { CenterVoucherCardSvg } from "@/components/ui/illustrated-icons";

export interface CenterVoucherCardProps {
  voucherCodeInput: string;
  onVoucherCodeChange: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isRedeeming: boolean;
  redeemedUnitTitle: string | null;
}

export const CenterVoucherCard: React.FC<CenterVoucherCardProps> = ({
  voucherCodeInput,
  onVoucherCodeChange,
  onSubmit,
  isRedeeming,
  redeemedUnitTitle,
}) => {
  return (
    <div id="center-voucher-box" className="modern-card p-4 sm:p-6 bg-white/95 backdrop-blur-md border-2 border-indigo-200 rounded-3xl shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <CenterVoucherCardSvg className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 leading-snug">
              شحن كارت السنتر والمكتبة (Center Scratch Card)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              لو اشتريت كارت الشحن من السنتر أو المكتبة، اكتب الكود المطبوع هنا لتفعيل الحصة فورياً.
            </p>
          </div>
        </div>

        {redeemedUnitTitle && (
          <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto">
            تم تفعيل: {redeemedUnitTitle} ✓
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3">
          <div className="flex w-full sm:flex-1">
            <input
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              value={voucherCodeInput}
              onChange={(e) => onVoucherCodeChange(e.target.value.toUpperCase())}
              placeholder="ادخل الكود المطبوع على الكارت هنا"
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-purple-200 focus:border-purple-600 focus:outline-hidden text-sm sm:text-base font-mono font-bold tracking-wider uppercase text-slate-800 bg-purple-50/30"
              disabled={isRedeeming}
            />
          </div>
          <button
            type="submit"
            disabled={isRedeeming}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isRedeeming ? "جاري الشحن..." : "تفعيل الكارت فورياً"}
          </button>
        </div>
        <p className="text-xs text-slate-500 font-medium px-1">
          الكود مطبوع أسفل طبقة الحك الفضية على كارت السنتر
        </p>
      </form>
    </div>
  );
};
