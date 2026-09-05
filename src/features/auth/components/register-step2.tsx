import React from "react";
import { Eye, EyeOff, ChevronRight, Sparkles } from "lucide-react";
import { EgyptianPhoneSvg, SecurityLockSvg, XpGemSvg } from "@/components/ui/illustrated-icons";
import { Button } from "@/components/ui/button";

export interface RegisterStep2Props {
  parentPhone: string;
  setParentPhone: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const RegisterStep2: React.FC<RegisterStep2Props> = ({
  parentPhone,
  setParentPhone,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onBack,
  isLoading,
}) => {
  return (
    <div className="space-y-4 text-right">
      {/* Parent Phone */}
      <div className="space-y-1.5 text-right">
        <label className="block text-xs font-black text-slate-700">
          رقم موبايل ولي الأمر (واتساب للإشعارات)
        </label>
        <div className="relative">
          <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <EgyptianPhoneSvg className="w-4 h-4" />
          </div>
          <input
            type="tel"
            dir="ltr"
            required
            maxLength={11}
            placeholder="010xxxxxxxx"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ""))}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold focus:outline-none focus:border-purple-600 text-right"
          />
        </div>
        <p className="text-[10px] text-emerald-700 font-bold">
          📲 مهم جداً: ترسل عليه درجات الاختبارات الأسبوعية وتنبيهات الحصص عبر واتساب مباشرة.
        </p>
      </div>

      {/* Password */}
      <div className="space-y-1.5 text-right">
        <label className="block text-xs font-black text-slate-700">
          كلمة المرور (8 أحرف أو أرقام على الأقل)
        </label>
        <div className="relative">
          <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <SecurityLockSvg className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            dir="ltr"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full ps-10 pe-10 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-purple-600 text-right"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-600" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5 text-right">
        <label className="block text-xs font-black text-slate-700">
          تأكيد كلمة المرور
        </label>
        <div className="relative">
          <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <SecurityLockSvg className="w-4 h-4" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            dir="ltr"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full ps-10 pe-10 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-purple-600 text-right"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-600" />}
          </button>
        </div>
      </div>

      {/* Single Device Lock Safety Notice */}
      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-right space-y-1 text-amber-900">
        <span className="text-xs font-black block">🛡️ سياسة حماية الحساب (جهاز واحد نشط):</span>
        <p className="text-[11px] leading-relaxed font-medium">
          يتم ربط حساب الطالب بالجهاز الذي يسجل منه أول مرة لضمان أمان المحاضرات وعدم مشاركة الحساب.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onBack}
          className="flex items-center gap-1.5"
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابق</span>
        </Button>

        <Button
          type="submit"
          variant="vibrant"
          size="md"
          isLoading={isLoading}
          className="flex-1"
        >
          <XpGemSvg className="w-4 h-4" />
          <span>تأكيد تسجيل حساب البطل الجديد</span>
        </Button>
      </div>
    </div>
  );
};
