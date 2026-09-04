"use client";

import { use } from "react";
import { InteractiveQuizEngine } from "@/features/quiz-engine";
import { INITIAL_QUIZ, ADVENTURE_QUIZZES_MAP } from "@/lib/db/mock-data";
import { useSession } from "@/lib/auth/auth-client";
import { ChampionCupSvg } from "@/components/ui/illustrated-icons";
import { PortalTopBar } from "@/components/shared/portal-top-bar";

export default function QuizRoomPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { data: session } = useSession();
  const { quizId } = use(params);
  const quiz = ADVENTURE_QUIZZES_MAP[quizId] || INITIAL_QUIZ;

  const studentName = session?.user?.name || "أحمد محمود الخولي";
  const studentPhone = ((session?.user as Record<string, unknown>)?.phoneNumber as string) || "01012345678";

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      {/* Top Bar - Apple Style Pill */}
      <PortalTopBar
        backHref="/portal/dashboard"
        backLabel="العودة لدروس الوحدة"
        maxWidthClass="max-w-4xl"
        actions={
          <span className="text-xs font-black text-amber-900 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 flex items-center gap-2 shadow-sm">
            <ChampionCupSvg className="w-4 h-4" />
            غرفة الاختبار الإلكتروني
          </span>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveQuizEngine
          quiz={quiz}
          studentName={studentName}
          studentPhone={studentPhone}
          parentPhone="01098765432"
          onComplete={(score, passed) => {
            console.log("Quiz completed:", { score, passed });
          }}
        />
      </main>
    </div>
  );
}
