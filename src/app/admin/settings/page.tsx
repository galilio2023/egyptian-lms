import type { Metadata } from "next";
import { AdminSettingsClient } from "@/features/admin-settings/components/admin-settings-client";

export const metadata: Metadata = {
  title: "إعدادات المنصة وهواتف التواصل | Platform Settings",
  description: "تحكم كامل في أسماء الأكاديمية والمعلم، أرقام الواتساب وخدمة العملاء، وفيديوهات المعاينة المجانية بالصفحة الرئيسية.",
};

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}
