"use client";

import { WhatsApp3DIconSvg } from "@/components/ui/illustrated-icons";

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  teacherName?: string;
  academyName?: string;
}

export function WhatsAppFloatingButton({
  phoneNumber,
  teacherName,
  academyName = "أكاديمية إيليت",
}: WhatsAppFloatingButtonProps = {}) {
  const whatsappNumber = phoneNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000";
  const teacherSuffix = teacherName ? ` مع ${teacherName}` : "";
  const defaultMessage = encodeURIComponent(
    `مرحباً، أود الاستفسار عن تفاصيل الاشتراك في كورسات ${academyName}${teacherSuffix}.`
  );

  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] start-4 sm:start-6 z-40 flex items-center group">
      {/* Floating Interactive Tooltip - Desktop only */}
      <div
        role="tooltip"
        id="whatsapp-tooltip"
        className="hidden md:block absolute bottom-full mb-3 start-0 pointer-events-none opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-50 whitespace-nowrap"
      >
        <div className="relative bg-slate-950/95 text-white backdrop-blur-xl border border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex flex-col gap-0.5 text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[10px] text-emerald-400 font-bold">خدمة أولياء الأمور والطلاب</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs font-black text-slate-100">
            تواصل مباشر عبر واتساب 💬
          </span>
          {/* Tooltip Downward Arrow Notch */}
          <div className="absolute -bottom-1.5 start-6 w-3 h-3 bg-slate-950 border-b border-e border-emerald-500/30 rotate-45" />
        </div>
      </div>

      {/* 3D Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby="whatsapp-tooltip"
        aria-label={`تواصل مع ${academyName} عبر واتساب`}
        className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 group-hover:-translate-y-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50"
      >
        {/* Soft Ambient Emerald Glow */}
        <span
          className="absolute inset-1 rounded-full bg-[#25D366]/35 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          aria-hidden="true"
        />

        {/* 3D Volumetric WhatsApp Emblem */}
        <WhatsApp3DIconSvg className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105" />
      </a>
    </div>
  );
}
