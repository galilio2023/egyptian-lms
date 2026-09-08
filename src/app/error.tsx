"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Home, MessageCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { MascotFixerErrorSvg } from "@/components/ui/error-illustrations";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    console.error("Next.js App Router Error caught by boundary:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  const handleReset = () => {
    setIsResetting(true);
    try {
      reset();
    } finally {
      setTimeout(() => setIsResetting(false), 800);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `السلام عليكم، واجهت خطأ تقني في المنصة التعليمية.\nرمز الخطأ: ${error.digest || "غير محدد"}\nرسالة الخلل: ${error.message || "Unknown error"}`
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-950 to-slate-950 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/4 start-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 end-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 border-2 border-purple-400/30 shadow-2xl bg-white/5 backdrop-blur-xl text-center relative z-10 my-auto">
        {/* Visual Fixer Mascot */}
        <div className="animate-float-slow inline-block mx-auto">
          <MascotFixerErrorSvg className="w-48 h-40 sm:w-56 sm:h-48 mx-auto drop-shadow-xl" />
        </div>

        {/* Badge & Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-black shadow-inner">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>خلل تقني مؤقت • Application Error</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
            أوه! حدث خلل تقني مفاجئ 🛠️⚙️
          </h1>

          <p className="text-xs sm:text-sm text-purple-200/80 font-medium leading-relaxed max-w-md mx-auto">
            لا تقلق يا بطل، تقدمك وبياناتك في أمان تام. يمكنك إعادة المحاولة فوراً وسيعود كل شيء للعمل بشكل طبيعي.
          </p>
        </div>

        {/* Error Digest Code Box (Secure & Anonymous) */}
        {error.digest && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-purple-200 font-mono flex items-center justify-center gap-2">
            <span className="text-[11px] text-slate-400">رمز التحقق الفني (Digest):</span>
            <span className="text-amber-300 font-bold selection:bg-amber-300 selection:text-slate-900">{error.digest}</span>
          </div>
        )}

        {/* Safety Guarantee */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>جلسة الطالب ومستويات الـ XP محفوظة بالكامل</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
            <span>{isResetting ? "جاري إعادة التحميل..." : "إعادة المحاولة الآن"}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>الرئيسية</span>
          </Link>
        </div>

        {/* WhatsApp Support Link */}
        <div className="pt-1">
          <a
            href={`https://wa.me/201000000000?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>تواصل مع الدعم الفني عبر واتساب لمساعدتك فوراً</span>
          </a>
        </div>
      </div>
    </div>
  );
}
