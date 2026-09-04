"use client";

import React, { useState } from "react";
import { Modal, Button } from "@/components/ui";

export interface RejectOrderModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (orderId: string, reason: string) => Promise<unknown> | unknown;
}

const DEFAULT_REASONS = [
  "صورة الإيصال غير واضحة أو مقصوصة",
  "المبلغ المحول غير مطابق لسعر الوحدة",
  "رقم العملية مكرر ومسجل في طلب سابق",
  "التحويل لم يصل إلى المحفظة حتى الآن",
];

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState(DEFAULT_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !orderId) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmReject(orderId, reason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="سبب رفض إيصال التحويل"
      description="حدد سبب الرفض ليتم إرساله كإشعار توضيحي لولي الأمر عبر واتساب."
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button variant="danger" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "جاري الرفض..." : "تأكيد الرفض"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 block">اختيار سريع للسبب:</label>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                reason === r
                  ? "bg-purple-100 border-purple-300 text-purple-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="أو اكتب سبب الرفض بالتفصيل..."
          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-medium"
        />
      </div>
    </Modal>
  );
};
