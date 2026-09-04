"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import type { MockOrder } from "../types";

export interface ReceiptOcrModalProps {
  order: MockOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (order: MockOrder) => void;
}

export const ReceiptOcrModal: React.FC<ReceiptOcrModalProps> = ({
  order,
  isOpen,
  onClose,
  onApprove,
}) => {
  if (!isOpen || !order) return null;

  const ocr = order.ocrData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="فحص إيصال التحويل بالذكاء الاصطناعي (Smart OCR Scan)"
      maxWidth="xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            إغلاق المعاينة
          </Button>

          {order.status === "manual_review" && onApprove && (
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                onApprove(order);
                onClose();
              }}
            >
              <CheckCircle2 className="w-4 h-4 me-1" />
              <span>تفعيل الاشتراك وإشعار ولي الأمر</span>
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {ocr && (
          <div
            className={`p-4 rounded-2xl text-right text-xs space-y-2 border-2 ${
              ocr.isSuspectedDuplicate
                ? "bg-rose-50 border-rose-300 text-rose-950"
                : "bg-purple-50/70 border-purple-200 text-purple-950"
            }`}
          >
            <div className="flex items-center justify-between font-black">
              <span className="flex items-center gap-1.5">
                <span>نتائج الفحص الآلي (OCR Data):</span>
                {ocr.isSuspectedDuplicate ? (
                  <span className="text-rose-600 animate-pulse font-black">⚠️ تكرار إيصال مكتشف!</span>
                ) : (
                  <span className="text-emerald-600 font-black">
                    مطابق بنسبة {ocr.confidenceScore}% ✓
                  </span>
                )}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{ocr.extractedDate}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1">
              <div>
                <span className="text-slate-500 block">رقم العملية المستخرج:</span>
                <span className="font-mono font-bold text-slate-900">
                  {ocr.extractedReference || order.referenceNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">المبلغ المستخرج:</span>
                <span className="font-bold text-slate-900">
                  {ocr.extractedAmount} ج.م (سعر الوحدة: {order.amountEgp} ج.م)
                </span>
              </div>
              {ocr.matchedSender && (
                <div className="col-span-2">
                  <span className="text-slate-500 block">الحساب / المحفظة المحول منها:</span>
                  <span className="font-mono font-bold text-slate-900">{ocr.matchedSender}</span>
                </div>
              )}
            </div>

            {ocr.isSuspectedDuplicate && (
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-900 text-[11px] font-bold border border-rose-300">
                ⚠️ تحذير أمني: تم استخدام نفس صورة الإيصال ورقم العملية في طلب سابق ({ocr.duplicateOrderId}).
                يرجى التحقق بدقة قبل التفعيل منعاً للاحتيال!
              </div>
            )}
          </div>
        )}

        {order.receiptImageUrl && (
          <div className="max-h-[50vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.receiptImageUrl}
              alt="إيصال التحويل"
              className="max-h-[46vh] w-auto object-contain rounded-xl"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
