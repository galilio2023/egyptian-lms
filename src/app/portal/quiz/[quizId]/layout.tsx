import type { Metadata } from "next";
import { ADVENTURE_QUIZZES_MAP, INITIAL_QUIZ } from "@/lib/db/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ quizId: string }>;
}): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = ADVENTURE_QUIZZES_MAP[quizId] || INITIAL_QUIZ;
  return {
    title: `اختبار التحدي: ${quiz.title}`,
    description: "اختبر مهاراتك في اللغة الإنجليزية واجمع نقاط XP ومكافآت الأبطال.",
    robots: { index: false, follow: false },
  };
}

export default function QuizSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
