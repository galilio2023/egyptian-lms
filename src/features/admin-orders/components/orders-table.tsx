"use client";

import React from "react";
import { CheckCircle2, X, Eye } from "lucide-react";
import { DataTableCard, StatusBadge, WhatsAppContactLink } from "@/components/shared";
import { Button } from "@/components/ui";
import type { MockOrder } from "../types";

export interface OrdersTableProps {
  orders: MockOrder[];
  onApprove: (order: MockOrder) => void;
  onReject: (orderId: string) => void;
  onInspectReceipt: (order: MockOrder) => void;
}

const TABLE_HEADERS = [
  "بيانات الطالب",
  "الوحدة المطلوبة",
  "طريقة الدفع والمبلغ",
  "رقم العملية / المحفظة",
  "صورة الإيصال",
  "الحالة",
  <div key="action" className="text-center">الإجراء</div>,
];

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onApprove,
  onReject,
  onInspectReceipt,
}) => {
  return (
    <DataTableCard
      headers={TABLE_HEADERS}
      isEmpty={orders.length === 0}
      emptyTitle="لا توجد طلبات اشتراك"
      emptyDescription="لم يتم تسجيل أي إيصالات حتى الآن."
    >
      {orders.map((ord) => (
        <tr key={ord.id} className="hover:bg-purple-50/30 transition-colors">
          {/* Student Info */}
          <td className="p-4">
            <div className="font-black text-slate-900 text-sm">{ord.studentName}</div>
            <div className="text-[11px] text-slate-500 font-mono text-right mt-0.5">
              طالب: <bdi dir="ltr">{ord.studentPhone}</bdi>
            </div>
            <WhatsAppContactLink
              phone={ord.parentPhone}
              label="ولي أمر"
              className="mt-1"
            />
          </td>

          {/* Unit */}
          <td className="p-4">
            <div className="font-semibold text-slate-900">{ord.unitTitle}</div>
            <div className="text-[10px] text-slate-400">{ord.createdAt}</div>
          </td>

          {/* Payment Method & Price */}
          <td className="p-4">
            <div className="font-bold text-slate-900 text-sm">{ord.amountEgp} ج.م</div>
            <div className="text-[10px] text-slate-500">
              {ord.paymentMethod === "instapay_manual" && "إنستاباي (InstaPay)"}
              {ord.paymentMethod === "wallet_manual" && "محفظة كاش يدوية"}
              {ord.paymentMethod === "paymob_wallet" && "باي موب (محفظة)"}
              {ord.paymentMethod === "paymob_card" && "باي موب (فيزا/ميزة)"}
            </div>
          </td>

          {/* Reference Number & Smart OCR Status */}
          <td className="p-4 font-mono font-semibold text-slate-800">
            <div>
              <bdi dir="ltr">{ord.referenceNumber}</bdi>
            </div>

            {ord.ocrData && (
              <div className="mt-1.5">
                {ord.ocrData.isSuspectedDuplicate ? (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black inline-flex items-center gap-1 animate-pulse">
                    ⚠️ تكرار إيصال ({ord.ocrData.duplicateOrderId})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold inline-flex items-center gap-1">
                    <span>فحص ذكي: {ord.ocrData.confidenceScore}% ✓</span>
                  </span>
                )}
              </div>
            )}
          </td>

          {/* Receipt Inspection Button */}
          <td className="p-4">
            {ord.receiptImageUrl ? (
              <button
                onClick={() => onInspectReceipt(ord)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>فحص الإيصال و الـ OCR</span>
              </button>
            ) : (
              <span className="text-slate-400 text-[10px]">دفع إلكتروني آلي</span>
            )}
          </td>

          {/* Status */}
          <td className="p-4">
            <StatusBadge type="order" status={ord.status} />
          </td>

          {/* Actions */}
          <td className="p-4 text-center">
            {ord.status === "manual_review" ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onApprove(ord)}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تفعيل الكورس</span>
                </Button>

                <button
                  onClick={() => onReject(ord.id)}
                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                  title="رفض الإيصال"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400">تمت المعالجة</span>
            )}
          </td>
        </tr>
      ))}
    </DataTableCard>
  );
};
