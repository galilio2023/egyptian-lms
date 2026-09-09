import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedLesson } from "@/lib/data-curriculum";
import { LessonPlayerClient } from "@/features/portal-lesson";

interface PageProps {
  params: Promise<{ lessonSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const data = await getCachedLesson(lessonSlug);
  if (!data?.lesson) {
    return {
      title: "المحاضرة التعليمية",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${data.lesson.title} | ${data.unit.title}`,
    description: `محاضرة تفاعلية: ${data.lesson.title} (${data.lesson.videoDuration})`,
    robots: { index: false, follow: false },
  };
}

export default async function LessonPlayerPage({ params }: PageProps) {
  const { lessonSlug } = await params;
  const data = await getCachedLesson(lessonSlug);

  if (!data || !data.lesson) {
    notFound();
  }

  return (
    <LessonPlayerClient
      initialLesson={data.lesson}
      initialUnit={data.unit}
      initialPlaylist={data.playlist}
      initialQuizId={data.quizId}
      lessonSlug={lessonSlug}
    />
  );
}
