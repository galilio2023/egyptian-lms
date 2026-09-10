import type { Metadata } from "next";
import { AdminCurriculumClient } from "@/features/admin-curriculum/components/admin-curriculum-client";

export const metadata: Metadata = {
  title: "إدارة المنهج والمحاضرات | Curriculum Studio",
  description: "إضافة وتعديل وحدات الكورس، استيراد مناهج الوزارة الرسمية بـ PDF، ورفع فيديوهات المحاضرات عبر Bunny Stream TUS.",
};

export default function AdminCurriculumPage() {
  return <AdminCurriculumClient />;
}
