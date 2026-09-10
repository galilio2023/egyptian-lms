import type { Metadata } from "next";
import { AdminHomeworkClient } from "@/features/admin-homework/components/admin-homework-client";

export const metadata: Metadata = {
  title: "كنترول كراسات الواجب التفاعلي | Homework Grader",
  description: "تصحيح كراسات الطلاب إلكترونياً بالقلم الأحمر مع إضافة العلامات والملاحظات وإرسال إشعار فوري لولي الأمر.",
};

export default function AdminHomeworkPage() {
  return <AdminHomeworkClient />;
}
