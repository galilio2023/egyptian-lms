"use client";

import { useState } from "react";
import { toast } from "sonner";
import { XpGemSvg } from "@/components/ui/illustrated-icons";
import { Button } from "@/components/ui/button";
import type { MockUnit } from "@/lib/db/mock-data";

interface PaymobCheckoutFormProps {
  unit: MockUnit;
  onSuccess: (message: string) => void;
}

export function PaymobCheckoutForm({ unit, onSuccess }: PaymobCheckoutFormProps) {
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
          paymentMethod: "paymob_wallet",
        }),
      });
      const data = await res.json();

      if (data.paymobCheckoutUrl) {
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
    <div className="space-y-3.5 text-center py-2">
      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 leading-relaxed font-medium">
        سيتم تحويلك إلى بوابة الدفع الإلكتروني المعتمدة (باي موب) لإتمام الدفع الآمن بالمحافظ أو البطاقات وتفعيل الكورس لحظياً.
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
        <span>{isLoading ? "جاري الاتصال بالبوابة..." : `الانتقال للدفع الآمن (${unit.priceEgp} ج.م)`}</span>
      </Button>
    </div>
  );
}
