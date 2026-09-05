"use client";

import { WhatsAppBubbleSvg } from "@/components/ui/illustrated-icons";

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
    <div className="fixed bottom-6 start-6 z-50 group">
      <a
        href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`تواصل مع ${academyName} عبر واتساب`}
        className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white ps-2.5 pe-5 py-2.5 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 font-bold text-xs border border-emerald-300/40"
      >
        <WhatsAppBubbleSvg className="w-8 h-8 drop-shadow" />
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-emerald-100 font-medium">خدمة أولياء الأمور</span>
          <span className="font-black text-xs leading-none">تواصل عبر واتساب</span>
        </div>
      </a>
    </div>
  );
}
