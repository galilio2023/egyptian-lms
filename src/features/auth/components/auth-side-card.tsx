import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { 
  EliteLogoBadge, 
  WorksheetPdfSvg, 
  ChampionCupSvg, 
  WhatsAppBubbleSvg, 
  ToyDinoDinoSvg, 
  ToyAlligatorGatorSvg,
  ToyHappyPearSvg,
  ToyTeddyBearSvg,
  PhonicsSpeechSvg
} from "@/components/ui/illustrated-icons";

export interface AuthSideCardProps {
  mode: "register" | "login";
}

export const AuthSideCard: React.FC<AuthSideCardProps> = ({ mode }) => {
  const isRegister = mode === "register";

  return (
    <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6 text-right p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-xl sticky top-8">
      <div className="space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <EliteLogoBadge className="w-12 h-12 group-hover:scale-105 transition-transform drop-shadow-sm" />
          <div>
            <span className="text-base font-black text-slate-900 block leading-tight">
              أكاديمية <span className="text-gradient-purple">إيليت</span>
            </span>
            <span className="text-xs text-purple-700 font-bold">Elite Learning</span>
          </div>
        </Link>

        <div className="pt-2">
          <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black inline-flex items-center gap-1.5 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>{isRegister ? "عضوية البطل الجديد" : "تسجيل دخول البطل"}</span>
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2 leading-snug">
            {isRegister
              ? "ابدأ رحلتك التعليمية الممتعة مجاناً 🚀"
              : "مرحباً بعودتك يا بطل اللغة الإنجليزية 👋"}
          </h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">
            {isRegister
              ? "سجل بياناتك الآن واستمتع بالمحاضرات الكرتونية التفاعلية، حل الاختبارات، واجمع الجواهر وشهادات التميز."
              : "سجّل دخولك لمتابعة المحاضرات الجديدة، حل الاختبارات، وجمع نقاط التميز في لوحة الشرف."}
          </p>
        </div>
      </div>

      {/* Feature Perks */}
      <div className="space-y-2.5 pt-2">
        {isRegister ? (
          <>
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
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-purple-50/80 border border-purple-100 text-xs font-bold text-slate-800">
              <PhonicsSpeechSvg className="w-6 h-6 shrink-0" />
              <span>محاضرات صوتيات كرتونية وتدريبات نطق مباشرة</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-50/80 border border-amber-100 text-xs font-bold text-slate-800">
              <ChampionCupSvg className="w-6 h-6 shrink-0" />
              <span>لوحة الشرف وتحديات أسبوعية وجوائز XP</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs font-bold text-slate-800">
              <WhatsAppBubbleSvg className="w-6 h-6 shrink-0" />
              <span>تقارير وتنبيهات أسبوعية تصل لولي الأمر عبر واتساب</span>
            </div>
          </>
        )}
      </div>

      {/* Playful Mascot Strip */}
      <div className="flex items-center justify-between pt-2 border-t border-purple-100/80">
        <div className="flex items-center gap-3">
          {isRegister ? (
            <>
              <div className="w-14 h-14 drop-shadow-md animate-float-slow">
                <ToyDinoDinoSvg className="w-full h-full" />
              </div>
              <div className="w-14 h-14 drop-shadow-md animate-float-reverse">
                <ToyAlligatorGatorSvg className="w-full h-full" />
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 drop-shadow-md animate-float-slow">
                <ToyHappyPearSvg className="w-full h-full" />
              </div>
              <div className="w-14 h-14 drop-shadow-md animate-float-reverse">
                <ToyTeddyBearSvg className="w-full h-full" />
              </div>
            </>
          )}
        </div>
        <span className="text-xs text-purple-800 font-bold bg-purple-100/80 px-3 py-1 rounded-full">
          {isRegister ? "داينو وجاتور يرحبان بك! 🦕🐊" : "أصدقاء الأكاديمية بانتظارك! 🧸✨"}
        </span>
      </div>
    </div>
  );
};
