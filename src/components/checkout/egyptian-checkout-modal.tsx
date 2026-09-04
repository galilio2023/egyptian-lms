"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import type { MockUnit } from "@/lib/db/mock-data";
import { 
  CenterVoucherCardSvg, 
  EgyptianWalletSvg, 
  XpGemSvg 
} from "@/components/ui/illustrated-icons";

interface EgyptianCheckoutModalProps {
  unit: MockUnit;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EgyptianCheckoutModal({
  unit,
  isOpen,
  onClose,
  onSuccess,
}: EgyptianCheckoutModalProps) {
  const [method, setMethod] = useState<'voucher_card' | 'instapay_manual' | 'paymob_wallet'>('voucher_card');
  const [copied, setCopied] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptImageBase64, setReceiptImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("تم نسخ الرقم بنجاح!");
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Center Scratch Card Redemption
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

      setSuccessMessage(data.message || "تم شحن الكود وتفعيل الوحدة بنجاح!");
      setIsSubmitted(true);
      toast.success("🎉 تم تفعيل الكورس فوراً!");
      setTimeout(() => onSuccess?.(), 2000);
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const compressReceiptImage = (file: File, maxDim = 1400, quality = 0.80): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle actual file upload and read as data URL with compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً.");
      return;
    }

