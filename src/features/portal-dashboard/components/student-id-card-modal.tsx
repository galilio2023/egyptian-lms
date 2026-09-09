"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { X, QrCode, Printer } from "lucide-react";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";

export interface StudentIDCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName: string;
  studentPhone: string;
  gradeTitle: string;
  academyName?: string;
  xpPoints?: number;
}

export function StudentIDCardModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentPhone,
  gradeTitle,
  academyName = "المنصة التعليمية",
  xpPoints = 0,
}: StudentIDCardModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Opaque token / pass identifier (no PII like studentName or phone exposed to scanners)
    const passIdentifier = studentId || `pass_${studentPhone.replace(/\D/g, "").slice(-8)}`;
    const qrPayload = JSON.stringify({
      passId: passIdentifier,
      type: "attendance_pass",
      ver: "2.0",
    });

    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 1,
      color: {
        dark: "#3b0764", // Deep purple
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn("QR Generation note:", err));
  }, [isOpen, studentId, studentPhone]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in-50 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="id-card-modal-title"
    >
      <div className="w-full max-w-md rounded-3xl p-5 sm:p-7 space-y-4 border-2 border-purple-300 shadow-2xl bg-white relative my-auto print:border-0 print:shadow-none">
        {/* Close Button - hidden in print */}
        <button
          type="button"
          onClick={onClose}
          className="print:hidden absolute top-4 end-4 p-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black">
            <QrCode className="w-4 h-4 text-purple-700" aria-hidden="true" />
            <span>بطاقة حضور السنتر الذكية (Student QR Pass)</span>
          </div>
          <h2 id="id-card-modal-title" className="text-xl font-black text-slate-900">{academyName}</h2>
          <p className="text-xs text-slate-500 font-medium">
            يتم مسح هذا الكود عند الدخول للسنتر الفعلي لتسجيل الحضور وإشعار ولي الأمر
          </p>
        </div>

        {/* Physical ID Card Preview */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-950 text-white shadow-xl border-2 border-purple-400/40 relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center gap-2">
              <EliteLogoBadge className="w-8 h-8" aria-hidden="true" />
              <div>
                <span className="text-[11px] font-black text-amber-300 block">بطاقة البطل المعتمد</span>
                <span className="text-xs font-bold text-purple-100">{academyName}</span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
              {gradeTitle}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-inner">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="Student Attendance QR"
                width={192}
                height={192}
                unoptimized
                className="w-48 h-48 rounded-xl object-contain"
              />
            ) : (
              <div className="w-48 h-48 rounded-xl bg-purple-50 animate-pulse flex items-center justify-center text-purple-400 text-xs">
                جاري تجهيز الباركود...
              </div>
            )}
            <span className="text-[11px] font-mono font-bold text-purple-900 pt-1">
              ID: {studentPhone}
            </span>
          </div>

          {/* Student Meta */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="text-[10px] text-purple-300 block">اسم الطالب:</span>
              <span className="font-black text-white text-sm">{studentName}</span>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-purple-300 block">رصيد النقاط:</span>
              <span className="font-black text-amber-300 text-sm">{xpPoints} XP 🌟</span>
            </div>
          </div>
        </div>

        {/* Print & Action Buttons */}
        <div className="print:hidden pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>طباعة البطاقة للتعليق (Lanyard)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
