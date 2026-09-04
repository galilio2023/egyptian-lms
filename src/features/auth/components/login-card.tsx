"use client";

import React from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { 
  StudentLoginKeySvg, 
  EgyptianPhoneSvg, 
  SecurityLockSvg 
} from "@/components/ui/illustrated-icons";
import { Button } from "@/components/ui/button";
import { DeviceTransferForm } from "./device-transfer-form";
import { useLoginForm } from "../hooks/use-login-form";

export const LoginCard: React.FC = () => {
  const {
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    deviceLockedInfo,
    parentPhoneInput,
    setParentPhoneInput,
    isTransferring,
    handleLogin,
    handleParentTransferConfirm,
    handleCancelTransfer,
  } = useLoginForm();

  return (
    <div className="modern-card bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border-2 border-purple-200/90 shadow-2xl space-y-5">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center">
          <StudentLoginKeySvg className="w-14 h-14 drop-shadow-sm" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          تسجيل <span className="text-gradient-purple">دخول الطالب</span>
        </h1>
        <p className="text-xs text-purple-700 font-bold">
          أدخل رقم موبايل الطالب المسجل وكلمة المرور للمتابعة
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-right flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Device Transfer Form OR Login Form */}
      {deviceLockedInfo?.requiresParentTransfer ? (
        <DeviceTransferForm
          parentPhoneMasked={deviceLockedInfo.parentPhoneMasked}
          parentPhoneInput={parentPhoneInput}
          onParentPhoneChange={setParentPhoneInput}
          onSubmit={handleParentTransferConfirm}
          onCancel={handleCancelTransfer}
          isTransferring={isTransferring}
        />
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Phone Number Field */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="login-phone" className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>رقم موبايل الطالب (اسم المستخدم)</span>
              <EgyptianPhoneSvg className="w-5 h-5" />
            </label>
            <div className="relative">
              <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-purple-700 pointer-events-none select-none flex items-center gap-1">
                <span>🇪🇬</span>
                <span className="text-[11px] text-slate-400 font-normal">مصر</span>
              </span>
              <input
                id="login-phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                required
                disabled={isLoading}
                placeholder="010xxxxxxxx أو 011/012/015"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full ps-16 pe-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="login-password" className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>كلمة المرور</span>
              <SecurityLockSvg className="w-5 h-5" />
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                required
                disabled={isLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full ps-4 pe-11 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 p-1 rounded-lg transition-colors cursor-pointer"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-600" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="vibrant"
            size="md"
            isLoading={isLoading}
            className="w-full"
          >
            <StudentLoginKeySvg className="w-5 h-5" />
            <span>{isLoading ? "جاري تسجيل الدخول..." : "دخول إلى لوحة الطالب"}</span>
          </Button>
        </form>
      )}

      {/* Links Footer */}
      <div className="pt-4 border-t border-purple-100 flex flex-col gap-2 text-center text-xs font-medium">
        <Link
          href="/student-register"
          className="font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center justify-center gap-1"
        >
          <span>ليس لديك حساب؟ سجّل حساب بطل جديد مجاناً</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
};
