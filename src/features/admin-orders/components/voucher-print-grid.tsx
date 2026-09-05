import React from "react";
import { CenterVoucherCardSvg, EliteLogoBadge } from "@/components/ui/illustrated-icons";
import { VoucherCardItem } from "./voucher-card-item";
import type { GeneratedVoucher } from "../types";

export interface VoucherPrintGridProps {
  vouchers: GeneratedVoucher[];
}

export const VoucherPrintGrid: React.FC<VoucherPrintGridProps> = ({ vouchers }) => {
  return (
    <div className="p-6 max-h-[60vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-4">
      {/* Print-only sheet header */}
      {vouchers.length > 0 && (
        <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4 text-slate-900">
          <div className="flex items-center gap-3">
            <EliteLogoBadge className="w-10 h-10" />
            <div>
              <h1 className="font-black text-base">أكاديمية إيليت التعليمية - شيت كروت الشحن المطبوعة</h1>
              <span className="text-xs font-bold text-slate-600">تسليم السناتر والمكتبات المعتمدة • كروت شحن رسمية</span>
            </div>
          </div>
          <div className="text-left text-xs font-mono font-bold">
            <div>العدد الإجمالي: {vouchers.length} كارت</div>
            <div className="text-slate-500">{new Date().toLocaleDateString("ar-EG")}</div>
          </div>
        </div>
      )}

      {vouchers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 space-y-2">
          <CenterVoucherCardSvg className="w-16 h-16 mx-auto opacity-50" />
          <p className="text-xs font-bold">
            اضغط على زر التوليد بالأعلى لعرض ومعاينة شيت الكروت المطبوعة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3">
          {vouchers.map((voucher, idx) => (
            <VoucherCardItem key={voucher.code || idx} voucher={voucher} />
          ))}
        </div>
      )}
    </div>
  );
};
