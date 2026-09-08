import type { Metadata } from "next";
import { QuizzesPageClient } from "@/features/landing/components/quizzes-page-client";
import { getLandingPageData } from "@/lib/data-landing";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLandingPageData();
  const academy = settings.academyNameArabic || "منصة التميز التعليمية";

  return {
    title: `تحديات واختبارات الأبطال التفاعلية | ${academy}`,
    description: `مسابقات لغوية شيقة وألعاب ذكية بالذكاء الاصطناعي: مسابقة سبايدر مان، حديقة الحيوان، سلة الفواكه وصائدي الأرقام مع مكافآت نقاط تفوق XP فورية.`,
    openGraph: {
      title: `تحديات واختبارات الأبطال التفاعلية — ${academy}`,
      description: `العب، تعلّم، واجمع نقاط الـ XP في مسابقات تفاعلية بأصوات كارتونية ذكية.`,
      locale: "ar_EG",
      type: "website",
    },
  };
}

export default async function QuizzesPage() {
  const { settings } = await getLandingPageData();

  return <QuizzesPageClient settings={settings} />;
}
