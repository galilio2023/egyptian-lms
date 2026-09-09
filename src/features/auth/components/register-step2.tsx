import React from "react";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
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
        <label htmlFor="register-parent-phone" className="block text-xs font-black text-slate-700 cursor-pointer">
          رقم موبايل ولي الأمر (واتساب للإشعارات)
        </label>
        <div className="relative" dir="ltr">
          <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <EgyptianPhoneSvg className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="register-parent-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            required
            maxLength={11}
            placeholder="010xxxxxxxx"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ""))}
            aria-describedby="parent-phone-desc"
            className="w-full min-h-[44px] ps-10 pe-4 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs font-mono font-bold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-left transition-all"
          />
        </div>
        <p id="parent-phone-desc" className="text-[10px] text-emerald-700 font-bold">
          📲 مهم جداً: ترسل عليه درجات الاختبارات الأسبوعية وتنبيهات الحصص عبر واتساب مباشرة.
        </p>
      </div>

      {/* Password */}
      <div className="space-y-1.5 text-right">
        <label htmlFor="register-password" className="block text-xs font-black text-slate-700 cursor-pointer">
          كلمة المرور (8 أحرف أو أرقام على الأقل)
        </label>
        <div className="relative" dir="ltr">
          <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <SecurityLockSvg className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            dir="ltr"
            required
            minLength={8}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-[44px] ps-10 pe-11 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs font-mono font-bold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-left transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg min-h-[44px] flex items-center justify-center"
          >
            {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4 text-purple-600" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5 text-right">
        <label htmlFor="register-confirm-password" className="block text-xs font-black text-slate-700 cursor-pointer">
          تأكيد كلمة المرور
        </label>
        <div className="relative" dir="ltr">
          <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <SecurityLockSvg className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            dir="ltr"
            required
            minLength={8}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full min-h-[44px] ps-10 pe-11 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs font-mono font-bold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-left transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg min-h-[44px] flex items-center justify-center"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4 text-purple-600" aria-hidden="true" />}
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
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span>السابق</span>
        </Button>

        <Button
          type="submit"
          variant="vibrant"
          size="md"
          isLoading={isLoading}
          className="flex-1 min-h-[44px]"
        >
          <XpGemSvg className="w-4 h-4" aria-hidden="true" />
          <span>تأكيد تسجيل حساب البطل الجديد</span>
        </Button>
      </div>
    </div>
  );
};
