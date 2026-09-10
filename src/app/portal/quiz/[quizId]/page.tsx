import type { Metadata } from "next";
import { QuizRoomClient } from "@/features/quiz-engine/components/quiz-room-client";

interface PageProps {
  params: Promise<{ quizId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { quizId } = await params;
  return {
    title: `غرفة الاختبار الإلكتروني | Quiz`,
    description: `غرفة التحدي والاختبار التفاعلي للوحدة الدراسية - معرف الاختبار: ${quizId}`,
    robots: { index: false, follow: false },
  };
}

export default async function QuizRoomPage({ params }: PageProps) {
  const { quizId } = await params;
  return <QuizRoomClient quizId={quizId} />;
}
