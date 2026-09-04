"use client";

import { AuthLayoutShell, AuthSideCard, RegisterCard } from "@/features/auth";

export default function StudentRegisterPage() {
  return (
    <AuthLayoutShell>
      {/* Marketing Side Hero */}
      <AuthSideCard mode="register" />

      {/* 2-Step Form Column */}
      <div className="lg:col-span-7 w-full">
        <RegisterCard />
      </div>
    </AuthLayoutShell>
  );
}
