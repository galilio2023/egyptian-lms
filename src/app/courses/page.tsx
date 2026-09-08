import type { Metadata } from "next";
import { CoursesPageClient } from "@/features/landing/components/courses-page-client";
import { getLandingPageData } from "@/lib/data-landing";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLandingPageData();
  const academy = settings.academyNameArabic || "منصة التميز التعليمية";
  const teacher = settings.teacherNameArabic || "معلم المادة";

  return {
    title: `المناهج والمراحل الدراسية | ${academy} — ${teacher}`,
    description: `استعرض جميع كورسات ومناهج اللغة الإنجليزية للمرحلة الابتدائية (Connect & Connect Plus) للمدارس الرسمية واللغات والخاصة مع ${teacher}.`,
    openGraph: {
      title: `المناهج والمراحل الدراسية — ${academy}`,
      description: `شروحات تفاعلية، فيديوهات كارتونية، وتصحيح واجبات كشكول الطالب لمناهج Connect و Connect Plus.`,
      locale: "ar_EG",
      type: "website",
    },
  };
}

export default async function CoursesPage() {
  const { units, settings } = await getLandingPageData();

  return (
    <CoursesPageClient
      initialUnits={units}
      initialSettings={settings}
    />
  );
}
