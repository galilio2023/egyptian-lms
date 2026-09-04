"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InteractiveQuizEngine } from "@/components/lms/interactive-quiz-engine";
import { INITIAL_QUIZ, ADVENTURE_QUIZZES_MAP } from "@/lib/db/mock-data";
import { useSession } from "@/lib/auth/auth-client";
import { ChampionCupSvg } from "@/components/ui/illustrated-icons";

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
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="max-w-4xl mx-auto rounded-full bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-[0_8px_30px_rgba(139,92,246,0.1)] px-5 py-2.5 flex items-center justify-between">
          
          <Link 
            href="/portal/dashboard" 
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-purple-600" />
            <span>العودة لدروس الوحدة</span>
          </Link>

          <span className="text-xs font-black text-amber-900 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 flex items-center gap-2 shadow-sm">
            <ChampionCupSvg className="w-4 h-4" />
            غرفة الاختبار الإلكتروني
          </span>

        </div>
      </header>

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
