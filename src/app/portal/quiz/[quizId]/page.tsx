"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { InteractiveQuizEngine } from "@/features/quiz-engine";
import { INITIAL_QUIZ, ADVENTURE_QUIZZES_MAP, type MockQuiz } from "@/lib/db/mock-data";
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

  const [quiz, setQuiz] = useState<MockQuiz>(() => ADVENTURE_QUIZZES_MAP[quizId] || INITIAL_QUIZ);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(!ADVENTURE_QUIZZES_MAP[quizId]);
  const [quizError, setQuizError] = useState<string | null>(null);

  const studentName = session?.user?.name || "طالب بطل";
  const studentPhone = ((session?.user as Record<string, unknown>)?.phoneNumber as string) || "01000000000";
  const [parentPhone, setParentPhone] = useState("01000000000");

  useEffect(() => {
    let active = true;

    // 1. Fetch parent phone
    fetch("/api/student/enrollments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.profile?.parentPhoneNumber) {
          setParentPhone(data.profile.parentPhoneNumber);
        }
      })
      .catch(() => {});

    // 2. Fetch quiz dynamically from backend if not static adventure quiz
    if (!ADVENTURE_QUIZZES_MAP[quizId]) {
      fetch(`/api/quiz/${quizId}`)
        .then(async (res) => {
          if (!active) return;
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "تعذر تحميل بيانات الاختبار.");
          }
          return res.json();
        })
        .then((data) => {
          if (!active) return;
          if (data?.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            setQuiz({
              id: data.id || quizId,
              unitId: data.unitId || "default",
              lessonId: data.lessonId,
              title: data.title || "اختبار التميز",
              timeLimitMinutes: data.timeLimitMinutes || 15,
              passPercentage: data.passPercentage || 60,
              questions: data.questions,
            });
            setQuizError(null);
          } else {
            throw new Error("لا توجد أسئلة مضافة لهذا الاختبار حالياً من قبل المعلم.");
          }
        })
        .catch((err: unknown) => {
          if (active) {
            console.warn("Dynamic quiz fetch fallback:", err);
            setQuizError((err as Error)?.message || "تعذر تحميل الاختبار من الخادم.");
          }
        })
        .finally(() => {
          if (active) setIsLoadingQuiz(false);
        });
    }

    return () => {
      active = false;
    };
  }, [quizId]);

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
        {isLoadingQuiz ? (
          <div className="modern-card p-12 bg-white/95 rounded-3xl border-2 border-purple-100 text-center space-y-4 shadow-xl">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">جاري تجهيز أسئلة الاختبار السحري...</h3>
              <p className="text-xs text-slate-500 font-medium">نعد لك تجربة اختبار شيقة وتفاعلية بنقاط XP وجوائز التميز.</p>
            </div>
          </div>
        ) : quizError ? (
          <div className="modern-card p-8 bg-white/95 rounded-3xl border-2 border-amber-200 text-center space-y-5 shadow-xl">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">تنبيه بخصوص الاختبار</h3>
              <p className="text-xs text-slate-600 font-bold max-w-md mx-auto leading-relaxed">{quizError}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/portal/dashboard"
                className="px-6 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-black transition-colors"
              >
                العودة للوحة الطالب
              </Link>
            </div>
          </div>
        ) : (
          <InteractiveQuizEngine
            quiz={quiz}
            studentName={studentName}
            studentPhone={studentPhone}
            parentPhone={parentPhone}
            onComplete={(score, passed) => {
              if (passed) {
                toast.success(`مبروك يا بطل! حصلت على ${score}% في الاختبار 🎉`);
              } else {
                toast("يمكنك إعادة المحاولة بعد مراجعة الدرس.");
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
