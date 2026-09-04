import React from "react";
import { Sparkles, Copy, Printer } from "lucide-react";

export interface VoucherControlsFormProps {
  grade: string;
  onGradeChange: (v: string) => void;
  quantity: number;
  onQuantityChange: (v: number) => void;
  price: number;
  onPriceChange: (v: number) => void;
  isSaving: boolean;
  hasVouchers: boolean;
  onGenerate: () => void;
  onCopyAll: () => void;
  onPrint: () => void;
}

export const VoucherControlsForm: React.FC<VoucherControlsFormProps> = ({
  grade,
  onGradeChange,
  quantity,
  onQuantityChange,
  price,
  onPriceChange,
  isSaving,
  hasVouchers,
  onGenerate,
  onCopyAll,
  onPrint,
}) => {
  return (
    <div className="print:hidden p-6 space-y-6 border-b border-purple-100 bg-purple-50/40">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Grade Level */}
        <div className="space-y-1 text-right">
          <label className="text-xs font-bold text-slate-700">المرحلة الدراسية</label>
          <select
            value={grade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
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
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
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
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-gradient-vibrant hover:scale-105 text-white font-black text-xs shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isSaving ? "جاري التوليد والحفظ..." : "توليد كروت الشحن الآن ✨"}</span>
        </button>

        {hasVouchers && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopyAll}
              className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold text-xs hover:bg-purple-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ جميع الأكواد</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة شيت الكروت (A4)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
