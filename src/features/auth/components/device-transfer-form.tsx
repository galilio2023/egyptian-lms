import React from "react";
import { ShieldAlert } from "lucide-react";
import { EgyptianPhoneSvg } from "@/components/ui/illustrated-icons";
import { Button } from "@/components/ui/button";

export interface DeviceTransferFormProps {
  parentPhoneMasked?: string;
  parentPhoneInput: string;
  onParentPhoneChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isTransferring: boolean;
}

export const DeviceTransferForm: React.FC<DeviceTransferFormProps> = ({
  parentPhoneMasked,
  parentPhoneInput,
  onParentPhoneChange,
  onSubmit,
  onCancel,
  isTransferring,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-right">
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-black text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>تنبيه أمان الأجهزة (Single Active Device)</span>
        </div>
        <p className="leading-relaxed font-medium">
          تم تسجيل دخول هذا الحساب سابقاً من جهاز مختلف. لحماية المحتوى ومتابعة ولي الأمر، يرجى كتابة رقم موبايل ولي الأمر المسجل (ينتهي بـ <strong className="font-mono text-slate-900 font-black">{parentPhoneMasked}</strong>) لنقل الحساب إلى هذا الجهاز.
        </p>
      </div>

      <div className="space-y-1.5 text-right">
        <label htmlFor="parent-transfer-phone" className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>رقم موبايل ولي الأمر للتحقق</span>
          <EgyptianPhoneSvg className="w-5 h-5" />
        </label>
        <input
          id="parent-transfer-phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          required
          disabled={isTransferring}
          placeholder="010xxxxxxxx أو 011/012/015"
          value={parentPhoneInput}
          onChange={(e) => onParentPhoneChange(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold"
        />
      </div>

      <Button
        type="submit"
        variant="success"
        size="md"
        isLoading={isTransferring}
        className="w-full"
      >
        <span>تأكيد النقل والدخول إلى الحساب</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isTransferring}
        onClick={onCancel}
        className="w-full"
      >
        إلغاء والعودة لتسجيل الدخول
      </Button>
    </form>
  );
};
