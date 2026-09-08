"use client";

import React, { useState, useEffect } from "react";
import type { MockUnit, MockLesson } from "@/lib/db/mock-data";
import { PortalTopBar } from "@/components/shared/portal-top-bar";
import { UnitOverviewHeader } from "./unit-overview-header";
import { UnitLessonsList } from "./unit-lessons-list";

export interface UnitLearnClientProps {
  unit: MockUnit;
  lessons: MockLesson[];
  quizId: string;
  unitSlug: string;
}

export function UnitLearnClient({
  unit: initialUnit,
  lessons: initialLessons,
  quizId: initialQuizId,
  unitSlug,
}: UnitLearnClientProps) {
  const [currentUnit, setCurrentUnit] = useState<MockUnit>(initialUnit);
  const [lessons, setLessons] = useState<MockLesson[]>(initialLessons);
  const [quizId, setQuizId] = useState<string>(initialQuizId);
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
