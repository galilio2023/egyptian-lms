"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, GraduationCap, MessageCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { MascotFixerErrorSvg } from "@/components/ui/error-illustrations";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error("Portal Error Boundary caught error:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  const handleRetry = () => {
    setIsRetrying(true);
    try {
      reset();
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `السلام عليكم يا مستر، واجهت مشكلة أثناء تصفح الدرس في بوابة الطالب.\nرمز الخطأ: ${error.digest || "غير محدد"}`
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 border-2 border-purple-200 bg-white/95 shadow-xl text-center">
        {/* Fixer Mascot */}
        <div className="animate-float-slow inline-block mx-auto">
          <MascotFixerErrorSvg className="w-44 h-36 sm:w-52 sm:h-44 mx-auto drop-shadow-md" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>تنبيه بسيط في بوابة الطالب</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            لا تقلق يا بطل! حدث خلل بسيط في الاتصال 🦁🛠️
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
            قد يكون انقطع اتصال الإنترنت للحظة. اضغط على زر إعادة المحاولة لنعيد تحميل الدرس فوراً دون أن تفقد أي نقاط XP!
          </p>
        </div>

        {/* Security badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>بياناتك ونقاطك وإجاباتك محفوظة بالكامل</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "جاري إعادة المحاولة..." : "إعادة المحاولة الآن"}</span>
          </button>

          <Link
            href="/portal/dashboard"
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <GraduationCap className="w-4 h-4 text-purple-700" />
            <span>لوحة التحكم</span>
          </Link>
        </div>

        {/* WhatsApp direct help */}
        <div className="pt-1">
          <a
            href={`https://wa.me/201000000000?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>إبلاغ المعلم بالمشكلة عبر واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
}
