import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedCurriculumUnit } from "@/lib/data-curriculum";
import { UnitLearnClient } from "@/features/portal-learn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unitSlug: string }>;
}): Promise<Metadata> {
  const { unitSlug } = await params;
  const data = await getCachedCurriculumUnit(unitSlug);
  if (!data?.unit) return { title: "الوحدة التعليمية" };

  return {
    title: `${data.unit.title} (${data.unit.gradeTitle})`,
    description: data.unit.description,
    openGraph: {
      title: `${data.unit.title} | ${data.unit.gradeTitle}`,
      description: data.unit.description,
      images: data.unit.thumbnailUrl ? [{ url: data.unit.thumbnailUrl }] : [],
    },
  };
}

export default async function UnitLearnPage({
  params,
}: {
  params: Promise<{ unitSlug: string }>;
}) {
  const { unitSlug } = await params;
  const data = await getCachedCurriculumUnit(unitSlug);

  if (!data || !data.unit) {
    notFound();
  }

  return (
    <UnitLearnClient
      unit={data.unit}
      lessons={data.lessons}
      quizId={data.quizId}
      unitSlug={unitSlug}
    />
  );
}
