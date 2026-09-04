"use client";

import React from "react";
import Link from "next/link";
import { StudentRegisterPencilSvg } from "@/components/ui/illustrated-icons";
import { RegisterStep1 } from "./register-step1";
import { RegisterStep2 } from "./register-step2";
import { useRegisterForm } from "../hooks/use-register-form";

export const RegisterCard: React.FC = () => {
  const {
    step,
    setStep,
    fullname,
    setFullname,
    studentPhone,
    setStudentPhone,
    parentPhone,
    setParentPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    governorate,
    setGovernorate,
    gradeLevel,
    setGradeLevel,
    isLoading,
    error,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleNextStep,
    handleRegister,
  } = useRegisterForm();

  return (
    <div className="modern-card bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border-2 border-purple-200/90 shadow-2xl space-y-5">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center">
          <StudentRegisterPencilSvg className="w-14 h-14 drop-shadow-sm" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          إنشاء حساب <span className="text-gradient-purple">بطل جديد ✨</span>
        </h1>
        <p className="text-xs text-purple-700 font-bold">
          خطوتان بسيطتان لبدء التعلم الممتع مع مستر أحمد عبد الرحمن
        </p>
      </div>

      {/* Stepper Tabs */}
      <div className="bg-purple-50/70 border border-purple-100 p-2 sm:p-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer ${
            step === 1 
              ? "bg-white text-purple-900 font-black shadow-sm border border-purple-200" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
            step === 1 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700"
          }`}>
            1
          </span>
          <span>بيانات الطالب والصف</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (fullname.trim() && studentPhone.trim()) setStep(2);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer ${
            step === 2 
              ? "bg-white text-purple-900 font-black shadow-sm border border-purple-200" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
            step === 2 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700"
          }`}>
            2
          </span>
          <span>ولي الأمر والأمان</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-right flex items-center gap-2 animate-shake">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister}>
        {step === 1 ? (
          <RegisterStep1
            fullname={fullname}
            setFullname={setFullname}
            studentPhone={studentPhone}
            setStudentPhone={setStudentPhone}
            governorate={governorate}
            setGovernorate={setGovernorate}
            gradeLevel={gradeLevel}
            setGradeLevel={setGradeLevel}
            onNext={handleNextStep}
          />
        ) : (
          <RegisterStep2
            parentPhone={parentPhone}
            setParentPhone={setParentPhone}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onBack={() => setStep(1)}
            isLoading={isLoading}
          />
        )}
      </form>

      {/* Bottom Login Link */}
      <div className="pt-4 border-t border-purple-100 text-center text-xs font-medium">
        <span className="text-slate-500">لديك حساب بالفعل في الأكاديمية؟ </span>
        <Link
          href="/student-login"
          className="font-bold text-purple-700 hover:text-purple-900 hover:underline"
        >
          سجّل الدخول الآن مباشرة
        </Link>
      </div>
    </div>
  );
};
