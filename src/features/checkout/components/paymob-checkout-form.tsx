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
}

export function PaymobCheckoutForm({ unit, onSuccess }: PaymobCheckoutFormProps) {
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
        }),
      });
      const data = await res.json();

      if (data.paymobCheckoutUrl) {
        toast.loading("جاري تحويلك لبوابة الدفع الآمنة...");
        window.location.href = data.paymobCheckoutUrl;
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
    <div className="space-y-4 text-center py-2">
      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 leading-relaxed font-medium text-right">
        سيتم تحويلك إلى بوابة الدفع الإلكتروني المعتمدة (باي موب) لإتمام الدفع الآمن وتفعيل الكورس لحظياً في حسابك.
      </div>

      {/* Payment Channel Toggle */}
      <div className="grid grid-cols-2 gap-2 text-right">
        <button
          type="button"
          onClick={() => setSelectedMethod("paymob_wallet")}
          className={`p-3 rounded-2xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
            selectedMethod === "paymob_wallet"
              ? "border-purple-600 bg-purple-50/80 text-purple-950 shadow-xs"
              : "border-slate-200 hover:border-purple-300 text-slate-700 bg-white"
          }`}
        >
          <Smartphone className={`w-5 h-5 ${selectedMethod === "paymob_wallet" ? "text-purple-700" : "text-slate-400"}`} />
          <span>محافظ الموبايل كاش</span>
          <span className="text-[10px] text-slate-500 font-normal">فودافون / أورانج / اتصالات / WE</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMethod("paymob_card")}
          className={`p-3 rounded-2xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
            selectedMethod === "paymob_card"
              ? "border-purple-600 bg-purple-50/80 text-purple-950 shadow-xs"
              : "border-slate-200 hover:border-purple-300 text-slate-700 bg-white"
          }`}
        >
          <CreditCard className={`w-5 h-5 ${selectedMethod === "paymob_card" ? "text-purple-700" : "text-slate-400"}`} />
          <span>كروت ميزة والفيزا</span>
          <span className="text-[10px] text-slate-500 font-normal">Meeza / Visa / MasterCard</span>
        </button>
      </div>

      <Button
        type="button"
        variant="vibrant"
        size="lg"
        onClick={handlePaymobSubmit}
        isLoading={isLoading}
        className="w-full shadow-lg shadow-purple-500/25"
      >
        <XpGemSvg className="w-5 h-5 drop-shadow" />
        <span>
          {isLoading
            ? "جاري الاتصال بالبوابة..."
            : `الانتقال للدفع الآمن (${unit.priceEgp} ج.م)`}
        </span>
      </Button>
    </div>
  );
}
