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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {/* 1. Soundboard */}
      <button
        onClick={onOpenSoundboard}
        className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-200 hover:border-purple-400 hover:scale-[1.03] transition-all shadow-md text-right group flex items-center gap-3.5 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <Volume2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-black text-slate-900 block group-hover:text-purple-700 transition-colors">
            لوحة الصوتيات 🔊
          </span>
          <span className="text-[10px] text-purple-600 font-bold block">
            استمع لنطق الحروف والكلمات
          </span>
        </div>
      </button>

      {/* 2. Certificate */}
      <button
        onClick={onOpenCertificate}
        className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-amber-200 hover:border-amber-400 hover:scale-[1.03] transition-all shadow-md text-right group flex items-center gap-3.5 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-black text-slate-900 block group-hover:text-amber-700 transition-colors">
            شهادة التفوق 🎓
          </span>
          <span className="text-[10px] text-amber-600 font-bold block">
            عرض وطباعة شهادة التقدير
          </span>
        </div>
      </button>

      {/* 3. WhatsApp Mom */}
      <button
        onClick={onSendToMom}
        className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-emerald-200 hover:border-emerald-400 hover:scale-[1.03] transition-all shadow-md text-right group flex items-center gap-3.5 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
            واتساب ماما 💬
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block">
            إرسال النتيجة لماما فورياً
          </span>
        </div>
      </button>

      {/* 4. Voucher shortcut */}
      <a
        href="#center-voucher-box"
        className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-indigo-200 hover:border-indigo-400 hover:scale-[1.03] transition-all shadow-md text-right group flex items-center gap-3.5"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Ticket className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-black text-slate-900 block group-hover:text-indigo-700 transition-colors">
            كارت السنتر 🎟️
          </span>
          <span className="text-[10px] text-indigo-600 font-bold block">
            شحن كود كارت الشحن
          </span>
        </div>
      </a>
    </div>
  );
};