    const toastId = toast.loading("جاري معالجة وضغط صورة الإيصال...");
    try {
      const compressedDataUrl = await compressReceiptImage(file);
      setReceiptUploaded(true);
      setReceiptImageBase64(compressedDataUrl);
      toast.dismiss(toastId);
      toast.success("تم إرفاق صورة الإيصال بنجاح ✓");
    } catch {
      toast.dismiss(toastId);
      toast.error("تعذر قراءة ملف الصورة.");
    }
  };

  // 2. Manual InstaPay / Vodafone Cash Receipt Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      toast.error("يرجى إدخال رقم العملية أو رقم المحفظة المحول منها.");
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
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "حدث خطأ أثناء تسجيل طلب الاشتراك.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("تم تسجيل طلب التحويل بنجاح! سيقوم فريق السكرتارية بمراجعة الإيصال وتأكيد الاشتراك خلال دقائق.");
      setIsSubmitted(true);
      toast.success("تم إرسال الإيصال للمراجعة بنجاح.");
      setTimeout(() => onSuccess?.(), 2200);
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Paymob Instant Gateway
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
        // Redirect to Paymob secure checkout if URL provided
        window.location.href = data.paymobCheckoutUrl;
        return;
      }

      setSuccessMessage("تم إنشاء طلب الدفع عبر باي موب بنجاح برقم (" + (data.orderId || "قيد الانتظار") + "). يرجى استكمال عملية الدفع عبر البوابة.");
      setIsSubmitted(true);
      toast.info("تم تسجيل طلب الدفع بنجاح.");
      setTimeout(() => onSuccess?.(), 2500);
    } catch {
      toast.error("تعذر الاتصال ببوابة الدفع.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in-50">
      <div className="modern-card w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 border-2 border-purple-200 shadow-2xl bg-white relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <span className="text-xs font-black text-purple-800 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>تفعيل الاشتراك الفوري للبطل</span>
          </span>
          <h3 className="text-xl font-black text-slate-900 pt-1.5">{unit.title}</h3>
          <p className="text-xs text-slate-500 font-medium">{unit.gradeTitle} • {unit.description}</p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-gradient-purple">{unit.priceEgp} ج.م</span>
            <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">/ للوحدة كاملة</span>
          </div>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-black text-slate-900">تم تفعيل الاشتراك بنجاح!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition-all"
            >
              الذهاب إلى كورس الطالب 🚀
            </button>
          </div>
        ) : (
          <>
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Scratch Card */}
              <button
                type="button"
                onClick={() => setMethod('voucher_card')}
                className={`p-3 rounded-2xl text-center transition-all flex flex-col items-center gap-1.5 border-2 ${
                  method === 'voucher_card'
                    ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-md ring-2 ring-purple-100 font-black'
                    : 'bg-white border-purple-100 text-slate-600 hover:bg-purple-50/50 text-xs'
                }`}
              >
                <CenterVoucherCardSvg className="w-8 h-8" />
                <span className="text-[11px] font-black">كارت السنتر</span>
                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">شحن فوري</span>
              </button>

              {/* InstaPay / Cash */}
              <button
                type="button"
                onClick={() => setMethod('instapay_manual')}
                className={`p-3 rounded-2xl text-center transition-all flex flex-col items-center gap-1.5 border-2 ${
                  method === 'instapay_manual'
                    ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-md ring-2 ring-purple-100 font-black'
                    : 'bg-white border-purple-100 text-slate-600 hover:bg-purple-50/50 text-xs'
                }`}
              >
                <EgyptianWalletSvg className="w-8 h-8" />
                <span className="text-[11px] font-black">إنستاباي / كاش</span>
                <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-1.5 rounded">تحويل يدوي</span>
              </button>

              {/* Paymob */}
              <button
                type="button"
                onClick={() => setMethod('paymob_wallet')}
                className={`p-3 rounded-2xl text-center transition-all flex flex-col items-center gap-1.5 border-2 ${
                  method === 'paymob_wallet'
                    ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-md ring-2 ring-purple-100 font-black'
                    : 'bg-white border-purple-100 text-slate-600 hover:bg-purple-50/50 text-xs'
                }`}
              >
                <XpGemSvg className="w-8 h-8" />
                <span className="text-[11px] font-black">باي موب / فيزا</span>
                <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded">دفع آمن</span>
              </button>
            </div>

            {/* Method 1: Voucher Card */}
            {method === 'voucher_card' && (
              <form onSubmit={handleVoucherSubmit} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                  إذا قمت بشراء كارت الشحن من السنتر أو المكتبة، أدخل الكود المطبوع على الكارت للشحن الفوري.
                </div>

                <div className="space-y-1 text-right">
                  <label className="text-xs font-semibold text-slate-700">
                    كود كارت الشحن (12 رقم / حروف):
                  </label>
                  <input
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  <CenterVoucherCardSvg className="w-5 h-5" />
                  <span>{isLoading ? "جاري تفعيل الكود..." : "شحن الكود وتفعيل الوحدة"}</span>
                </button>
              </form>
            )}

            {/* Method 2: Manual InstaPay */}
            {method === 'instapay_manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-3.5">
                
                {/* Transfer Account Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">عنوان إنستاباي (InstaPay):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('elite.academy@instapay')}
                      className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-mono font-bold"
                    >
                      elite.academy@instapay
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                    <span className="text-slate-600 font-medium">فودافون كاش والمحافظ:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01020003000')}
                      className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-mono font-bold"
                    >
                      01020003000
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Reference Number Input */}
                <div className="space-y-1 text-right">
                  <label className="text-xs font-semibold text-slate-700">
                    رقم العملية أو رقم الموبايل المحول منه:
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    inputMode="tel"
                    required
                    disabled={isLoading}
                    placeholder="010xxxxxxxx أو رقم العملية"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white text-left"
                  />
                </div>

                {/* Screenshot Upload with Real File Input */}
                <label className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all block relative ${
                  receiptUploaded
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : 'border-slate-300 hover:border-indigo-500 bg-slate-50'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className={`w-5 h-5 mx-auto mb-1 ${receiptUploaded ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-800 block">
                    {receiptUploaded ? "تم إرفاق صورة إيصال التحويل بنجاح ✓ (اضغط للتغيير)" : "اضغط هنا لاختيار صورة الإيصال أو السكرين شوت"}
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG حتى 5 ميجابايت</span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  <EgyptianWalletSvg className="w-5 h-5" />
                  <span>{isLoading ? "جاري الإرسال..." : "تأكيد التحويل وإرسال للمراجعة"}</span>
                </button>
              </form>
            )}

            {/* Method 3: Paymob Online */}
            {method === 'paymob_wallet' && (
              <div className="space-y-3.5 text-center py-2">
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 leading-relaxed font-medium">
                  سيتم تحويلك إلى بوابة الدفع الإلكتروني المعتمدة (باي موب) لإتمام الدفع الآمن بالمحافظ أو البطاقات وتفعيل الكورس لحظياً.
                </div>
                <button
                  type="button"
                  onClick={handlePaymobSubmit}
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  <XpGemSvg className="w-5 h-5 drop-shadow" />
                  <span>{isLoading ? "جاري الاتصال بالبوابة..." : `الانتقال للدفع الآمن (${unit.priceEgp} ج.م)`}</span>
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
