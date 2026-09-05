import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";
import type { GeneratedVoucher } from "../types";

export interface VoucherCardItemProps {
  voucher: GeneratedVoucher;
}

export const VoucherCardItem: React.FC<VoucherCardItemProps> = ({ voucher }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(voucher.code, {
      margin: 1,
      width: 120,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.warn("Failed to generate QR code locally:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [voucher.code]);

  return (
    <div className="border-2 border-purple-200 rounded-2xl p-4 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 relative overflow-hidden text-right shadow-sm print:shadow-none print:border-slate-800 print:break-inside-avoid">
      {/* Card Top */}
      <div className="flex items-center justify-between border-b border-purple-100 pb-2">
        <div className="flex items-center gap-2">
          <EliteLogoBadge className="w-8 h-8" />
          <div>
            <span className="font-black text-xs text-slate-900 block leading-tight">
              أكاديمية إيليت
            </span>
            <span className="text-[9px] text-purple-700 font-bold">
              {voucher.gradeTitle}
            </span>
          </div>
        </div>
        <span className="text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
          {voucher.priceEgp} ج.م
        </span>
      </div>

      {/* Scratch-off Silver Foil Mockup & QR Scan */}
      <div className="py-2.5 flex items-center justify-between gap-3">
        <div className="flex-1 text-center">
          <span className="text-[9px] text-slate-400 font-bold block mb-1">
            امسح هنا برفق لإظهار كود التفعيل:
          </span>
          <div className="p-2 rounded-xl bg-slate-200 border-2 border-dashed border-slate-400 inline-block w-full max-w-[190px] shadow-inner font-mono font-black text-xs sm:text-sm tracking-widest text-slate-900 select-all">
            {voucher.code}
          </div>
        </div>

        {/* QR Code generated locally without third-party network exposure (CWE-200 fix) */}
        <div className="flex flex-col items-center shrink-0 border border-purple-200 bg-white p-1 rounded-xl shadow-xs print:border-slate-800">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="w-12 h-12 print:w-14 print:h-14 object-contain"
            />
          ) : (
            <div className="w-12 h-12 print:w-14 print:h-14 bg-slate-100 rounded-lg animate-pulse" />
          )}
          <span className="text-[7px] text-slate-500 font-bold mt-0.5">امسح للرمز 📷</span>
        </div>
      </div>

      {/* Card Bottom / Barcode Mockup */}
      <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-[9px] text-slate-500 font-medium">
        <span className="font-mono font-bold text-slate-700">
          {voucher.serialNumber}
        </span>
        <span>التفعيل: elite-academy.eg</span>
      </div>
    </div>
  );
};
