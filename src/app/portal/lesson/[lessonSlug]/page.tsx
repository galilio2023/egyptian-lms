"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
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

  useEffect(() => {
    let active = true;
    fetch(`/api/public/lesson/${lessonSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.lesson) {
          setLesson(data.lesson);
          if (data.unit) setUnit(data.unit);
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

  const studentName = session?.user?.name || "أحمد محمود الخولي";
  const studentPhone = ((session?.user as Record<string, unknown>)?.phoneNumber as string) || "01012345678";
  const isAccessible = isEnrolled || Boolean(lesson.isFreePreview);

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      {/* Top Header - Apple Style Pill */}
      <PortalTopBar
        backHref={`/portal/learn/${unit.slug}`}
        backLabel={`العودة للوحدة (${unit.title})`}
        maxWidthClass="max-w-6xl"
        actions={
          <Link
            href={`/portal/quiz/${INITIAL_QUIZ.id}`}
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
