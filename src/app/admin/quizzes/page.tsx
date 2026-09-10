import type { Metadata } from "next";
import { AdminQuizzesClient } from "@/features/admin-quizzes/components/admin-quizzes-client";

export const metadata: Metadata = {
  title: "بنك الأسئلة والامتحانات | Quiz Studio",
  description: "إعداد الاختبارات التفاعلية، إضافة الأسئلة، وتحديد وقت الامتحان ونسبة النجاح.",
};

export default function AdminQuizzesPage() {
  return <AdminQuizzesClient />;
}
