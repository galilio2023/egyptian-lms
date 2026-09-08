import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INITIAL_UNITS, INITIAL_LESSONS, INITIAL_QUIZ } from "@/lib/db/mock-data";
import { UnitLearnClient } from "@/features/portal-learn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ unitSlug: string }>;
}): Promise<Metadata> {
  const { unitSlug } = await params;
  const unit = INITIAL_UNITS.find((u) => u.slug === unitSlug);
  if (!unit) return { title: "الوحدة التعليمية" };

  return {
    title: `${unit.title} (${unit.gradeTitle})`,
    description: unit.description,
    openGraph: {
      title: `${unit.title} | ${unit.gradeTitle}`,
      description: unit.description,
      images: unit.thumbnailUrl ? [{ url: unit.thumbnailUrl }] : [],
    },
  };
}

export default async function UnitLearnPage({
  params,
}: {
  params: Promise<{ unitSlug: string }>;
}) {
  const { unitSlug } = await params;
  const unit = INITIAL_UNITS.find((u) => u.slug === unitSlug);

  if (!unit) {
    notFound();
  }

  const lessons = INITIAL_LESSONS.filter((l) => l.unitId === unit.id);
  const quizId = INITIAL_QUIZ.id;

  return (
    <UnitLearnClient
      unit={unit}
      lessons={lessons}
      quizId={quizId}
      unitSlug={unitSlug}
    />
  );
}
