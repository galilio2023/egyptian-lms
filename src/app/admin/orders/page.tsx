"use client";

import { useState } from "react";
import { EgyptianWalletSvg, CenterVoucherCardSvg } from "@/components/ui/illustrated-icons";
import { AdminPageHeader } from "@/components/shared";
import { Button, Badge } from "@/components/ui";
import {
  OrdersTable,
  ReceiptOcrModal,
  RejectOrderModal,
  BatchVoucherGeneratorModal,
  useOrdersManagement,
  type MockOrder,
} from "@/features/admin-orders";

export default function AdminOrdersPage() {
  const { orders, pendingCount, approveOrder, rejectOrder } = useOrdersManagement();

  const [activeOrder, setActiveOrder] = useState<MockOrder | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <AdminPageHeader
        icon={<EgyptianWalletSvg className="w-8 h-8" />}
        title={
          <>
            مراجعة إيصالات إنستاباي وفودافون كاش{" "}
            <span className="text-gradient-purple">(Queue)</span>
          </>
        }
        subtitle="فحص صور السكرين شوت وتفعيل الاشتراكات بضغطة زر مع إشعار واتساب فوري."
        actions={
          <>
            <Button
              variant="vibrant"
              size="sm"
              onClick={() => setIsVoucherModalOpen(true)}
            >
              <CenterVoucherCardSvg className="w-5 h-5 me-1" />
              <span>توليد كروت السنتر (Vouchers) 🎟️</span>
            </Button>

            <Badge variant="amber" size="md">
              <CenterVoucherCardSvg className="w-4 h-4 me-1" />
              <span>{pendingCount} إيصالات بانتظار التأكيد</span>
            </Badge>
          </>
        }
      />

      {/* 2. Composable Orders Table */}
      <OrdersTable
        orders={orders}
        onApprove={approveOrder}
        onReject={setRejectingOrderId}
        onInspectReceipt={setActiveOrder}
      />

      {/* 3. Smart OCR & Zoom Receipt Modal */}
      <ReceiptOcrModal
        order={activeOrder}
        isOpen={Boolean(activeOrder)}
        onClose={() => setActiveOrder(null)}
        onApprove={approveOrder}
      />

      {/* 4. Quick Rejection Modal */}
      <RejectOrderModal
        orderId={rejectingOrderId}
        isOpen={Boolean(rejectingOrderId)}
        onClose={() => setRejectingOrderId(null)}
        onConfirmReject={rejectOrder}
      />

      {/* 5. Batch Voucher Generator Modal */}
      <BatchVoucherGeneratorModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />
    </div>
  );
}
