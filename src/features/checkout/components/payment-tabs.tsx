"use client";

import { 
  CenterVoucherCardSvg, 
  EgyptianWalletSvg, 
  XpGemSvg 
} from "@/components/ui/illustrated-icons";

export type PaymentMethodType = "voucher_card" | "instapay_manual" | "paymob_wallet";

interface PaymentTabsProps {
  currentMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
}

export function PaymentTabs({ currentMethod, onSelectMethod }: PaymentTabsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5" role="tablist" aria-label="طرق الدفع المتاحة">
      {/* Scratch Card */}
      <button
        type="button"
        role="tab"
        aria-selected={currentMethod === "voucher_card"}
        aria-controls="payment-panel"
        onClick={() => onSelectMethod("voucher_card")}
        className={`p-2 sm:p-3 rounded-2xl text-center transition-all flex flex-col items-center gap-1.5 border-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none ${
          currentMethod === "voucher_card"
            ? "bg-purple-50 border-purple-600 text-purple-950 shadow-md ring-2 ring-purple-100 font-black"
            : "bg-white border-purple-100 text-slate-600 hover:bg-purple-50/50 text-xs"
        }`}
      >
        <CenterVoucherCardSvg className="w-8 h-8" aria-hidden="true" />
        <span className="text-[11px] font-black">كارت السنتر</span>
        <span className="text-[8px] sm:text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded">شحن فوري</span>
      </button>

      {/* InstaPay / Cash */}
      <button
        type="button"
        role="tab"
        aria-selected={currentMethod === "instapay_manual"}
        aria-controls="payment-panel"
        onClick={() => onSelectMethod("instapay_manual")}
        className={`p-2 sm:p-3 rounded-2xl text-center transition-all flex flex-col items-center gap-1.5 border-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none ${
          currentMethod === "instapay_manual"
            ? "bg-purple-50 border-purple-600 text-purple-950 shadow-md ring-2 ring-purple-100 font-black"
            : "bg-white border-purple-100 text-slate-600 hover:bg-purple-50/50 text-xs"
        }`}
      >
        <EgyptianWalletSvg className="w-8 h-8" aria-hidden="true" />
        <span className="text-[11px] font-black">إنستاباي / كاش</span>
        <span className="text-[8px] sm:text-[9px] text-orange-600 font-bold bg-orange-50 px-1 py-0.5 rounded">تحويل يدوي</span>
      </button>

      {/* Paymob */}
      <button
        type="button"
        role="tab"
        aria-selected={currentMethod === "paymob_wallet"}
        aria-controls="payment-panel"
        onClick={() => onSelectMethod("paymob_wallet")}
        className={`p-2 sm:p-3 rounded-2xl text-center transition-all flex flex-col items-center gap-1.5 border-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none ${
          currentMethod === "paymob_wallet"
            ? "bg-purple-50 border-purple-600 text-purple-950 shadow-md ring-2 ring-purple-100 font-black"
            : "bg-white border-purple-100 text-slate-600 hover:bg-purple-50/50 text-xs"
        }`}
      >
        <XpGemSvg className="w-8 h-8" aria-hidden="true" />
        <span className="text-[11px] font-black">باي موب / فيزا</span>
        <span className="text-[8px] sm:text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">دفع آمن</span>
      </button>
    </div>
  );
}
