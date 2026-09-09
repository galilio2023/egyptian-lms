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
  const [loginRole, setLoginRole] = React.useState<"student" | "staff">("student");
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
    <div className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border-2 border-purple-200/90 shadow-2xl space-y-5">
      {/* Role Toggle Tabs */}
      <div className="flex p-1 rounded-2xl bg-purple-100/70 border border-purple-200 text-xs font-black" role="tablist" aria-label="نوع تسجيل الدخول">
        <button
          type="button"
          role="tab"
          aria-selected={loginRole === "student"}
          onClick={() => setLoginRole("student")}
          className={`flex-1 py-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 min-h-[44px] ${
            loginRole === "student"
              ? "bg-white text-purple-950 shadow-xs"
              : "text-purple-700 hover:text-purple-950"
          }`}
        >
          👦 دخول الطالب
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={loginRole === "staff"}
          onClick={() => setLoginRole("staff")}
          className={`flex-1 py-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 min-h-[44px] ${
            loginRole === "staff"
              ? "bg-white text-purple-950 shadow-xs"
              : "text-purple-700 hover:text-purple-950"
          }`}
        >
          👨‍🏫 دخول المعلم والإدارة
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center">
          <StudentLoginKeySvg className="w-14 h-14 drop-shadow-sm" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          تسجيل{" "}
          <span className="text-gradient-purple">
            {loginRole === "student" ? "دخول الطالب" : "دخول المعلم والإدارة"}
          </span>
        </h1>
        <p className="text-xs text-purple-700 font-bold">
          {loginRole === "student"
            ? "أدخل رقم موبايل الطالب المسجل وكلمة المرور للمتابعة"
            : "أدخل رقم الموبايل وكلمة المرور للوصول إلى لوحة التحكم الإدارية"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div id="login-error" role="alert" aria-live="assertive" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-right flex items-center gap-2">
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
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          {/* Phone Number Field */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="login-phone" className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>{loginRole === "student" ? "رقم موبايل الطالب (اسم المستخدم)" : "رقم موبايل المعلم / المشرف"}</span>
              <EgyptianPhoneSvg className="w-5 h-5" aria-hidden="true" />
            </label>
            <div className="relative" dir="ltr">
              <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-purple-700 pointer-events-none select-none flex items-center gap-1">
                <span>🇪🇬</span>
                <span className="text-xs text-slate-600 font-normal">مصر</span>
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
                autoComplete="username"
                maxLength={11}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                className="w-full ps-16 pe-4 py-3 min-h-[44px] rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="login-password" className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>كلمة المرور</span>
              <SecurityLockSvg className="w-5 h-5" aria-hidden="true" />
            </label>
            <div className="relative" dir="ltr">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                required
                disabled={isLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full ps-4 pe-11 py-3 min-h-[44px] rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder:text-slate-400 text-base sm:text-xs focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 p-1 rounded-lg transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4 text-purple-600" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="vibrant"
            size="md"
            isLoading={isLoading}
            className="w-full min-h-[44px]"
          >
            <StudentLoginKeySvg className="w-5 h-5" aria-hidden="true" />
            <span>
              {isLoading
                ? "جاري تسجيل الدخول..."
                : loginRole === "student"
                ? "دخول إلى لوحة الطالب"
                : "دخول إلى لوحة الإدارة"}
            </span>
          </Button>
        </form>
      )}

      {/* Dev Mode Quick Access */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs space-y-2">
          <div className="flex items-center justify-between font-black text-[11px] text-amber-900">
            <span>⚡ أدوات التطوير السريعة (Dev Mode)</span>
            <a
              href="/api/dev/session?action=clear"
              className="text-[10px] text-amber-700 hover:text-amber-900 underline"
            >
              مسح الجلسة
            </a>
          </div>
          <div className="text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-xl border border-amber-200/60 space-y-0.5">
            <p className="font-bold">حساب الطالب التجريبي المعتمد:</p>
            <p className="font-mono text-[10px]">الموبايل: <strong className="text-purple-900">01012345678</strong> | كلمة السر: <strong className="text-purple-900">12345678</strong></p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/api/dev/session?role=student"
              className="px-2.5 py-2 text-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-all shadow-xs"
            >
              دخول سريع كطالب 🎓
            </a>
            <a
              href="/api/dev/session?role=admin"
              className="px-2.5 py-2 text-center rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] transition-all shadow-xs"
            >
              دخول سريع كمسؤول 🛡️
            </a>
          </div>
        </div>
      )}

      {/* Links Footer */}
      <div className="pt-4 border-t border-purple-100 flex flex-col gap-2 text-center text-xs font-medium">
        <Link
          href="/student-register"
          className="font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center justify-center gap-1"
        >
          <span>ليس لديك حساب؟ سجّل حساب بطل جديد مجاناً</span>
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
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
