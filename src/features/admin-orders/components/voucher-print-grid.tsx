import React from "react";
import { CenterVoucherCardSvg } from "@/components/ui/illustrated-icons";
import { VoucherCardItem } from "./voucher-card-item";
import type { GeneratedVoucher } from "../types";

export interface VoucherPrintGridProps {
  vouchers: GeneratedVoucher[];
}

export const VoucherPrintGrid: React.FC<VoucherPrintGridProps> = ({ vouchers }) => {
  return (
    <div className="p-6 max-h-[60vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
      {vouchers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 space-y-2">
          <CenterVoucherCardSvg className="w-16 h-16 mx-auto opacity-50" />
          <p className="text-xs font-bold">
            اضغط على زر التوليد بالأعلى لعرض ومعاينة شيت الكروت المطبوعة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4">
          {vouchers.map((voucher, idx) => (
            <VoucherCardItem key={voucher.code || idx} voucher={voucher} />
          ))}
        </div>
      )}
    </div>
  );
};
