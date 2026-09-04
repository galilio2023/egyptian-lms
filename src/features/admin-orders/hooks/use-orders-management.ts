"use client";

import { useAdminQuery, executeAdminAction } from "@/lib/api/admin-client";
import { INITIAL_ORDERS, type MockOrder } from "@/lib/db/mock-data";

export function useOrdersManagement() {
  const { data: orders, setData: setOrders, isLoading, refetch } = useAdminQuery<MockOrder[]>(
    "orders",
    INITIAL_ORDERS,
    (res) => (res.orders && Array.isArray(res.orders) ? (res.orders as MockOrder[]) : undefined)
  );

  const pendingCount = orders.filter((o) => o.status === "manual_review").length;

  const approveOrder = async (order: MockOrder) => {
    const result = await executeAdminAction(
      "approve_order",
      {
        orderId: order.id,
        studentName: order.studentName,
        parentPhone: order.parentPhone,
        unitId: order.unitId,
      },
      {
        successMessage: `✅ تم تفعيل الكورس للطالب (${order.studentName}) وإرسال إشعار التفعيل لولي الأمر على واتساب.`,
        errorMessage: "حدث خطأ أثناء تفعيل الكورس.",
      }
    );

    if (result.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "completed" } : o))
      );
    }
    return result.success;
  };

  const rejectOrder = async (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);

    const result = await executeAdminAction(
      "reject_order",
      {
        orderId,
        reason,
        parentPhone: order?.parentPhone,
      },
      {
        successMessage: "تم رفض الطلب وإرسال تنبيه لولي الأمر.",
        errorMessage: "حدث خطأ أثناء رفض الطلب.",
      }
    );

    if (result.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "failed" } : o))
      );
    }
    return result.success;
  };

  return {
    orders,
    pendingCount,
    isLoading,
    refetch,
    approveOrder,
    rejectOrder,
  };
}
