"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Eye, 
  EyeOff, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { signUp } from "@/lib/auth/auth-client";
import { EGYPTIAN_GOVERNORATES, INITIAL_GRADES } from "@/lib/db/mock-data";
import { validateEgyptianPhone } from "@/lib/utils";
import { 
  EliteLogoBadge, 
  StudentRegisterPencilSvg, 
  EgyptianPhoneSvg, 
  SecurityLockSvg, 
  CurriculumBookSvg, 
  XpGemSvg,
  ToyDinoDinoSvg,
  ToyAlligatorGatorSvg,
  WorksheetPdfSvg,
  WhatsAppBubbleSvg,
  ChampionCupSvg
} from "@/components/ui/illustrated-icons";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [fullname, setFullname] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [gradeLevel, setGradeLevel] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateStep1 = () => {
    setError("");
    if (!fullname.trim() || fullname.trim().split(" ").length < 2) {
      setError("يرجى إدخال اسم الطالب ثنائياً على الأقل.");
      return false;
    }
    const cleanStd = validateEgyptianPhone(studentPhone);
    if (!cleanStd) {
      setError("يرجى إدخال رقم موبايل مصري صحيح للطالب مكون من 11 رقم (010, 011, 012, 015).");
      return false;
    }
    return true;
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateStep1()) {
      setStep(1);
      setIsLoading(false);
      return;
    }

    const cleanStd = validateEgyptianPhone(studentPhone);
    const cleanParent = validateEgyptianPhone(parentPhone);
    if (!cleanParent) {
      setError("يرجى إدخال رقم موبايل صحيح لولي الأمر لإرسال تقارير المتابعة والدرجات.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف أو أرقام على الأقل.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      setIsLoading(false);
      return;
    }

    if (!governorate) {
      setError("يرجى اختيار المحافظة.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Generate & cache device token
      let deviceId = "device-dev";
      if (typeof window !== "undefined") {
        deviceId = localStorage.getItem("elite_device_id") || `dev-${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem("elite_device_id", deviceId);
      }

      // 2. Sign Up via Better Auth
      const result = await signUp.email({
        name: fullname.trim(),
        email: `${cleanStd}@elite-academy.edu.eg`,
        password,
        phoneNumber: cleanStd as string,
      });

      if (result?.error) {
        const rawMsg = result.error.message || "";
        if (
          rawMsg.toLowerCase().includes("user already exists") ||
          rawMsg.toLowerCase().includes("email") ||
          rawMsg.toLowerCase().includes("phone")
        ) {
          setError("رقم موبايل الطالب مسجل بالفعل لدينا. يمكنك تسجيل الدخول مباشرة إلى حسابك، أو استخدام رقم موبايل آخر.");
        } else if (rawMsg.toLowerCase().includes("password")) {
          setError("كلمة المرور غير صالحة. يرجى التأكد من كتابة 8 أحرف أو أرقام على الأقل.");
        } else {
          setError(rawMsg || "حدث خطأ أثناء إنشاء الحساب. تأكد من البيانات وحاول مرة أخرى.");
        }
        setIsLoading(false);
        return;
      }

      // 3. Persist student profile extension
      try {
        await fetch("/api/student/register-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: cleanStd as string,
            parentPhoneNumber: cleanParent as string,
            governorate,
            gradeLevel,
            deviceId,
          }),
        });
      } catch (profileErr) {
        console.warn("Profile persistence API warning:", profileErr);
      }

      router.push("/portal/dashboard");
    } catch {
      setError("حدث خطأ في الاتصال بالخادم. تأكد من اتصال الإنترنت وحاول مرة أخرى.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden bg-purple-50/50">
      
      {/* Background Soft Gradients */}
      <div className="absolute top-10 start-1/4 w-96 h-96 bg-purple-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 end-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden border-2 border-purple-200/90 shadow-[0_20px_60px_rgba(139,92,246,0.18)] p-4 sm:p-8 lg:p-10">
        
        {/* Study Treehouse Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
        />
        
        {/* Soft Translucent Overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] -z-10 pointer-events-none" />

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative z-10">
          
          {/* Left Column: Academy Highlights */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6 text-right p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-xl sticky top-8">
            
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <EliteLogoBadge className="w-12 h-12 group-hover:scale-105 transition-transform drop-shadow-sm" />
                <div>
                  <span className="text-base font-black text-slate-900 block leading-tight">
                    أكاديمية <span className="text-gradient-purple">إيليت</span>
                  </span>
                  <span className="text-xs text-purple-700 font-bold">Mr. Ahmed Abdelrahman</span>
                </div>
              </Link>

              <div className="pt-2">
                <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black inline-flex items-center gap-1.5 border border-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>عضوية البطل الجديد</span>
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2 leading-snug">
                  ابدأ رحلتك التعليمية مع مستر أحمد مجاناً 🚀
                </h2>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">
                  سجل بياناتك الآن واستمتع بالمحاضرات الكرتونية التفاعلية، حل الاختبارات، واجمع الجواهر وشهادات التميز.
                </p>
              </div>
            </div>

            {/* Feature Perks */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-purple-50/80 border border-purple-100 text-xs font-bold text-slate-800">
                <WorksheetPdfSvg className="w-6 h-6 shrink-0" />
                <span>ملازم وتمارين شاملة PDF ملونة للطباعة</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50/80 border border-amber-100 text-xs font-bold text-slate-800">
                <ChampionCupSvg className="w-6 h-6 shrink-0" />
                <span>شهادات تفوق رسمية ولوحة شرف لأبطال إيليت</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs font-bold text-slate-800">
                <WhatsAppBubbleSvg className="w-6 h-6 shrink-0" />
                <span>إشعارات واتساب فورية لولي الأمر بالدرجات</span>
              </div>
            </div>

            {/* Playful Pals Spotlight */}
            <div className="flex items-center justify-between pt-2 border-t border-purple-100/80">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 drop-shadow-md animate-float-slow">
                  <ToyDinoDinoSvg className="w-full h-full" />
                </div>
                <div className="w-14 h-14 drop-shadow-md animate-float-reverse">
                  <ToyAlligatorGatorSvg className="w-full h-full" />
                </div>
              </div>
              <span className="text-xs text-purple-800 font-bold bg-purple-100/80 px-3 py-1 rounded-full">
                داينو وجاتور يرحبان بك! 🦕🐊
              </span>
            </div>

          </div>

          {/* Right Column: 2-Step Progressive Form */}
          <div className="lg:col-span-7 w-full">
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

              {/* 2-Step Visual Progress Stepper */}
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
                    if (validateStep1()) setStep(2);
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

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold text-center animate-in fade-in-50" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* STEP 1: Student Profile & Grade */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in-50">
                    
                    {/* Fullname */}
                    <div className="space-y-1.5 text-right">
                      <label htmlFor="reg-fullname" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>اسم الطالب بالكامل (ثنائياً أو رباعياً)</span>
                        <User className="w-4 h-4 text-purple-600" />
                      </label>
                      <input
                        id="reg-fullname"
                        type="text"
                        required
                        disabled={isLoading}
                        placeholder="مثال: أحمد محمود إبراهيم الخولي"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-right font-bold"
                      />
                    </div>

                    {/* Grade Level Selector */}
                    <div className="space-y-1.5 text-right">
                      <label htmlFor="reg-grade" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>المرحلة التعليمية للبطل الصغير</span>
                        <CurriculumBookSvg className="w-5 h-5" />
                      </label>
                      <select
                        id="reg-grade"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-bold"
                      >
                        {INITIAL_GRADES.map((g) => (
                          <option key={g.id} value={String(g.gradeNumber)}>
                            {g.titleArabic} ({g.titleEnglish})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Student Phone */}
                    <div className="space-y-1.5 text-right">
                      <label htmlFor="reg-student-phone" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>رقم موبايل الطالب (اسم المستخدم للدخول)</span>
                        <EgyptianPhoneSvg className="w-5 h-5" />
                      </label>
                      <div className="relative">
                        <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-purple-700 pointer-events-none select-none flex items-center gap-1">
                          <span>🇪🇬</span>
                          <span className="text-[11px] text-slate-400 font-normal">مصر</span>
                        </span>
                        <input
                          id="reg-student-phone"
                          type="tel"
                          inputMode="tel"
                          dir="ltr"
                          required
                          disabled={isLoading}
                          placeholder="010xxxxxxxx أو 011/012/015"
                          value={studentPhone}
                          onChange={(e) => setStudentPhone(e.target.value)}
                          className="w-full ps-16 pe-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Step 1 Next Action */}
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-3.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>متابعة بيانات ولي الأمر والأمان</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Parent Contact & Security */}
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in-50">
                    
                    {/* Parent Phone (WhatsApp) */}
                    <div className="space-y-1.5 text-right">
                      <label htmlFor="reg-parent-phone" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>رقم موبايل ولي الأمر (واتساب للتقارير)</span>
                        <WhatsAppBubbleSvg className="w-5 h-5" />
                      </label>
                      <div className="relative">
                        <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-700 pointer-events-none select-none flex items-center gap-1">
                          <span>🇪🇬</span>
                          <span className="text-[11px] text-slate-400 font-normal">مصر</span>
                        </span>
                        <input
                          id="reg-parent-phone"
                          type="tel"
                          inputMode="tel"
                          dir="ltr"
                          required
                          disabled={isLoading}
                          placeholder="010/011/012/015xxxxxxxx"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="w-full ps-16 pe-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold disabled:opacity-50"
                        />
                      </div>
                      <span className="text-xs text-emerald-700 font-bold block">
                        ✓ ستصلك نتائج الاختبارات والواجبات أسبوعياً عبر الواتساب مباشرة.
                      </span>
                    </div>

                    {/* Governorate */}
                    <div className="space-y-1.5 text-right">
                      <label htmlFor="reg-gov" className="text-xs font-bold text-slate-700">
                        المحافظة
                      </label>
                      <select
                        id="reg-gov"
                        required
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-bold"
                      >
                        <option value="">اختر محافظتك...</option>
                        {EGYPTIAN_GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Passwords Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Password */}
                      <div className="space-y-1.5 text-right">
                        <label htmlFor="reg-password" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>كلمة المرور</span>
                          <SecurityLockSvg className="w-4 h-4" />
                        </label>
                        <div className="relative">
                          <input
                            id="reg-password"
                            type={showPassword ? "text" : "password"}
                            dir="ltr"
                            required
                            disabled={isLoading}
                            placeholder="8 خانات على الأقل"
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
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1.5 text-right">
                        <label htmlFor="reg-confirm-password" className="text-xs font-bold text-slate-700">
                          تأكيد كلمة المرور
                        </label>
                        <div className="relative">
                          <input
                            id="reg-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            dir="ltr"
                            required
                            disabled={isLoading}
                            placeholder="أعد كتابة كلمة المرور"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full ps-4 pe-11 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 p-1 rounded-lg transition-colors cursor-pointer"
                            aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-5 py-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>السابق</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {isLoading ? (
                          <span>جاري إنشاء الحساب...</span>
                        ) : (
                          <>
                            <XpGemSvg className="w-5 h-5 drop-shadow" />
                            <span>إنشاء الحساب وبدء التعلم مجاناً 🎉</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>

              {/* Already have account */}
              <div className="pt-4 border-t border-purple-100 flex flex-col gap-2 text-center text-xs font-medium text-slate-500">
                <div>
                  لديك حساب بالفعل؟{" "}
                  <Link href="/student-login" className="text-purple-700 font-extrabold hover:underline inline-flex items-center gap-1">
                    <span>سجل الدخول من هنا 🔑</span>
                  </Link>
                </div>

                <Link
                  href="/"
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  العودة للصفحة الرئيسية
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
