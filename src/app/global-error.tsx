"use client";

import { useEffect } from "react";
import { RefreshCw, AlertOctagon, MessageCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Root Layout Error:", error);
  }, [error]);

  const whatsappMsg = encodeURIComponent(
    `السلام عليكم، واجهت عطلاً تقنياً غير متوقع في المنصة التعليمية (Root Crash).\nرمز الخطأ: ${error.digest || "غير محدد"}`
  );

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-md rounded-3xl p-8 space-y-6 border border-rose-500/30 bg-slate-900 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">حدث خطأ عام في تشغيل المنصة</h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              واجه النظام خللاً أثناء تجهيز الإطار الأساسي. يرجى الضغط على زر إعادة المحاولة لاستعادة الجلسة.
            </p>
          </div>

          {error.digest && (
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono">
              Error Digest: {error.digest}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تشغيل المنصة (Restart Application)</span>
            </button>

            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000"}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>إبلاغ الدعم الفني عبر واتساب (Emergency Report)</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
