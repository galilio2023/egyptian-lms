import React from "react";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";
import type { GeneratedVoucher } from "../types";

export interface VoucherCardItemProps {
  voucher: GeneratedVoucher;
}

export const VoucherCardItem: React.FC<VoucherCardItemProps> = ({ voucher }) => {
  return (
    <div className="border-2 border-purple-200 rounded-2xl p-4 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 relative overflow-hidden text-right shadow-sm print:shadow-none print:border-slate-800 print:break-inside-avoid">
      {/* Card Top */}
      <div className="flex items-center justify-between border-b border-purple-100 pb-2">
        <div className="flex items-center gap-2">
          <EliteLogoBadge className="w-8 h-8" />
          <div>
            <span className="font-black text-xs text-slate-900 block leading-tight">
              أكاديمية إيليت
            </span>
            <span className="text-[9px] text-purple-700 font-bold">
              {voucher.gradeTitle}
            </span>
          </div>
        </div>
        <span className="text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
          {voucher.priceEgp} ج.م
        </span>
      </div>

      {/* Scratch-off Silver Foil Mockup */}
      <div className="py-3 text-center">
        <span className="text-[9px] text-slate-400 font-bold block mb-1">
          امسح هنا برفق لإظهار كود التفعيل:
        </span>
        <div className="p-2.5 rounded-xl bg-slate-200 border-2 border-dashed border-slate-400 inline-block min-w-[200px] shadow-inner font-mono font-black text-sm tracking-widest text-slate-900 select-all">
          {voucher.code}
        </div>
      </div>

      {/* Card Bottom / Barcode Mockup */}
      <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-[9px] text-slate-500 font-medium">
        <span className="font-mono font-bold text-slate-700">
          {voucher.serialNumber}
        </span>
        <span>التفعيل: elite-academy.eg</span>
      </div>
    </div>
  );
};
