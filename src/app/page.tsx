import type { Metadata } from "next";
import { HomePageClient } from "@/features/landing/components/home-page-client";
import { getLandingPageData, getHonorBoardChampions } from "@/lib/data-landing";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLandingPageData();
  const academy = settings.academyNameArabic || "المنصة التعليمية";
  const teacher = settings.teacherNameArabic || "معلم المادة";
  return {
    title: `${academy} | ${teacher} — منهج اللغة الإنجليزية للمراحل الابتدائية`,
    description: settings.teacherBio || `المنصة الرائدة في تعليم وتأسيس مناهج Connect و Connect Plus مع ${teacher}.`,
    openGraph: {
      title: `${academy} — ${teacher}`,
      description: `شرح تفاعلي وكارتوني لمناهج Connect و Connect Plus للمرحلة الابتدائية.`,
      locale: "ar_EG",
      type: "website",
    },
  };
}

export default async function HomePage() {
  const [{ units, settings }, champions] = await Promise.all([
    getLandingPageData(),
    getHonorBoardChampions(),
  ]);

  return (
    <HomePageClient
      initialUnits={units}
      initialSettings={settings}
      initialChampions={champions}
    />
  );
}
