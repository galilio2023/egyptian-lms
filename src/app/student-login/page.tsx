"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, Sparkles, ShieldAlert } from "lucide-react";
import { signIn, signOut } from "@/lib/auth/auth-client";
import { validateEgyptianPhone } from "@/lib/utils";
import { 
  EliteLogoBadge, 
  StudentLoginKeySvg, 
  EgyptianPhoneSvg, 
  SecurityLockSvg,
  ToyHappyPearSvg,
  ToyTeddyBearSvg,
  PhonicsSpeechSvg,
  ChampionCupSvg,
  WhatsAppBubbleSvg
} from "@/components/ui/illustrated-icons";

export default function StudentLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal/dashboard";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceLockedInfo, setDeviceLockedInfo] = useState<{ requiresParentTransfer?: boolean; parentPhoneMasked?: string } | null>(null);
  const [parentPhoneInput, setParentPhoneInput] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate Egyptian phone number (010, 011, 012, 015)
    const cleanPhone = validateEgyptianPhone(phoneNumber);
    if (!cleanPhone) {
      setError("يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقم (010, 011, 012, 015).");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف أو أرقام على الأقل.");
      setIsLoading(false);
      return;
    }

    try {
      // Single active device identifier
      let deviceId = "device-dev";
      if (typeof window !== "undefined") {
        deviceId = localStorage.getItem("elite_device_id") || `dev-${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem("elite_device_id", deviceId);
      }

      const result = await signIn.email({
        email: `${cleanPhone}@elite-academy.edu.eg`,
        password,
      });

      if (result.error) {
        setError(result.error.message || "رقم الموبايل أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مرة أخرى.");
        setIsLoading(false);
        return;
      }

      // Verify single active device lock with backend
      try {
        const deviceRes = await fetch("/api/auth/verify-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            phoneNumber: cleanPhone,
          }),
        });
        const deviceData = await deviceRes.json();

        if (!deviceRes.ok || deviceData.error) {
          if (deviceData.deviceLocked && deviceData.requiresParentTransfer) {
            setDeviceLockedInfo({
              requiresParentTransfer: true,
              parentPhoneMasked: deviceData.parentPhoneMasked,
            });
            setIsLoading(false);
            return;
          }

          // If banned or locked without transfer option, revoke session immediately
          try {
            await signOut();
          } catch {
            // Ignore signout error
          }
          setError(deviceData.error || "حساب الطالب مسجل على جهاز آخر. يرجى مراجعة إدارة الأكاديمية.");
          setIsLoading(false);
          return;
        }
      } catch (deviceCheckErr) {
        console.warn("Device verification network warning:", deviceCheckErr);
      }

      toast.success("تم تسجيل الدخول بنجاح! مرحباً بك في أكاديمية إيليت.");
      router.push(callbackUrl);
    } catch {
      setError("حدث خطأ في الاتصال بالخادم. تأكد من اتصال الإنترنت وحاول مرة أخرى.");
      setIsLoading(false);
    }
  };

  const handleParentTransferConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    try {
      let deviceId = "device-dev";
      if (typeof window !== "undefined") {
        deviceId = localStorage.getItem("elite_device_id") || "device-dev";
      }

      const res = await fetch("/api/auth/verify-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          phoneNumber: validateEgyptianPhone(phoneNumber),
          parentConfirmationPhone: parentPhoneInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "رقم هاتف ولي الأمر غير متطابق.");
        setIsTransferring(false);
        return;
      }

      toast.success("تم تأكيد ولي الأمر ونقل الحساب لهذا الجهاز بنجاح! 🎉");
      setDeviceLockedInfo(null);
      router.push(callbackUrl);
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCancelTransfer = async () => {
    try {
      await signOut();
    } catch {
      // Ignore
    }
    setDeviceLockedInfo(null);
    setParentPhoneInput("");
    setError("تم إلغاء نقل الجهاز.");
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden bg-purple-50/50">
      
      {/* Soft Ambient Blobs */}
      <div className="absolute top-10 start-1/4 w-96 h-96 bg-purple-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 end-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Bigger Elevated Container Framing the Component with the Magical Image */}
      <div className="w-full max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden border-2 border-purple-200/90 shadow-[0_20px_60px_rgba(139,92,246,0.18)] p-4 sm:p-8 lg:p-10">
        
        {/* Magical Study Treehouse Background Image on the Bigger Container */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
        />
        
        {/* Soft Translucent Overlay */}
        <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px] -z-10 pointer-events-none" />

        {/* Interior Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          
          {/* Left Hero Column: Academy Highlights & Cheerful Pals */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 text-right p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl">
            
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <EliteLogoBadge className="w-12 h-12 group-hover:scale-105 transition-transform drop-shadow-sm" />
                <div>
                  <span className="text-base font-black text-slate-900 block leading-tight">
                    أكاديمية <span className="text-gradient-purple">إيليت</span>
                  </span>
                  <span className="text-[11px] text-purple-700 font-bold">Mr. Ahmed Abdelrahman</span>
                </div>
              </Link>

              <div className="pt-2">
                <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-[11px] font-black inline-flex items-center gap-1.5 border border-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>بوابة الأبطال الصغار</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 leading-snug">
                  أهلاً بك يا بطل! ادخل واستكمل مغامرتك التعليمية 🚀
                </h2>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">
                  شاهد الشرح التفاعلي، استمع لنطق الكلمات، وحل الاختبارات لجمع الجواهر وشهادات التميز.
                </p>
              </div>
            </div>

            {/* Feature Perks */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs font-bold text-slate-800">
                <PhonicsSpeechSvg className="w-6 h-6 shrink-0" />
                <span>تدريبات Phonics ونطق صوتي مباشر لكل كلمة</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs font-bold text-slate-800">
                <ChampionCupSvg className="w-6 h-6 shrink-0" />
                <span>شهادات إيليت معتمدة عند تحقيق 80% فأكثر</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs font-bold text-slate-800">
                <WhatsAppBubbleSvg className="w-6 h-6 shrink-0" />
                <span>إشعار تلقائي لولي الأمر بعد كل اختبار</span>
              </div>
            </div>

            {/* Playful Pals Spotlight */}
            <div className="flex items-center justify-between pt-2 border-t border-purple-100/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 drop-shadow-md animate-float-slow">
                  <ToyHappyPearSvg className="w-full h-full" />
                </div>
                <div className="w-12 h-12 drop-shadow-md animate-float-reverse">
                  <ToyTeddyBearSvg className="w-full h-full" />
                </div>
              </div>
              <span className="text-[11px] text-purple-800 font-bold bg-purple-100/70 px-3 py-1 rounded-full">
                أصدقاء إيليت ينتظرونك ✨
              </span>
            </div>

          </div>

          {/* Right Column: Clean Frosted Glass Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="modern-card bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border-2 border-purple-200/90 shadow-2xl space-y-5">
              
              {/* Card Header for Mobile */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <StudentLoginKeySvg className="w-14 h-14 drop-shadow-sm" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">
                  تسجيل دخول <span className="text-gradient-purple">الطالب</span>
                </h1>
                <p className="text-xs text-purple-700 font-bold">
                  سجّل دخولك للوصول إلى دروسك واختباراتك مع مستر أحمد
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold text-center" role="alert">
                  {error}
                </div>
              )}

              {deviceLockedInfo ? (
                <form onSubmit={handleParentTransferConfirm} className="space-y-4 text-right">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-black text-sm text-amber-900">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>تأكيد نقل الحساب إلى هذا الجهاز</span>
                    </div>
                    <p className="leading-relaxed text-amber-800">
                      هذا الحساب مسجل حالياً على جهاز آخر. لنقل الحساب ومتابعة المذاكرة من هذا الجهاز، يرجى إدخال رقم ولي الأمر المسجل (ينتهي بـ <bdi dir="ltr" className="font-mono font-black text-amber-950">{deviceLockedInfo.parentPhoneMasked}</bdi>):
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="parent-confirm-phone" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>رقم موبايل ولي الأمر المسجل</span>
                      <EgyptianPhoneSvg className="w-5 h-5" />
                    </label>
                    <input
                      id="parent-confirm-phone"
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      required
                      disabled={isTransferring}
                      placeholder="010xxxxxxxx"
                      value={parentPhoneInput}
                      onChange={(e) => setParentPhoneInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-purple-50/50 border border-purple-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-left font-mono font-bold disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="w-full py-3.5 px-4 rounded-2xl text-white font-black text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.02] shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{isTransferring ? "جاري التحقق ونقل الحساب..." : "تأكيد النقل والدخول إلى الحساب"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelTransfer}
                    disabled={isTransferring}
                    className="w-full py-2.5 px-4 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
                  >
                    إلغاء والعودة لتسجيل الدخول
                  </button>
                </form>
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
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl text-white font-black text-xs bg-gradient-vibrant hover:scale-[1.02] shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <StudentLoginKeySvg className="w-5 h-5" />
                    <span>{isLoading ? "جاري تسجيل الدخول..." : "دخول إلى لوحة الطالب"}</span>
                  </button>
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
          </div>

        </div>

      </div>

    </div>
  );
}
