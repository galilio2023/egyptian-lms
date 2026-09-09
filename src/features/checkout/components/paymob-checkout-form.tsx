"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Smartphone, CreditCard } from "lucide-react";
import { XpGemSvg } from "@/components/ui/illustrated-icons";
import { Button } from "@/components/ui/button";
import type { MockUnit } from "@/lib/db/mock-data";

interface PaymobCheckoutFormProps {
  unit: MockUnit;
  onSuccess: (message: string) => void;
  couponCode?: string;
}

export function PaymobCheckoutForm({ unit, onSuccess, couponCode }: PaymobCheckoutFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<"paymob_wallet" | "paymob_card">("paymob_wallet");
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymobSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: unit.id,
          unitTitle: unit.title,
          amountEgp: unit.priceEgp,
          paymentMethod: selectedMethod,
          couponCode: couponCode || undefined,
        }),
      });
      const data = await res.json();

      if (data.paymobCheckoutUrl) {
        toast.loading("جاري تحويلك لبوابة الدفع الآمنة...");
        window.location.assign(data.paymobCheckoutUrl);
        return;
      }

      toast.info("تم تسجيل طلب الدفع بنجاح.");
      onSuccess(
        `تم إنشاء طلب الدفع عبر باي موب بنجاح برقم (${
          data.orderId || "قيد الانتظار"
        }). يرجى استكمال عملية الدفع عبر البوابة.`
      );
    } catch {
      toast.error("تعذر الاتصال ببوابة الدفع.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handlePaymobSubmit(); }} noValidate className="space-y-4 text-center py-2">
      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 leading-relaxed font-medium text-right">
        سيتم تحويلك إلى بوابة الدفع الإلكتروني المعتمدة (باي موب) لإتمام الدفع الآمن وتفعيل الكورس لحظياً في حسابك.
      </div>

      {/* Payment Channel Toggle */}
      <div className="grid grid-cols-2 gap-2 text-right" role="radiogroup" aria-label="قناة الدفع الإلكتروني">
        <button
          type="button"
          role="radio"
          aria-checked={selectedMethod === "paymob_wallet"}
          onClick={() => setSelectedMethod("paymob_wallet")}
          className={`p-3 rounded-2xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none ${
            selectedMethod === "paymob_wallet"
              ? "border-purple-600 bg-purple-50/80 text-purple-950 shadow-xs"
              : "border-slate-200 hover:border-purple-300 text-slate-700 bg-white"
          }`}
        >
          <Smartphone className={`w-5 h-5 ${selectedMethod === "paymob_wallet" ? "text-purple-700" : "text-slate-400"}`} aria-hidden="true" />
          <span>محافظ الموبايل كاش</span>
          <span className="text-[10px] text-slate-500 font-normal">فودافون / أورانج / اتصالات / WE</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selectedMethod === "paymob_card"}
          onClick={() => setSelectedMethod("paymob_card")}
          className={`p-3 rounded-2xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none ${
            selectedMethod === "paymob_card"
              ? "border-purple-600 bg-purple-50/80 text-purple-950 shadow-xs"
              : "border-slate-200 hover:border-purple-300 text-slate-700 bg-white"
          }`}
        >
          <CreditCard className={`w-5 h-5 ${selectedMethod === "paymob_card" ? "text-purple-700" : "text-slate-400"}`} aria-hidden="true" />
          <span>كروت ميزة والفيزا</span>
          <span className="text-[10px] text-slate-500 font-normal">Meeza / Visa / MasterCard</span>
        </button>
      </div>

      <Button
        type="submit"
        variant="vibrant"
        size="lg"
        isLoading={isLoading}
        className="w-full shadow-lg shadow-purple-500/25"
      >
        <XpGemSvg className="w-5 h-5 drop-shadow" aria-hidden="true" />
        <span>
          {isLoading
            ? "جاري الاتصال بالبوابة..."
            : `الانتقال للدفع الآمن (${unit.priceEgp} ج.م)`}
        </span>
      </Button>
    </form>
  );
}
