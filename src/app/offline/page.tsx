import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, RefreshCw, Home, BookOpen } from "lucide-react";
import { MascotRocketSvg } from "@/components/ui/illustrated-icons";

export const metadata: Metadata = {
  title: "أنت غير متصل بالإنترنت | وضع عدم الاتصال",
  description: "يبدو أنك غير متصل بالإنترنت حالياً. يمكنك مراجعة الكلمات المحفوظة وإعادة المحاولة.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-purple-50/50 via-white to-purple-50/30 text-slate-900" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-white/95 rounded-3xl border-2 border-purple-200 shadow-2xl backdrop-blur-md">
        {/* Mascot & Icon */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-purple-100 animate-ping opacity-25" />
          <div className="w-24 h-24 rounded-3xl bg-purple-100 flex items-center justify-center border-2 border-purple-300 shadow-inner">
            <MascotRocketSvg className="w-16 h-16" />
          </div>
          <div className="absolute -bottom-2 -left-2 p-2 rounded-2xl bg-amber-500 text-white shadow-md">
            <WifiOff className="w-5 h-5" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            أنت غير متصل بالإنترنت حالياً يا بطل 📶
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            انقطع الاتصال بشبكة الواي فاي أو باقة الهاتف. تأكد من تشغيل الإنترنت في جهازك ثم اضغط إعادة المحاولة لاستكمال رحلة التعلّم!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/portal/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة الآن</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center justify-center gap-2 border border-purple-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>
        </div>

        {/* Educational encouragement note */}
        <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-100 text-[11px] text-purple-900 font-bold flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>تلميح: الحصص والتمارين التي فتحتها مسبقاً محفوظة وتعمل بسلاسة.</span>
        </div>
      </div>
    </div>
  );
}
