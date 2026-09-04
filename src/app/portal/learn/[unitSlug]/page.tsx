"use client";

import { use, useState, useEffect } from "react";
import { INITIAL_UNITS, INITIAL_LESSONS, INITIAL_QUIZ, type MockUnit, type MockLesson } from "@/lib/db/mock-data";
import { PortalTopBar } from "@/components/shared/portal-top-bar";
import { UnitOverviewHeader, UnitLessonsList } from "@/features/portal-learn";

export default function UnitLearnPage({
  params,
}: {
  params: Promise<{ unitSlug: string }>;
}) {
  const { unitSlug } = use(params);
  const [currentUnit, setCurrentUnit] = useState<MockUnit>(() => {
    return INITIAL_UNITS.find((u) => u.slug === unitSlug) || INITIAL_UNITS[0];
  });
  const [lessons, setLessons] = useState<MockLesson[]>(() => {
    return INITIAL_LESSONS.filter((l) => l.unitId === currentUnit.id);
  });
  const [quizId, setQuizId] = useState<string>(INITIAL_QUIZ.id);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/public/unit/${unitSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.unit) {
          setCurrentUnit(data.unit);
          if (data.lessons && data.lessons.length > 0) {
            setLessons(data.lessons);
          }
          if (data.quizId) {
            setQuizId(data.quizId);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [unitSlug]);

  const speakEnglish = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      {/* Top Bar - Apple Style Pill */}
      <PortalTopBar
        backHref="/portal/dashboard"
        backLabel="العودة إلى لوحة الطالب"
        actions={
          <span className="text-xs font-black text-purple-800 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200">
            {currentUnit.gradeTitle}
          </span>
        }
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Unit Overview Header */}
        <UnitOverviewHeader
          unit={currentUnit}
          quizId={quizId}
          speakingId={speakingId}
          onSpeak={speakEnglish}
        />

        {/* Lessons Playlist */}
        <UnitLessonsList
          lessons={lessons}
          speakingId={speakingId}
          onSpeak={speakEnglish}
        />
      </main>
    </div>
  );
}
