import type { Metadata } from "next";
import { AdminLiveSessionsClient } from "@/features/admin-live-sessions/components/admin-live-sessions-client";

export const metadata: Metadata = {
  title: "البث المباشر وغرف الزووم | Live Sessions",
  description: "جدولة حصص المراجعة الأسبوعية، بدء البث المباشر للطلاب، وإرسال روابط الغرف لولي الأمر عبر واتساب.",
};

export default function AdminLiveSessionsPage() {
  return <AdminLiveSessionsClient />;
}
