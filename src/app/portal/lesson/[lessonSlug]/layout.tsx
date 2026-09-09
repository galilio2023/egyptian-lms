import type { Metadata } from "next";
import { getCachedLesson } from "@/lib/data-curriculum";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}): Promise<Metadata> {
  const { lessonSlug } = await params;
  const data = await getCachedLesson(lessonSlug);
  if (!data?.lesson) return { title: "المحاضرة التعليمية", robots: { index: false, follow: false } };
  return {
    title: `${data.lesson.title} | ${data.unit.title}`,
    description: `محاضرة تفاعلية: ${data.lesson.title} (${data.lesson.videoDuration})`,
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
