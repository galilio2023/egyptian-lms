"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X,
  Clock
} from "lucide-react";
import { INITIAL_ORDERS, type MockOrder } from "@/lib/db/mock-data";
import { 
  EgyptianWalletSvg, 
  WhatsAppBubbleSvg, 
  CenterVoucherCardSvg
} from "@/components/ui/illustrated-icons";
import { BatchVoucherGeneratorModal } from "@/components/admin/batch-voucher-generator";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<MockOrder[]>(INITIAL_ORDERS);
  const [activeReceiptImg, setActiveReceiptImg] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<MockOrder | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("صورة الإيصال غير واضحة أو غير مطابقة");
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/actions?type=orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.orders && data.orders.length > 0) {
          setOrders(data.orders);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const pendingCount = orders.filter((o) => o.status === "manual_review").length;

  const handleApprove = async (orderId: string, studentName: string, parentPhone: string, unitId: string) => {
    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_order",
          payload: { orderId, studentName, parentPhone, unitId },
        }),
      });

      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
      );
      toast.success(`✅ تم تفعيل الكورس للطالب (${studentName}) وإرسال إشعار التفعيل لولي الأمر على واتساب.`);
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم.");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrderId) return;
    const ord = orders.find((o) => o.id === rejectingOrderId);
    
    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject_order",
          payload: { 
            orderId: rejectingOrderId, 
            reason: rejectionReason,
            parentPhone: ord?.parentPhone 
          },
        }),
      });

      setOrders(
        orders.map((o) => (o.id === rejectingOrderId ? { ...o, status: 'failed' } : o))
      );
      toast.info(`تم رفض الطلب وإرسال تنبيه لولي الأمر.`);
    } catch {
      toast.error("حدث خطأ أثناء رفض الطلب.");
    } finally {
      setRejectingOrderId(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <EgyptianWalletSvg className="w-8 h-8" />
            <span>مراجعة إيصالات إنستاباي وفودافون كاش <span className="text-gradient-purple">(Queue)</span></span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            فحص صور السكرين شوت وتفعيل الاشتراكات بضغطة زر مع إشعار واتساب فوري.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-vibrant hover:scale-105 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <CenterVoucherCardSvg className="w-5 h-5" />
            <span>توليد كروت السنتر (Vouchers) 🎟️</span>
          </button>

          <span className="px-4 py-2 rounded-2xl bg-amber-50 text-amber-950 border-2 border-amber-200 text-xs font-black flex items-center gap-2 shadow-sm">
            <CenterVoucherCardSvg className="w-4 h-4" />
            <span>{pendingCount} إيصالات بانتظار التأكيد</span>
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="modern-card rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-100 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-purple-50/70 border-b border-purple-100 text-purple-950 font-black">
              <tr>
                <th className="p-4">بيانات الطالب</th>
                <th className="p-4">الوحدة المطلوبة</th>
                <th className="p-4">طريقة الدفع والمبلغ</th>
                <th className="p-4">رقم العملية / المحفظة</th>
                <th className="p-4">صورة الإيصال</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700 font-medium">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-purple-50/30 transition-colors">
                  
                  <td className="p-4">
                    <div className="font-black text-slate-900 text-sm">{ord.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono text-right mt-0.5">
                      طالب: <bdi dir="ltr">{ord.studentPhone}</bdi>
                    </div>
                    <a
                      href={`https://wa.me/2${ord.parentPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-700 hover:underline font-mono inline-flex items-center gap-1.5 mt-1 font-bold"
                    >
                      <WhatsAppBubbleSvg className="w-4 h-4 shrink-0" />
                      ولي أمر: <bdi dir="ltr">{ord.parentPhone}</bdi>
                    </a>
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{ord.unitTitle}</div>
                    <div className="text-[10px] text-slate-400">{ord.createdAt}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{ord.amountEgp} ج.م</div>
                    <div className="text-[10px] text-slate-500">
                      {ord.paymentMethod === 'instapay_manual' && 'إنستاباي (InstaPay)'}
                      {ord.paymentMethod === 'wallet_manual' && 'محفظة كاش يدوية'}
                      {ord.paymentMethod === 'paymob_wallet' && 'باي موب (محفظة)'}
                      {ord.paymentMethod === 'paymob_card' && 'باي موب (فيزا/ميزة)'}
                    </div>
                  </td>

                  <td className="p-4 font-mono font-semibold text-slate-800">
                    <div>
                      <bdi dir="ltr">{ord.referenceNumber}</bdi>
                    </div>

                    {/* Smart OCR Status Badge */}
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

                  <td className="p-4">
                    {ord.receiptImageUrl ? (
                      <button
                        onClick={() => {
                          setActiveReceiptImg(ord.receiptImageUrl || null);
                          setActiveOrder(ord);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فحص الإيصال و الـ OCR</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px]">دفع إلكتروني آلي</span>
                    )}
                  </td>

                  <td className="p-4">
                    {ord.status === 'manual_review' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        بانتظار المراجعة
                      </span>
                    )}
                    {ord.status === 'completed' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        مكتمل ومفعّل
                      </span>
                    )}
                    {ord.status === 'failed' && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-semibold inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        مرفوض
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {ord.status === 'manual_review' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(ord.id, ord.studentName, ord.parentPhone, ord.unitId)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تفعيل الكورس</span>
                        </button>

                        <button
                          onClick={() => setRejectingOrderId(ord.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="modern-card max-w-md w-full p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
            <h3 className="font-bold text-base text-slate-900">سبب رفض إيصال التحويل</h3>
            <p className="text-xs text-slate-500">
              حدد سبب الرفض ليتم إرساله كإشعار توضيحي لولي الأمر عبر واتساب.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Zoom & Smart OCR Modal */}
      {activeReceiptImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="modern-card max-w-xl w-full p-6 rounded-3xl border border-slate-200 bg-white space-y-4 text-center relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setActiveReceiptImg(null);
                setActiveOrder(null);
              }}
              className="absolute top-4 end-4 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-sm text-slate-900">
              فحص إيصال التحويل بالذكاء الاصطناعي (Smart OCR Scan)
            </h3>

            {/* Smart OCR Analysis Card */}
            {activeOrder?.ocrData && (
              <div className={`p-4 rounded-2xl text-right text-xs space-y-2 border-2 ${
                activeOrder.ocrData.isSuspectedDuplicate 
                  ? "bg-rose-50 border-rose-300 text-rose-950" 
                  : "bg-purple-50/70 border-purple-200 text-purple-950"
              }`}>
                <div className="flex items-center justify-between font-black">
                  <span className="flex items-center gap-1.5">
                    <span>نتائج الفحص الآلي (OCR Data):</span>
                    {activeOrder.ocrData.isSuspectedDuplicate ? (
                      <span className="text-rose-600 animate-pulse font-black">⚠️ تكرار إيصال مكتشف!</span>
                    ) : (
                      <span className="text-emerald-600 font-black">مطابق بنسبة {activeOrder.ocrData.confidenceScore}% ✓</span>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{activeOrder.ocrData.extractedDate}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1">
                  <div>
                    <span className="text-slate-500 block">رقم العملية المستخرج:</span>
                    <span className="font-mono font-bold text-slate-900">{activeOrder.ocrData.extractedReference || activeOrder.referenceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">المبلغ المستخرج:</span>
                    <span className="font-bold text-slate-900">{activeOrder.ocrData.extractedAmount} ج.م (سعر الوحدة: {activeOrder.amountEgp} ج.م)</span>
                  </div>
                  {activeOrder.ocrData.matchedSender && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block">الحساب / المحفظة المحول منها:</span>
                      <span className="font-mono font-bold text-slate-900">{activeOrder.ocrData.matchedSender}</span>
                    </div>
                  )}
                </div>

                {activeOrder.ocrData.isSuspectedDuplicate && (
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-900 text-[11px] font-bold border border-rose-300">
                    ⚠️ تحذير أمني: تم استخدام نفس صورة الإيصال ورقم العملية في طلب سابق ({activeOrder.ocrData.duplicateOrderId}). يرجى التحقق بدقة قبل التفعيل منعاً للاحتيال!
                  </div>
                )}
              </div>
            )}
            
            <div className="max-h-[50vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeReceiptImg}
                alt="إيصال التحويل"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setActiveReceiptImg(null);
                  setActiveOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                إغلاق المعاينة
              </button>

              {activeOrder && activeOrder.status === 'manual_review' && (
                <button
                  onClick={() => {
                    handleApprove(activeOrder.id, activeOrder.studentName, activeOrder.parentPhone, activeOrder.unitId);
                    setActiveReceiptImg(null);
                    setActiveOrder(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تفعيل الاشتراك وإشعار ولي الأمر</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Voucher Generator Modal */}
      <BatchVoucherGeneratorModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />

    </div>
  );
}
