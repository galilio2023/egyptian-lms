"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CenterVoucherCardSvg } from "@/components/ui/illustrated-icons";
import { Button } from "@/components/ui/button";

interface VoucherRedemptionFormProps {
  onSuccess: (message: string) => void;
}

export function VoucherRedemptionForm({ onSuccess }: VoucherRedemptionFormProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      toast.error("يرجى كتابة كود كارت الشحن.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/voucher/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "كود الشحن غير صحيح أو تم استخدامه من قبل.");
        setIsLoading(false);
        return;
      }

      const msg = data.message || "تم شحن الكود وتفعيل الوحدة بنجاح!";
      toast.success("🎉 تم تفعيل الكورس فوراً!");
      onSuccess(msg);
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleVoucherSubmit} className="space-y-3.5">
      <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
        إذا قمت بشراء كارت الشحن من السنتر أو المكتبة، أدخل الكود المطبوع على الكارت للشحن الفوري.
      </div>

      <div className="space-y-1 text-right">
        <label htmlFor="voucherCodeInput" className="text-xs font-semibold text-slate-700">
          كود كارت الشحن (12 رقم / حروف):
        </label>
        <input
          id="voucherCodeInput"
          type="text"
          dir="ltr"
          required
          disabled={isLoading}
          placeholder="مثال: ELITE-GR1-9982 أو كود الكارت"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white text-center uppercase"
        />
      </div>

      <Button
        type="submit"
        variant="vibrant"
        size="lg"
        isLoading={isLoading}
        className="w-full shadow-lg shadow-purple-500/25"
      >
        <CenterVoucherCardSvg className="w-5 h-5" />
        <span>{isLoading ? "جاري تفعيل الكود..." : "شحن الكود وتفعيل الوحدة"}</span>
      </Button>
    </form>
  );
}
