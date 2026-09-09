import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getCachedLesson, getLessonViewerAccess } from "@/lib/data-curriculum";
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

  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    undefined;

  const cookieHeader = headerList.get("cookie") || "";
  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    (cookieHeader.includes("dev_bypass=true") || process.env.DEV_BYPASS_AUTH === "true");

  const effectiveUserId = session?.user?.id || (isDevBypass ? "student-dev-primary" : undefined);

  const viewerAccess = await getLessonViewerAccess(
    data.lesson.id,
    effectiveUserId,
    clientIp,
    isDevBypass
  );
  const initialLesson = {
    ...data.lesson,
    ...(viewerAccess.isAccessible
      ? {
          videoUrl: viewerAccess.videoUrl,
          checkpoints: viewerAccess.checkpoints,
        }
      : {}),
  };

  return (
    <LessonPlayerClient
      key={lessonSlug}
      initialLesson={initialLesson}
      initialIsAccessible={viewerAccess.isAccessible}
      initialUnit={data.unit}
      initialPlaylist={data.playlist}
      initialQuizId={data.quizId}
      lessonSlug={lessonSlug}
    />
  );
}
