"use client";

import { Suspense } from "react";
import { AuthLayoutShell, AuthSideCard, LoginCard } from "@/features/auth";

export default function StudentLoginPage() {
  return (
    <AuthLayoutShell>
      {/* Marketing Hero Column */}
      <AuthSideCard mode="login" />

      {/* Login Card Column */}
      <div className="lg:col-span-7 w-full max-w-md mx-auto">
        <Suspense fallback={<div className="modern-card p-8 bg-white/80 animate-pulse rounded-3xl h-96" />}>
          <LoginCard />
        </Suspense>
      </div>
    </AuthLayoutShell>
  );
}
