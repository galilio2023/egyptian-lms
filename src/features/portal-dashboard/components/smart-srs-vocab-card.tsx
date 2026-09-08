"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Volume2, RotateCcw, Flame } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface VocabCard {
  id: string;
  word: string;
  phonics: string;
  arabicMeaning: string;
  exampleSentence: string;
  category: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  dueDate: string; // ISO date
}

const DEFAULT_CONNECT_VOCAB: Omit<VocabCard, "intervalDays" | "repetitions" | "easeFactor" | "dueDate">[] = [
  {
    id: "vocab-1",
    word: "Busy Bee",
    phonics: "/b/ sound & double /ee/",
    arabicMeaning: "النحلة النشيطة (شخصية المنهج المحبوبة)",
    exampleSentence: "Look at the Busy Bee flying to the flower!",
    category: "Connect Characters 🐝",
  },
  {
    id: "vocab-2",
    word: "Book",
    phonics: "Short /oo/ sound",
    arabicMeaning: "كتاب مدرسي",
    exampleSentence: "Open your book to page 10, please.",
    category: "School Objects 📚",
  },
  {
    id: "vocab-3",
    word: "Bag",
    phonics: "Short /æ/ sound",
    arabicMeaning: "حقيبة مدرسية",
    exampleSentence: "Put your pencil inside your blue bag.",
    category: "School Objects 🎒",
  },
  {
    id: "vocab-4",
    word: "Hello",
    phonics: "/h/ sound",
    arabicMeaning: "مرحباً / أهلاً",
    exampleSentence: "Hello! My name is Hany.",
    category: "Greetings 👋",
  },
  {
    id: "vocab-5",
    word: "Shake hands",
    phonics: "/sh/ sound & silent e",
    arabicMeaning: "يتصافح بالأيدي (آداب السلوك)",
    exampleSentence: "When you meet a new friend, shake hands.",
    category: "Good Manners 🤝",
  },
];

const STORAGE_KEY = "egyptian_lms_srs_vocab_deck";
const STREAK_KEY = "egyptian_lms_srs_streak";

function buildDefaultDeck(): VocabCard[] {
  return DEFAULT_CONNECT_VOCAB.map((v) => ({
    ...v,
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
  }));
}

function calculateNextInterval(
  card: VocabCard,
  quality: 1 | 3 | 5
): { nextInterval: number; nextEaseFactor: number; nextRepetitions: number } {
  const { intervalDays, repetitions, easeFactor } = card;

  const nextEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality === 1) {
    return {
      nextInterval: 1,
      nextEaseFactor,
      nextRepetitions: 0,
    };
  }

  if (quality === 3) {
    let nextInterval = 1;
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 3;
    } else {
      nextInterval = Math.max(1, Math.round(intervalDays * easeFactor));
    }
    return {
      nextInterval,
      nextEaseFactor,
      nextRepetitions: repetitions + 1,
    };
  }

  // quality === 5 (Easy)
  let nextInterval = 2;
  if (repetitions === 0) {
    nextInterval = 3;
  } else if (repetitions === 1) {
    nextInterval = 5;
  } else {
    nextInterval = Math.max(2, Math.round(intervalDays * nextEaseFactor * 1.3));
  }
  return {
    nextInterval,
    nextEaseFactor,
    nextRepetitions: repetitions + 1,
  };
}

function formatIntervalArabic(days: number): string {
  if (days <= 1) return "غداً";
  if (days === 2) return "بعد يومين";
  if (days >= 3 && days <= 10) return `بعد ${days} أيام`;
  return `بعد ${days} يوماً`;
}

