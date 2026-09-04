"use client";

import { useState } from "react";
import { Printer, Copy, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { 
  CenterVoucherCardSvg, 
  EliteLogoBadge 
} from "@/components/ui/illustrated-icons";

interface GeneratedVoucher {
  code: string;
  serialNumber: string;
  gradeTitle: string;
  priceEgp: number;
}

export function BatchVoucherGeneratorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [grade, setGrade] = useState("1");
  const [quantity, setQuantity] = useState(10);
  const [price, setPrice] = useState(150);
  const [generatedVouchers, setGeneratedVouchers] = useState<GeneratedVoucher[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const generateVouchers = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_secure_vouchers",
          payload: {
            gradeNumber: parseInt(grade, 10),
            quantity,
            priceEgp: price,
            batchName: `دفعة سناتر الصف ${grade} - مشفرة عالي الأمان (${new Date().toLocaleDateString("ar-EG")})`,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.vouchers && data.vouchers.length > 0) {
          setGeneratedVouchers(data.vouchers);
          toast.success(`🎉 تم توليد وحفظ ${data.vouchers.length} كارت شحن عالي التشفير بنجاح!`);
          return;
        }
      }
      toast.error("تعذر توليد كروت الشحن، يرجى المحاولة لاحقاً.");
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyAllCodes = () => {
    const text = generatedVouchers.map((v) => `${v.serialNumber}: ${v.code}`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ جميع الأكواد إلى الحافظة!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border-2 border-purple-200 print:border-0 print:shadow-none print:max-w-none print:w-full">
        
        {/* Header */}
        <div className="print:hidden p-5 bg-gradient-vibrant text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CenterVoucherCardSvg className="w-8 h-8" />
            <div>
              <h2 className="text-base font-black">مولد كروت السنتر المطبوعة (Batch Vouchers)</h2>
              <span className="text-xs text-purple-100 font-medium">توليد وطباعة كروت الشحن للأكاديمية والسناتر الخارجية</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Generator Controls - Hidden in print */}
        <div className="print:hidden p-6 space-y-6 border-b border-purple-100 bg-purple-50/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Grade Level */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-700">المرحلة الدراسية</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="1">الصف الأول الابتدائي (Grade 1)</option>
                <option value="2">الصف الثاني الابتدائي (Grade 2)</option>
                <option value="3">الصف الثالث الابتدائي (Grade 3)</option>
                <option value="4">الصف الرابع الابتدائي (Grade 4)</option>
                <option value="5">الصف الخامس الابتدائي (Grade 5)</option>
                <option value="6">الصف السادس الابتدائي (Grade 6)</option>
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-700">الكمية المراد توليدها</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value={10}>10 كروت (تجريبي)</option>
                <option value={20}>20 كارت (دفعة سنتر صغيرة)</option>
                <option value={50}>50 كارت (دفعة سنتر متوسطة)</option>
                <option value={100}>100 كارت (دفعة سنتر كبيرة)</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-700">سعر الكارت للمطبعة (ج.م)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800"
              />
            </div>

          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={generateVouchers}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-vibrant hover:scale-105 text-white font-black text-xs shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSaving ? "جاري التوليد والحفظ..." : "توليد كروت الشحن الآن ✨"}</span>
            </button>

            {generatedVouchers.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAllCodes}
                  className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold text-xs hover:bg-purple-50 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ جميع الأكواد</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة شيت الكروت (A4)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Printable Scratch Cards Sheet Canvas */}
        <div className="p-6 max-h-[60vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          {generatedVouchers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CenterVoucherCardSvg className="w-16 h-16 mx-auto opacity-50" />
              <p className="text-xs font-bold">اضغط على زر التوليد بالأعلى لعرض ومعاينة شيت الكروت المطبوعة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4">
              {generatedVouchers.map((v, idx) => (
                <div
                  key={idx}
                  className="border-2 border-purple-200 rounded-2xl p-4 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 relative overflow-hidden text-right shadow-sm print:shadow-none print:border-slate-800 print:break-inside-avoid"
                >
                  {/* Card Top */}
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <div className="flex items-center gap-2">
                      <EliteLogoBadge className="w-8 h-8" />
                      <div>
                        <span className="font-black text-xs text-slate-900 block leading-tight">أكاديمية إيليت</span>
                        <span className="text-[9px] text-purple-700 font-bold">{v.gradeTitle}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                      {v.priceEgp} ج.م
                    </span>
                  </div>

                  {/* Scratch-off Silver Foil Mockup */}
                  <div className="py-3 text-center">
                    <span className="text-[9px] text-slate-400 font-bold block mb-1">امسح هنا برفق لإظهار كود التفعيل:</span>
                    <div className="p-2.5 rounded-xl bg-slate-200 border-2 border-dashed border-slate-400 inline-block min-w-[200px] shadow-inner font-mono font-black text-sm tracking-widest text-slate-900 select-all">
                      {v.code}
                    </div>
                  </div>

                  {/* Card Bottom / Barcode Mockup */}
                  <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-[9px] text-slate-500 font-medium">
                    <span className="font-mono font-bold text-slate-700">{v.serialNumber}</span>
                    <span>التفعيل: elite-academy.eg</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
