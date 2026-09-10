import type { Metadata } from "next";
import { AdminSecurityClient } from "@/features/admin-security/components/admin-security-client";

export const metadata: Metadata = {
  title: "سجل الأمان ومكافحة التهديدات | Security Audit",
  description: "مراقبة محاولات الاختراق، وقفل الأجهزة المتعددة، وتتبع كروت الشحن، وعزل المخالفين فورياً.",
};

export default function AdminSecurityPage() {
  return <AdminSecurityClient />;
}
