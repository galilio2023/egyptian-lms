"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/auth-client";
import {
  getSrsDeckStorageKey,
  mergeSrsDeckWithDefaults,
} from "@/lib/srs-storage";
import { useQuizAudio } from "../hooks/use-quiz-audio";
import { useAntiCheat } from "../hooks/use-anti-cheat";
import { QuizActiveHeader } from "./quiz-active-header";
import { QuizQuestionCard } from "./quiz-question-card";
import { QuizNavFooter } from "./quiz-nav-footer";
import { QuizResultsCard } from "./quiz-results-card";
import type { InteractiveQuizEngineProps, ServerGradeResult } from "../types";

export function InteractiveQuizEngine({
  quiz,
  studentName = "طالب بطل",
  parentPhone = "01000000000",
  studentPhone = "01000000000",
  onComplete,
}: InteractiveQuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [gradeResult, setGradeResult] = useState<ServerGradeResult | null>(null);
  const [srsSyncStatus, setSrsSyncStatus] = useState<"synced" | "failed" | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const selectedAnswersRef = useRef<Record<string, string>>({});

  const { isSpeaking, playChimeSound, speakEnglishText } = useQuizAudio();

  const { data: session } = useSession();
  const userId = session?.user?.id;
  const draftStorageKey = userId ? `elite_quiz_draft_${quiz.id}_${userId}` : null;
  const srsDeckStorageKey = getSrsDeckStorageKey(userId);

  const handleSubmitQuiz = useCallback(
    async (forcedAnswers?: Record<string, string>) => {
      if (isSubmitting || isSubmitted) return;
      setIsSubmitting(true);

      const answersToSubmit = forcedAnswers || selectedAnswersRef.current;
      const startMs = startTimeRef.current || Date.now();
      const timeSpent = Math.max(1, Math.round((Date.now() - startMs) / 1000));

      try {
        const response = await fetch("/api/quiz/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quiz.id,
            answers: answersToSubmit,
            studentName,
            parentPhone,
            studentPhone,
            timeSpentSeconds: timeSpent,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.error || "تعذر تسليم الاختبار.");
          setIsSubmitting(false);
          return;
        }

        const data: ServerGradeResult = await response.json();

        if (data && typeof data.score === "number") {
          setGradeResult(data);
          setIsSubmitted(true);
          if (draftStorageKey) {
            try {
              localStorage.removeItem(draftStorageKey);
            } catch {}
          }

          if (data.passed) {
            playChimeSound("complete");
            import("canvas-confetti")
              .then(({ default: confetti }) => {
                confetti({
                  particleCount: 140,
                  spread: 90,
                  origin: { y: 0.6 },
                });
              })
              .catch(() => {});
            const xpMsg = data.earnedXp > 0 ? `وحصلت على +${data.earnedXp} XP` : `(تم تسجيل اجتيازك)`;
            toast.success(`🎉 مبروك! لقد اجتزت الاختبار بنجاح ${xpMsg}`);
          } else {
            toast.error("لم تجتز درجة النجاح المطلوبة، يمكنك مراجعة الشرح وإعادة المحاولة.");
          }

          // Intelligent Loop: Auto-route missed concepts to Spaced Repetition (SRS) Deck
          if (srsDeckStorageKey && data.missedConcepts && data.missedConcepts.length > 0) {
            try {
              const rawDeck = localStorage.getItem(srsDeckStorageKey);
              const existingDeck = mergeSrsDeckWithDefaults(
                rawDeck ? JSON.parse(rawDeck) : []
              );
              const nowIso = new Date().toISOString();
              let addedCount = 0;

              data.missedConcepts.forEach((concept) => {
                const alreadyExists = Array.isArray(existingDeck) && existingDeck.some(
                  (c: { id?: string; word?: string }) =>
                    c.id === concept.id || c.word?.toLowerCase() === concept.word?.toLowerCase()
                );
                if (!alreadyExists) {
                  existingDeck.unshift({
                    id: concept.id,
                    word: concept.word,
                    phonics: concept.phonics,
                    arabicMeaning: concept.arabicMeaning,
                    exampleSentence: concept.exampleSentence,
                    category: concept.category,
                    intervalDays: 1,
                    repetitions: 0,
                    easeFactor: 2.3,
                    dueDate: nowIso,
                  });
                  addedCount++;
                }
              });

              if (addedCount > 0) {
                localStorage.setItem(srsDeckStorageKey, JSON.stringify(existingDeck));
                toast.info(`🧠 تمت إضافة ${addedCount} مفاهيم تحتاج لمراجعة تلقائياً لكروت الاستذكار الذكي (SRS)!`);
              }
              setSrsSyncStatus("synced");
            } catch (storageErr) {
              console.warn("Could not sync missed quiz concepts to SRS storage:", storageErr);
              setSrsSyncStatus("failed");
            }
          } else if (data.missedConcepts && data.missedConcepts.length > 0) {
            setSrsSyncStatus("failed");
          }

          onComplete?.(data.score, data.passed);
        }
      } catch (err) {
        console.error("Grading failed:", err);
        toast.error("حدث خطأ أثناء الاتصال بخادم التصحيح.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [quiz.id, studentName, parentPhone, studentPhone, isSubmitting, isSubmitted, onComplete, playChimeSound, draftStorageKey, srsDeckStorageKey]
  );

  // Restore draft answers and subtract elapsed time on mount (Issue #17)
  useEffect(() => {
    if (!draftStorageKey) return;
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          selectedAnswersRef.current = parsed.answers;

          const elapsedSeconds = Math.floor(
            (Date.now() - Number(parsed.updatedAt || Date.now())) / 1000
          );
          const savedTimeLeft = typeof parsed.timeLeft === "number" ? parsed.timeLeft : quiz.timeLimitMinutes * 60;
          const remainingTime = Math.max(0, savedTimeLeft - elapsedSeconds);

          let submitTimer: ReturnType<typeof setTimeout> | undefined;
          const timer = setTimeout(() => {
            setSelectedAnswers(parsed.answers);
            setTimeLeft(remainingTime);

            if (remainingTime <= 0) {
              toast.warning("انتهى وقت الاختبار أثناء إغلاق الصفحة! جاري تسليم إجاباتك المحفوظة ⏳");
              submitTimer = setTimeout(() => {
                handleSubmitQuiz(parsed.answers);
              }, 300);
            } else {
              toast.info("تم استرجاع إجاباتك السابقة والوقت المتبقي تلقائياً 🛡️");
            }
          }, 0);

          return () => {
            clearTimeout(timer);
            if (submitTimer !== undefined) clearTimeout(submitTimer);
          };
        }
      }
    } catch {
      // ignore
    }
  }, [draftStorageKey, quiz.timeLimitMinutes, handleSubmitQuiz]);

  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
    // Auto-save draft on every answer change only if authenticated
    if (draftStorageKey && !isSubmitted && Object.keys(selectedAnswers).length > 0) {
      try {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({ answers: selectedAnswers, timeLeft, updatedAt: Date.now() })
        );
      } catch {
        // ignore storage quota error
      }
    }
  }, [selectedAnswers, timeLeft, isSubmitted, draftStorageKey]);

  // Anti-cheat monitoring
  const { tabSwitchWarnings, resetWarnings } = useAntiCheat({
    isSubmitted,
    onAutoSubmit: () => handleSubmitQuiz(),
    onWarningSound: () => playChimeSound("warning"),
  });

  // Countdown timer with auto-submit
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            toast.info("انتهى وقت الاختبار المحدد! جاري تسليم الإجابات...");
            handleSubmitQuiz();
          }, 50);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, handleSubmitQuiz]);

  const handleSelectOption = (optionId: string) => {
    const currentQuestion = quiz.questions[currentIndex];
    if (isSubmitted || isSubmitting || !currentQuestion) return;
    playChimeSound("correct");
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleRetake = () => {
    if (draftStorageKey) {
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {}
    }
    setIsSubmitted(false);
    setGradeResult(null);
    setSrsSyncStatus(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setTimeLeft(quiz.timeLimitMinutes * 60);
    startTimeRef.current = Date.now();
    resetWarnings();
  };

  // Completed Results View
  if (isSubmitted && gradeResult) {
    return (
      <QuizResultsCard
        quiz={quiz}
        studentName={studentName}
        gradeResult={gradeResult}
        srsSyncStatus={srsSyncStatus}
        onRetake={handleRetake}
        onSpeakText={speakEnglishText}
      />
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  if (!currentQuestion) {
    return (
      <div className="modern-card bg-white p-8 max-w-2xl mx-auto text-center space-y-4">
        <p className="text-sm text-slate-600">لا توجد أسئلة متاحة في هذا الاختبار حالياً.</p>
      </div>
    );
  }

  // Active Quiz Room View
  return (
    <div
      className="modern-card bg-white/95 backdrop-blur-md p-6 sm:p-8 max-w-3xl mx-auto space-y-6 shadow-xl border-2 border-purple-200 select-none"
      onCopy={(e) => {
        e.preventDefault();
        toast.warning("نسخ أسئلة الاختبار غير مسموح به للحفاظ على نزاهة التقييم.");
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <QuizActiveHeader
        quiz={quiz}
        timeLeft={timeLeft}
        tabSwitchWarnings={tabSwitchWarnings}
        currentIndex={currentIndex}
        selectedAnswers={selectedAnswers}
        onSelectIndex={setCurrentIndex}
      />

      <QuizQuestionCard
        question={currentQuestion}
        selectedOptionId={selectedAnswers[currentQuestion.id]}
        isSpeaking={isSpeaking}
        onSelectOption={handleSelectOption}
        onSpeakText={speakEnglishText}
      />

      <QuizNavFooter
        currentIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        isSubmitting={isSubmitting}
        onPrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
        onNext={() => setCurrentIndex((prev) => Math.min(prev + 1, quiz.questions.length - 1))}
        onSubmit={() => handleSubmitQuiz()}
      />
    </div>
  );
}
