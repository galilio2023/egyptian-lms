import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthSideCard, LoginCard } from "@/features/auth";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجّل دخولك الآن لمتابعة المحاضرات الجديدة، حل الاختبارات، وجمع نقاط التميز في لوحة الشرف.",
};

export default function StudentLoginPage() {
  return (
    <>
      {/* Marketing Hero Column */}
      <AuthSideCard mode="login" />

      {/* Login Card Column */}
      <div className="lg:col-span-7 w-full max-w-md mx-auto">
        <Suspense fallback={<div className="modern-card p-8 bg-white/80 animate-pulse rounded-3xl h-96" />}>
          <LoginCard />
        </Suspense>
      </div>
    </>
  );
}
