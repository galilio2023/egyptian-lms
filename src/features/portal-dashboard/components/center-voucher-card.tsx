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
    <div id="center-voucher-box" className="modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-indigo-200 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
            <CenterVoucherCardSvg className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900">
              شحن كارت السنتر والمكتبة (Center Scratch Card)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              لو اشتريت كارت الشحن من السنتر أو المكتبة المعتمدة، اكتب الكود المطبوع هنا لتفعيل الحصة فورياً.
            </p>
          </div>
        </div>

        {redeemedUnitTitle && (
          <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 shrink-0">
            تم تفعيل: {redeemedUnitTitle} ✓
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={voucherCodeInput}
          onChange={(e) => onVoucherCodeChange(e.target.value.toUpperCase())}
          placeholder="مثال: ELITE-GR1-998271"
          className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-600 focus:outline-hidden font-mono font-bold text-sm tracking-wider uppercase text-slate-800 bg-purple-50/30"
          disabled={isRedeeming}
        />
        <button
          type="submit"
          disabled={isRedeeming}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
        >
          {isRedeeming ? "جاري الشحن..." : "تفعيل الكارت فورياً"}
        </button>
      </form>
    </div>
  );
};
