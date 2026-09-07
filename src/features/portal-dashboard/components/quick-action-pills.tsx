import React from "react";
import { Volume2, Award, MessageCircle, Ticket } from "lucide-react";

export interface QuickActionPillsProps {
  onOpenSoundboard: () => void;
  onOpenCertificate: () => void;
  onSendToMom: () => void;
}

export const QuickActionPills: React.FC<QuickActionPillsProps> = ({
  onOpenSoundboard,
  onOpenCertificate,
  onSendToMom,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Soundboard */}
      <button
        type="button"
        onClick={onOpenSoundboard}
        className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-200 hover:border-purple-400 hover:scale-[1.02] transition-all shadow-md text-center sm:text-right group flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-xs">
          <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-purple-700 transition-colors">
            لوحة الصوتيات 🔊
          </span>
          <span className="text-[10px] sm:text-xs text-purple-600 font-bold block mt-0.5">
            استمع لنطق الحروف والكلمات
          </span>
        </div>
      </button>

      {/* 2. Certificate */}
      <button
        type="button"
        onClick={onOpenCertificate}
        className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border-2 border-amber-200 hover:border-amber-400 hover:scale-[1.02] transition-all shadow-md text-center sm:text-right group flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-xs">
          <Award className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-amber-700 transition-colors">
            شهادة التفوق 🎓
          </span>
          <span className="text-[10px] sm:text-xs text-amber-600 font-bold block mt-0.5">
            عرض وطباعة شهادة التقدير
          </span>
        </div>
      </button>

      {/* 3. WhatsApp Mom */}
      <button
        type="button"
        onClick={onSendToMom}
        className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border-2 border-emerald-200 hover:border-emerald-400 hover:scale-[1.02] transition-all shadow-md text-center sm:text-right group flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
            واتساب ماما 💬
          </span>
          <span className="text-[10px] sm:text-xs text-emerald-600 font-bold block mt-0.5">
            إرسال النتيجة لماما فورياً
          </span>
        </div>
      </button>

      {/* 4. Voucher shortcut */}
      <a
        href="#center-voucher-box"
        className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border-2 border-indigo-200 hover:border-indigo-400 hover:scale-[1.02] transition-all shadow-md text-center sm:text-right group flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
          <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-indigo-700 transition-colors">
            كارت السنتر 🎟️
          </span>
          <span className="text-[10px] sm:text-xs text-indigo-600 font-bold block mt-0.5">
            شحن كود كارت الشحن
          </span>
        </div>
      </a>
    </div>
  );
};
