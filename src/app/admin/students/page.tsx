import type { Metadata } from "next";
import { AdminStudentsClient } from "@/features/admin-students/components/admin-students-client";

export const metadata: Metadata = {
  title: "إدارة الطلاب وأمان الأجهزة | Students & Devices",
  description: "البحث في بيانات الطلاب، تفعيل اشتراكات السنتر والدفع الكاش فورياً، فك حظر الأجهزة، ومتابعة أولياء الأمور.",
};

export default function AdminStudentsPage() {
  return <AdminStudentsClient />;
}
