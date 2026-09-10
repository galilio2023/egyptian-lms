import type { Metadata } from "next";
import { AdminOverviewClient } from "@/features/admin-overview/components/admin-overview-client";

export const metadata: Metadata = {
  title: "لوحة قيادة الأكاديمية | Dashboard",
  description: "متابعة فورية للطلاب، الاشتراكات الجديدة، وإيصالات التحويل عبر إنستاباي وفودافون كاش.",
};

export default function AdminOverviewPage() {
  return <AdminOverviewClient />;
}
