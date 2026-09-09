"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, LayoutDashboard, ShieldAlert } from "lucide-react";
import { AdminShieldErrorSvg } from "@/components/ui/error-illustrations";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error("Admin Boundary caught error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
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

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 border-2 border-rose-500/20 bg-slate-900 text-white shadow-2xl text-center">
        {/* Alert SVG */}
        <div className="animate-float-slow inline-block mx-auto">
          <AdminShieldErrorSvg className="w-44 h-36 sm:w-52 sm:h-44 mx-auto drop-shadow-md" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-black">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>خطأ في تنفيذ الإجراء الإداري (CMS Error)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            تعذر إكمال طلب لوحة التحكم
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
            حدث خطأ أثناء معالجة البيانات أو الاتصال بقاعدة البيانات. يمكنك محاولة إعادة تشغيل المكون أو الرجوع للوحة القيادة.
          </p>
        </div>

        {/* Digest Hash */}
        {error.digest && (
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300">
            Internal Error Digest: {error.digest}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "جاري إعادة التحميل..." : "إعادة المحاولة (Retry)"}</span>
          </button>

          <Link
            href="/admin"
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <LayoutDashboard className="w-4 h-4 text-purple-300" />
            <span>لوحة القيادة</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
