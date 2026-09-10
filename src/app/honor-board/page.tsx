import type { Metadata } from "next";
import { HonorBoardPageClient } from "@/features/landing/components/honor-board-page-client";
import { getLandingPageData, getHonorBoardChampions } from "@/lib/data-landing";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLandingPageData();
  const academy = settings.academyNameArabic || "منصة التميز التعليمية";

  return {
    title: `لوحة الشرف وأبطال التميز | ${academy}`,
    description: `تكريم أوائل الطلاب والمتفوقين على مستوى المحافظات في اختبارات وتحديات اللغة الإنجليزية بالأكاديمية.`,
    openGraph: {
      title: `لوحة الشرف وأبطال التميز — ${academy}`,
      description: `تعرف على فرسان الصدارة وأعلى نقاط التفوق (XP) في المرحلة الابتدائية.`,
      locale: "ar_EG",
      type: "website",
    },
  };
}

export default async function HonorBoardPage() {
  const [{ settings }, champions] = await Promise.all([
    getLandingPageData(),
    getHonorBoardChampions(),
  ]);

  return <HonorBoardPageClient settings={settings} initialChampions={champions} />;
}
