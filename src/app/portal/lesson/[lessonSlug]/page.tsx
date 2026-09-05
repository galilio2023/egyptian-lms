"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { ProtectedVideoPlayer } from "@/features/video-player";
import { INITIAL_LESSONS, INITIAL_QUIZ, INITIAL_UNITS, type MockLesson, type MockUnit } from "@/lib/db/mock-data";
import { useSession } from "@/lib/auth/auth-client";
import { ChampionCupSvg } from "@/components/ui/illustrated-icons";
import { EgyptianCheckoutModal } from "@/features/checkout";
import { PortalTopBar } from "@/components/shared/portal-top-bar";
import { LockedLessonCard, LessonWorksheetsCard } from "@/features/portal-lesson";

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { data: session } = useSession();
  const { lessonSlug } = use(params);
  const [lesson, setLesson] = useState<MockLesson>(() => {
    return INITIAL_LESSONS.find((l) => l.slug === lessonSlug) || INITIAL_LESSONS[0];
  });
  const [unit, setUnit] = useState<MockUnit>(() => {
    return INITIAL_UNITS.find((u) => u.id === lesson.unitId) || INITIAL_UNITS[0];
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(() => {
    return Boolean(lesson.isFreePreview);
  });
  const [quizId, setQuizId] = useState(INITIAL_QUIZ.id);

  useEffect(() => {
    let active = true;
    fetch(`/api/public/lesson/${lessonSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.lesson) {
          setLesson(data.lesson);
          if (data.unit) setUnit(data.unit);
          if (data.quizId) setQuizId(data.quizId);
          setIsEnrolled(Boolean(data.isEnrolled || data.lesson.isFreePreview));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lessonSlug]);

  useEffect(() => {
    if (lesson.isFreePreview) return;
    let active = true;
    fetch("/api/student/enrollments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.enrolledUnitIds) {
          const hasAccess = data.enrolledUnitIds.includes(unit.id) || data.enrolledUnitIds.includes(unit.slug);
          if (hasAccess) {
            setIsEnrolled(true);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lesson.isFreePreview, unit.id, unit.slug]);

  const handleEnrollSuccess = () => {
    fetch(`/api/public/lesson/${lessonSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.lesson) {
          setLesson(data.lesson);
          if (data.unit) setUnit(data.unit);
          setIsEnrolled(Boolean(data.isEnrolled || data.lesson.isFreePreview));
        }
      })
      .catch(() => {});
    setIsCheckoutOpen(false);
  };

  const studentName = session?.user?.name || "طالب بطل";
  const studentPhone = ((session?.user as Record<string, unknown>)?.phoneNumber as string) || "01000000000";
  const isAccessible = isEnrolled || Boolean(lesson.isFreePreview);

  const unitLessons = INITIAL_LESSONS.filter((l) => l.unitId === unit.id).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const currentIndex = unitLessons.findIndex((l) => l.slug === lessonSlug || l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? unitLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < unitLessons.length - 1 ? unitLessons[currentIndex + 1] : null;
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      {/* Top Header - Apple Style Pill */}
      <PortalTopBar
        backHref={`/portal/learn/${unit.slug}`}
        backLabel={`العودة للوحدة (${unit.title})`}
        maxWidthClass="max-w-6xl"
        actions={
          <Link
            href={`/portal/quiz/${quizId}`}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.03] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 transition-all"
          >
            <ChampionCupSvg className="w-4 h-4" />
            <span>اختبار الدرس</span>
          </Link>
        }
      />

      {/* Main Player Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {!isAccessible ? (
          <LockedLessonCard
            lesson={lesson}
            unit={unit}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        ) : (
          <>
            {/* DRM Video Player */}
            <div className="rounded-3xl p-3 bg-gradient-to-tr from-purple-950 via-slate-900 to-black shadow-2xl border-2 border-purple-500/30">
              <ProtectedVideoPlayer
                src={lesson.videoUrl}
                studentName={studentName}
                studentPhone={studentPhone}
                title={lesson.title}
              />
            </div>

            {/* Seamless Lesson Step Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-100 shadow-md">
              {prevLesson ? (
                <Link
                  href={`/portal/lesson/${prevLesson.slug}`}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-2 border border-purple-200 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق: {prevLesson.title}</span>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}

              <button
                type="button"
                onClick={() => {
                  setIsCompleted(true);
                  confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                  toast.success("أحسنت يا بطل! تم تسجيل إتمام المحاضرة وحصلت على +15 XP 🌟");
                }}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCompleted
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? "تم إنهاء الدرس بنجاح ✓" : "تحديد الدرس كمكتمل (+15 XP)"}</span>
              </button>

              {nextLesson ? (
                <Link
                  href={`/portal/lesson/${nextLesson.slug}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                >
                  <span>التالي: {nextLesson.title}</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/portal/quiz/${quizId}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>انتقل لاختبار الوحدة 🏆</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Lesson Notes & PDF Worksheets Card */}
            <LessonWorksheetsCard pdfAttachmentUrl={lesson.pdfAttachmentUrl} />
          </>
        )}

        {/* Checkout Modal */}
        <EgyptianCheckoutModal
          unit={unit}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleEnrollSuccess}
        />
      </main>
    </div>
  );
}
