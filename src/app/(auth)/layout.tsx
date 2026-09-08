import type { Metadata } from "next";
import { AuthLayoutShell } from "@/features/auth";

export const metadata: Metadata = {
  title: "بوابة الدخول والتسجيل للأبطال | المنصة التعليمية الذكية",
  description: "سجل دخولك أو أنشئ حساباً جديداً للوصول إلى المحاضرات التفاعلية، كويزات التحدي، وبنك النقاط للأبطال.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>;
}
