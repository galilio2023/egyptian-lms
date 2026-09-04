import React from "react";
import { WhatsAppBubbleSvg } from "@/components/ui/illustrated-icons";
import { cn } from "@/lib/utils";
import { getWhatsAppChatUrl } from "@/lib/utils/whatsapp";

export interface WhatsAppContactLinkProps {
  phone: string;
  label?: string;
  message?: string;
  className?: string;
}

export const WhatsAppContactLink: React.FC<WhatsAppContactLinkProps> = ({
  phone,
  label,
  message,
  className,
}) => {
  const url = getWhatsAppChatUrl(phone, message);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-emerald-700 hover:underline font-mono inline-flex items-center gap-1.5 font-bold text-xs transition-colors",
        className
      )}
    >
      <WhatsAppBubbleSvg className="w-4 h-4 shrink-0" />
      {label && <span className="font-sans font-medium text-slate-500">{label}:</span>}
      <bdi dir="ltr">{phone}</bdi>
    </a>
  );
};