export function SmartSrsVocabCard({ onEarnXp }: { onEarnXp?: (xp: number) => void }) {
  const [deck, setDeck] = useState<VocabCard[]>(() => {
    if (typeof window === "undefined") return buildDefaultDeck();
    try {
      const savedDeck = localStorage.getItem(STORAGE_KEY);
      if (savedDeck) return JSON.parse(savedDeck);
    } catch {
      // Ignore
    }
    return buildDefaultDeck();
  });

  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const savedStreak = localStorage.getItem(STREAK_KEY);
      if (savedStreak) return parseInt(savedStreak, 10) || 1;
    } catch {
      // Ignore
    }
    return 1;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [reviewAhead, setReviewAhead] = useState(false);

  // Filter cards due today (or unreviewed cards)
  const dueCards = useMemo(() => {
    const now = new Date();
    return deck.filter((card) => card.repetitions === 0 || !card.dueDate || new Date(card.dueDate) <= now);
  }, [deck]);

  const activeDeck = useMemo(() => {
    if (reviewAhead) return deck;
    return dueCards;
  }, [reviewAhead, dueCards, deck]);

  const currentCard = activeDeck[currentIndex];

  const hardInterval = currentCard ? calculateNextInterval(currentCard, 1).nextInterval : 1;
  const goodInterval = currentCard ? calculateNextInterval(currentCard, 3).nextInterval : 1;
  const easyInterval = currentCard ? calculateNextInterval(currentCard, 5).nextInterval : 3;

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // SuperMemo-2 (SM-2) Spaced-Repetition Algorithm
  const handleRate = (quality: 1 | 3 | 5) => {
    if (!currentCard) return;

    const { nextInterval, nextEaseFactor, nextRepetitions } = calculateNextInterval(currentCard, quality);

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + nextInterval);

    const updatedDeck = deck.map((c) =>
      c.id === currentCard.id
        ? {
            ...c,
            intervalDays: nextInterval,
            repetitions: nextRepetitions,
            easeFactor: nextEaseFactor,
            dueDate: nextDueDate.toISOString(),
          }
        : c
    );

    setDeck(updatedDeck);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDeck));
    } catch {}

    setIsFlipped(false);

    if (currentIndex + 1 < activeDeck.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed round!
      setIsCompletedToday(true);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      try {
        localStorage.setItem(STREAK_KEY, nextStreak.toString());
      } catch {}

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      toast.success("🎉 بطل حقيقي! أتممت مراجعة كلمات اليوم الذكية وحصلت على 30 XP!");
      onEarnXp?.(30);
    }
  };

  const handleRestart = () => {
    setReviewAhead(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompletedToday(false);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-5 sm:p-6 shadow-2xl border-2 border-purple-400/30">
      {/* Decorative Glow */}
      <div className="absolute -top-16 -end-16 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -start-16 w-40 h-40 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 border border-white/10">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
              <span>تحدي التكرار المتباعد الذكي (Smart Vocab SRS)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                خوارزمية SM-2 🧠
              </span>
            </h3>
            <p className="text-[11px] text-purple-200">
              مراجعة الكلمات قبل نسيانها لتثبيتها في الذاكرة طويلة المدى
            </p>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-black text-xs">
          <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
          <span>{streak} أيام حماس 🔥</span>
        </div>
      </div>

      {/* Main Flashcard Area */}
      {!isCompletedToday && currentCard ? (
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between text-xs text-purple-300 font-bold px-1">
            <span>
              بطاقة {currentIndex + 1} من {activeDeck.length}
            </span>
            <span className="text-amber-300">{currentCard.category}</span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[190px] p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-300/50 transition-all cursor-pointer flex flex-col justify-between shadow-lg select-none group"
          >
            {/* Front Side */}
            {!isFlipped ? (
              <div className="text-center my-auto space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-wide">
                    {currentCard.word}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(currentCard.word);
                    }}
                    className="p-2 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white transition-colors"
                    title="استمع للنطق الإنجليزي"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-purple-950/60 border border-purple-400/40 text-xs font-mono text-purple-200">
                  صوتيات: {currentCard.phonics}
                </div>
                <p className="text-[11px] text-purple-300 opacity-80 pt-2">
                  اضغط على البطاقة لكشف المعنى العربي والمثال 👆
                </p>
              </div>
            ) : (
              /* Back Side */
              <div className="text-center my-auto space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <span className="text-2xl sm:text-3xl font-black text-amber-300">
                  {currentCard.arabicMeaning}
                </span>
                <p className="text-xs sm:text-sm text-purple-100 italic bg-black/20 p-2.5 rounded-xl border border-white/5">
                  &ldquo;{currentCard.exampleSentence}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.exampleSentence);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white font-bold"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>استمع للجملة كاملة</span>
                </button>
              </div>
            )}
          </div>

          {/* Action / Rating Buttons */}
          {isFlipped ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              <span className="text-[11px] text-purple-300 text-center block font-bold">
                كيف كان تذكرك للكلمة؟ (لتحديد موعد المراجعة القادمة ذكياً):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRate(1)}
                  className="py-2.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-black transition-all cursor-pointer"
                >
                  🔴 صعبة ({formatIntervalArabic(hardInterval)})
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(3)}
                  className="py-2.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-black transition-all cursor-pointer"
                >
                  🟡 جيدة ({formatIntervalArabic(goodInterval)})
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(5)}
                  className="py-2.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-black transition-all cursor-pointer"
                >
                  🟢 سهلة ({formatIntervalArabic(easyInterval)})
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 transition-all cursor-pointer"
            >
              كشف المعنى العربي (Flip Card) 🔄
            </button>
          )}
        </div>
      ) : (
        /* Completed State */
        <div className="text-center py-6 space-y-3 relative z-10 animate-in fade-in duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center text-3xl">
            🏆
          </div>
          <h4 className="text-lg font-black text-white">
            مبدع يا بطل! أتممت كلمات اليوم بنجاح 🌟
          </h4>
          <p className="text-xs text-purple-200 max-w-sm mx-auto">
            تمت جدولة الكلمات تلقائياً بمواعيد مراجعة ذكية تناسب سرعة حفظك لحمايتها من النسيان.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>مراجعة إضافية الآن</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
