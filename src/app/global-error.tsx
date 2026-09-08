"use client";

import { useEffect } from "react";
import { RefreshCw, AlertOctagon } from "lucide-react";

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

          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة تشغيل المنصة (Restart Application)</span>
          </button>
        </div>
      </body>
    </html>
  );
}
