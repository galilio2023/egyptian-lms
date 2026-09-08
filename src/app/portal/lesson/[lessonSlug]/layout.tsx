import type { Metadata } from "next";
import { INITIAL_LESSONS } from "@/lib/db/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = INITIAL_LESSONS.find((l) => l.slug === lessonSlug);
  if (!lesson) return { title: "المحاضرة التعليمية", robots: { index: false, follow: false } };
  return {
    title: lesson.title,
    description: `محاضرة تفاعلية: ${lesson.title} (${lesson.videoDuration})`,
    robots: { index: false, follow: false },
  };
}

export default function LessonSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
