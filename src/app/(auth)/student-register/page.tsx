import type { Metadata } from "next";
import { AuthSideCard, RegisterCard } from "@/features/auth";

export const metadata: Metadata = {
  title: "تسجيل طالب جديد",
  description: "سجل بياناتك الآن كبطل جديد في المنصة واستمتع بالمحاضرات الكرتونية، كويزات التحدي، وشهادات التميز.",
};

export default function StudentRegisterPage() {
  return (
    <>
      {/* Marketing Side Hero */}
      <AuthSideCard mode="register" />

      {/* 2-Step Form Column */}
      <div className="lg:col-span-7 w-full">
        <RegisterCard />
      </div>
    </>
  );
}
