import type { Metadata } from "next";
import { AdminOrdersClient } from "@/features/admin-orders/components/admin-orders-client";

export const metadata: Metadata = {
  title: "مراجعة إيصالات التحويل | Orders & Vouchers",
  description: "فحص صور السكرين شوت وتفعيل الاشتراكات بضغطة زر مع إشعار واتساب فوري وتوليد كروت السنتر.",
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
