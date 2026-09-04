"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Volume2
} from "lucide-react";
import type { MockQuiz } from "@/lib/db/mock-data";
import { 
  ChampionCupSvg, 
  XpGemSvg, 
  ExamQuizSheetSvg, 
  WhatsAppBubbleSvg 
} from "@/components/ui/illustrated-icons";
import { PrintableCertificate } from "@/components/lms/printable-certificate";

interface InteractiveQuizEngineProps {
  quiz: MockQuiz;
  studentName?: string;
  parentPhone?: string;
  studentPhone?: string;
  onComplete?: (score: number, passed: boolean) => void;
}

interface ServerGradeResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  earnedXp: number;
  alreadyPassed?: boolean;
  remainingAttempts?: number;
  maxAttempts?: number;
  results: Record<string, { correct: boolean; correctAnswerId: string; explanation: string }>;
  parentNotification?: {
    parentPhone: string;
    whatsappUrl: string;
    messageText: string;
  };
}

export function InteractiveQuizEngine({
  quiz,
  studentName = "أحمد محمود الخولي",
  parentPhone = "01098765432",
  studentPhone = "01012345678",
  onComplete,
}: InteractiveQuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [gradeResult, setGradeResult] = useState<ServerGradeResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const selectedAnswersRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;

  // Sound synthesis utility reusing a single AudioContext safely
  const playChimeSound = useCallback((type: 'correct' | 'complete' | 'warning') => {
    if (typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          audioCtxRef.current = new AudioCtxClass();
        }
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'complete') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.55);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Ignore audio synth errors gracefully
    }
  }, []);

  // Text-to-Speech Pronunciation for English Phonics
  const speakEnglishText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info("خاصية النطق الصوتي غير مدعومة على هذا المتصفح.");
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[_]/g, " blank ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmitQuiz = useCallback(async (forcedAnswers?: Record<string, string>) => {
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

        if (data.passed) {
          playChimeSound('complete');
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.6 },
          });
          const xpMsg = data.earnedXp > 0 ? `وحصلت على +${data.earnedXp} XP` : `(تم تسجيل اجتيازك)`;
          toast.success(`🎉 مبروك! لقد اجتزت الاختبار بنجاح ${xpMsg}`);
        } else {
          toast.error("لم تجتز درجة النجاح المطلوبة، يمكنك مراجعة الشرح وإعادة المحاولة.");
        }

        onComplete?.(data.score, data.passed);
      }
    } catch (err) {
      console.error("Grading failed:", err);
      toast.error("حدث خطأ أثناء الاتصال بخادم التصحيح.");
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz.id, studentName, parentPhone, studentPhone, isSubmitting, isSubmitted, onComplete, playChimeSound]);

  // Clean countdown timer with safe completion trigger
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

  // Robust Anti-Cheat Tab-Switch & Window-Blur Detection with 4-second Grace Period
  useEffect(() => {
    if (isSubmitted) return;
    let graceTimeout: NodeJS.Timeout | null = null;

    const triggerSuspiciousLeave = () => {
      if (graceTimeout) return;
      graceTimeout = setTimeout(() => {
        setTabSwitchWarnings((prev) => {
          const updated = prev + 1;
          playChimeSound('warning');
          if (updated >= 3) {
            toast.error("⚠️ تنبيه أمني: مغادرة شاشة الاختبار 3 مرات! تم تسليم الاختبار تلقائياً منعاً للغش.");
            handleSubmitQuiz();
          } else {
            toast.warning(`⚠️ تحذير أمني: يرجى عدم مغادرة شاشة الاختبار أو التبديل بين النوافذ (${updated}/3).`);
          }
          return updated;
        });
        graceTimeout = null;
      }, 4000);
    };

    const cancelSuspiciousLeave = () => {
      if (graceTimeout) {
        clearTimeout(graceTimeout);
        graceTimeout = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerSuspiciousLeave();
      } else {
        cancelSuspiciousLeave();
      }
    };

    const handleWindowBlur = () => {
      triggerSuspiciousLeave();
    };

    const handleWindowFocus = () => {
      cancelSuspiciousLeave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      if (graceTimeout) clearTimeout(graceTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isSubmitted, handleSubmitQuiz, playChimeSound]);

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted || isSubmitting || !currentQuestion) return;
    playChimeSound('correct');
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  // Completed Results View
  if (isSubmitted && gradeResult) {
    return (
      <div className="modern-card bg-white/95 backdrop-blur-md p-8 max-w-2xl mx-auto space-y-6 text-center shadow-xl border-2 border-purple-200 animate-in fade-in-50 duration-500">
        <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center bg-purple-50 border border-purple-200 shadow-md">
          {gradeResult.passed ? (
            <ChampionCupSvg className="w-16 h-16 animate-bounce" />
          ) : (
            <XCircle className="w-14 h-14 text-rose-500" />
          )}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {gradeResult.passed ? "ألف مبروك يا بطل! اجتزت الاختبار بنجاح 🎉" : "حاول مرة أخرى! يمكنك مراجعة الدرس وإعادة الاختبار 💪"}
          </h2>
          <p className="text-xs sm:text-sm text-purple-700 font-bold mt-1">
            {quiz.title} • {studentName}
          </p>
        </div>

        {/* Score Pill Card */}
        <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl p-4 border border-purple-200">
          <div>
            <div className="text-xs font-bold text-slate-500">الدرجة المكتسبة</div>
            <div className="text-2xl font-black text-slate-900">{gradeResult.score} / {gradeResult.total}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">النسبة المئوية</div>
            <div className={`text-2xl font-black ${gradeResult.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
              %{gradeResult.percentage}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">مكافأة النقاط</div>
            <div className="text-2xl font-black text-purple-700 flex items-center justify-center gap-1">
              <XpGemSvg className="w-5 h-5" />
              <span>+{gradeResult.earnedXp} XP</span>
            </div>
            {gradeResult.alreadyPassed && (
              <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">سبق احتساب النقاط</span>
            )}
          </div>
        </div>

        {/* Attempts Usage Notice */}
        {typeof gradeResult.remainingAttempts === "number" && (
          <div className="text-xs font-bold text-slate-600 bg-slate-100/80 border border-slate-200 py-1.5 px-4 rounded-xl inline-block">
            المحاولات المتبقية: <span className="text-indigo-600 font-black">{gradeResult.remainingAttempts}</span> من أصل {gradeResult.maxAttempts || 3}
          </div>
        )}

        {/* Certificate Button if passed */}
        {gradeResult.passed && (
          <button
            onClick={() => setShowCertificate(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:scale-[1.02] text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-950" />
            <span>عرض وتحميل شهادة تفوق بطل الإيليت (Print Certificate) 📜🎓</span>
          </button>
        )}

        {/* WhatsApp Parent Loop Status */}
        {gradeResult.parentNotification && (
          <div className="rounded-2xl bg-emerald-50/90 border-2 border-emerald-200 p-4 text-right space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <WhatsAppBubbleSvg className="w-9 h-9 shrink-0 drop-shadow-sm" />
                <div>
                  <span className="font-black text-emerald-950 text-xs block">
                    تقرير ولي الأمر التلقائي (واتساب)
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    رقم ولي الأمر: <bdi dir="ltr">{gradeResult.parentNotification.parentPhone}</bdi>
                  </span>
                </div>
              </div>

              <a
                href={gradeResult.parentNotification.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.03] text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <span>مشاركة فورية لواتساب</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            
            <p className="text-[11px] text-emerald-800 bg-emerald-100/70 p-3 rounded-xl font-mono leading-relaxed text-right border border-emerald-200">
              {gradeResult.parentNotification.messageText}
            </p>
          </div>
        )}

        {/* Question Review Breakdown with Pronunciation Button */}
        <div className="text-right space-y-3 pt-2">
          <h4 className="font-bold text-sm text-slate-900">مراجعة الإجابات النموذجية والشرح:</h4>
          <div className="space-y-2">
            {quiz.questions.map((q, idx) => {
              const res = gradeResult.results[q.id];
              const isCorrect = res?.correct;
              return (
                <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakEnglishText(q.text)}
                        className="p-1 rounded-md bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50"
                        title="استمع لنطق السؤال"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-slate-800">{idx + 1}. <bdi dir="ltr">{q.text}</bdi></span>
                    </div>
                    <span className={isCorrect ? "text-emerald-600" : "text-rose-600"}>
                      {isCorrect ? "إجابة صحيحة ✓" : "إجابة خاطئة ✗"}
                    </span>
                  </div>
                  {res?.explanation && (
                    <p className="text-[11px] text-slate-500 pt-1">💡 التوضيح: {res.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {gradeResult.remainingAttempts === 0 ? (
            <div className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl">
              تم استنفاد جميع المحاولات المتاحة لهذا الاختبار ({gradeResult.maxAttempts || 3} محاولات).
            </div>
          ) : (
            <button
              onClick={() => {
                setIsSubmitted(false);
                setGradeResult(null);
                setSelectedAnswers({});
                setCurrentIndex(0);
                setTimeLeft(quiz.timeLimitMinutes * 60);
                startTimeRef.current = Date.now();
                setTabSwitchWarnings(0);
              }}
              className="px-6 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-2 transition-all border border-purple-200 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة الاختبار {typeof gradeResult.remainingAttempts === "number" ? `(${gradeResult.remainingAttempts} محاولات متبقية)` : ""}</span>
            </button>
          )}
        </div>

        {/* Printable Certificate Modal */}
        {showCertificate && (
          <PrintableCertificate
            studentName={studentName}
            quizTitle={quiz.title}
            courseTitle="منهاج اللغة الإنجليزية الحديث 2026 - 2027"
            scorePercentage={gradeResult.percentage}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="modern-card bg-white p-8 max-w-2xl mx-auto text-center space-y-4">
        <p className="text-sm text-slate-600">لا توجد أسئلة متاحة في هذا الاختبار حالياً.</p>
      </div>
    );
  }

  // Active Quiz Room View with Copy Protection & Right-Click Prevention
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
      
      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <ExamQuizSheetSvg className="w-11 h-11 shrink-0" />
          <div>
            <span className="text-xs font-black text-purple-800 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              الاختبار التفاعلي الذكي
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">{quiz.title}</h2>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950 font-mono font-black text-sm shadow-sm">
          <Timer className="w-4 h-4 text-amber-600" />
          <span>
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Tab Switch Warning Badge */}
      {tabSwitchWarnings > 0 && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2 font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span>
            تحذير أمني: تم رصد مغادرة شاشة الاختبار ({tabSwitchWarnings}/3 مرات). تكرار ذلك سيؤدي إلى تسليم الاختبار تلقائياً.
          </span>
        </div>
      )}

      {/* Question Progress Dots */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>السؤال {currentIndex + 1} من {totalQuestions}</span>
        <div className="flex items-center gap-1.5">
          {quiz.questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 ring-4 ring-indigo-100 scale-110'
                    : isAnswered
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Current Question Text with Pronunciation Speaker Tool */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 leading-relaxed text-right flex-1">
            <bdi dir="ltr">{currentQuestion.text}</bdi>
          </h3>

          <button
            onClick={() => speakEnglishText(currentQuestion.text)}
            className={`p-2.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold ${
              isSpeaking
                ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                : 'bg-white hover:bg-indigo-50 text-indigo-700 border-slate-200'
            }`}
            title="انقر للاستماع للنطق الإنجليزي السليم"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">نطق السؤال</span>
          </button>
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
            return (
              <div
                key={opt.id}
                className={`w-full p-4 rounded-xl text-right font-medium text-sm transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 border-2 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-800'
                }`}
                onClick={() => handleSelectOption(opt.id)}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakEnglishText(opt.text);
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      isSelected ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="استمع للنطق"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-semibold"><bdi dir="ltr">{opt.text}</bdi></span>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-white bg-white text-indigo-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0 || isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          السابق
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            التالي
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => handleSubmitQuiz()}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>جاري التصحيح واعتماد النتيجة...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>تسليم وإنهاء الاختبار</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
