"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Copy, Check } from "lucide-react";
import { EgyptianWalletSvg } from "@/components/ui/illustrated-icons";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/utils/image-compression";
import type { MockUnit } from "@/lib/db/mock-data";

interface ManualTransferFormProps {
  unit: MockUnit;
  onSuccess: (message: string) => void;
  vodafoneCashNumber?: string;
  instapayAddress?: string;
  couponCode?: string;
}

export function ManualTransferForm({
  unit,
  onSuccess,
  vodafoneCashNumber = "01000000000",
  instapayAddress = "academy@instapay",
  couponCode,
}: ManualTransferFormProps) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptImageBase64, setReceiptImageBase64] = useState<string | null>(null);
  const [copied, setCopied] = useState<"instapay" | "vodafone" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (text: string, type: "instapay" | "vodafone") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("تم نسخ الرقم بنجاح!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً.");
      return;
    }

    const toastId = toast.loading("جاري معالجة وضغط صورة الإيصال...");
    try {
      const compressedDataUrl = await compressImage(file, 1400, 0.8);
      setReceiptUploaded(true);
      setReceiptImageBase64(compressedDataUrl);
      toast.dismiss(toastId);
      toast.success("تم إرفاق صورة الإيصال بنجاح ✓");
    } catch {
      toast.dismiss(toastId);
      toast.error("تعذر قراءة ملف الصورة.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim() && !receiptImageBase64) {
      toast.error("يرجى إدخال رقم العملية أو إرفاق صورة الإيصال.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/orders/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: unit.id,
          unitTitle: unit.title,
          amountEgp: unit.priceEgp,
          paymentMethod: "instapay_manual",
          referenceNumber: referenceNumber.trim(),
          receiptImageUrl: receiptImageBase64 || null,
          couponCode: couponCode || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "حدث خطأ أثناء تسجيل طلب الاشتراك.");
        setIsLoading(false);
        return;
      }

      toast.success("تم إرسال الإيصال للمراجعة بنجاح.");
      onSuccess(
        "تم تسجيل طلب التحويل بنجاح! سيقوم فريق السكرتارية بمراجعة الإيصال وتأكيد الاشتراك خلال دقائق."
      );
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
      {/* Transfer Account Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">عنوان إنستاباي (InstaPay):</span>
          <button
            type="button"
            aria-label={`نسخ عنوان إنستاباي: ${instapayAddress}`}
            onClick={() => copyToClipboard(instapayAddress, "instapay")}
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-mono font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded-md"
          >
            <span>{instapayAddress}</span>
            {copied === "instapay" ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
          <span className="text-slate-600 font-medium">فودافون كاش والمحافظ:</span>
          <button
            type="button"
            aria-label={`نسخ رقم فودافون كاش: ${vodafoneCashNumber}`}
            onClick={() => copyToClipboard(vodafoneCashNumber, "vodafone")}
            className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-mono font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded-md"
          >
            <bdi dir="ltr">{vodafoneCashNumber}</bdi>
            {copied === "vodafone" ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Reference Number Input */}
      <div className="space-y-2 text-right pt-2">
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium text-right space-y-1">
          <span className="font-black block">💡 أين أجد رقم العملية؟</span>
          <p>رقم العملية موجود في أعلى أو أسفل إيصال التحويل. إذا لم تجده، يكفي رفع صورة الإيصال فقط وسيتم قراءته آلياً.</p>
        </div>
        <label htmlFor="refNumberInput" className="text-xs font-semibold text-slate-700 block">
          رقم العملية (اختياري - يساعد في تسريع التأكيد):
        </label>
        <input
          id="refNumberInput"
          type="text"
          dir="ltr"
          inputMode="tel"
          disabled={isLoading}
          placeholder="010xxxxxxxx أو رقم العملية"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white text-left disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Screenshot Upload */}
      <label
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all block relative focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 ${
          receiptUploaded
            ? "border-emerald-500 bg-emerald-50/60"
            : "border-slate-300 hover:border-indigo-500 bg-slate-50"
        }`}
      >
        <input
          type="file"
          aria-label="صورة إيصال التحويل أو السكرين شوت"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <UploadCloud
          className={`w-5 h-5 mx-auto mb-1 ${
            receiptUploaded ? "text-emerald-600" : "text-slate-400"
          }`}
          aria-hidden="true"
        />
        <span className="text-xs font-bold text-slate-800 block">
          {receiptUploaded
            ? "تم إرفاق صورة إيصال التحويل بنجاح ✓ (اضغط للتغيير)"
            : "اضغط هنا لاختيار صورة الإيصال أو السكرين شوت"}
        </span>
        <span className="text-[10px] text-slate-600">PNG, JPG حتى 15 ميجابايت</span>
      </label>

      <Button
        type="submit"
        variant="success"
        size="lg"
        isLoading={isLoading}
        className="w-full shadow-lg shadow-emerald-500/25"
      >
        <EgyptianWalletSvg className="w-5 h-5" aria-hidden="true" />
        <span>{isLoading ? "جاري الإرسال..." : "تأكيد التحويل وإرسال للمراجعة"}</span>
      </Button>
    </form>
  );
}
