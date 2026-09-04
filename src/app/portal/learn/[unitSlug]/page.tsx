"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ChevronLeft, 
  Volume2
} from "lucide-react";
import { INITIAL_UNITS, INITIAL_LESSONS, INITIAL_QUIZ, type MockUnit, type MockLesson } from "@/lib/db/mock-data";
import { 
  CurriculumBookSvg, 
  ChampionCupSvg, 
  WorksheetPdfSvg, 
  PhonicsSpeechSvg, 
  XpGemSvg 
} from "@/components/ui/illustrated-icons";

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
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="max-w-5xl mx-auto rounded-full bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-[0_8px_30px_rgba(139,92,246,0.1)] px-5 py-2.5 flex items-center justify-between">
          
          <Link href="/portal/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors">
            <ArrowRight className="w-4 h-4 text-purple-600" />
            <span>العودة إلى لوحة الطالب</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-purple-800 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200">
              {currentUnit.gradeTitle}
            </span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Unit Overview Header */}
        <div className="modern-card bg-white/95 backdrop-blur-md p-6 sm:p-8 space-y-4 border-2 border-purple-100 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <CurriculumBookSvg className="w-14 h-14 shrink-0 drop-shadow-sm" />
              <div className="space-y-1">
                <span className="text-xs font-black text-purple-800 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-1.5 shadow-sm">
                  محتوى الوحدة الدراسية
                </span>
                <div className="flex items-center gap-2.5 pt-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {currentUnit.title}
                  </h1>
                  <button
                    onClick={() => speakEnglish(currentUnit.title, "unit-title")}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      speakingId === "unit-title" ? "bg-purple-600 text-white border-purple-600" : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    }`}
                    title="استمع لنطق عنوان الوحدة"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
                  {currentUnit.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/portal/quiz/${quizId}`}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.03] text-white font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
              >
                <ChampionCupSvg className="w-5 h-5 drop-shadow" />
                <span>دخول الاختبار التفاعلي</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Lessons Playlist */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <PhonicsSpeechSvg className="w-6 h-6" />
            <span>محاضرات ودروس الوحدة</span>
          </h2>

          {lessons.length === 0 ? (
            <div className="modern-card bg-white p-8 text-center border border-purple-100">
              <p className="text-sm text-slate-500 font-medium">لا توجد دروس متاحة لهذه الوحدة حالياً.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="modern-card bg-white/95 backdrop-blur-md p-5 border-2 border-purple-100 hover:border-purple-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-sm ${
                      idx === 0 ? 'bg-gradient-vibrant text-white shadow-purple-500/25' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-slate-900 hover:text-purple-700 transition-colors">
                          {lesson.title}
                        </h3>
                        <button
                          onClick={() => speakEnglish(lesson.title, lesson.id)}
                          className={`p-1 rounded-md border transition-colors ${
                            speakingId === lesson.id ? "bg-purple-600 text-white border-purple-600" : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          }`}
                          title="استمع للنطق"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mt-1">
                        <span>مدة الفيديو: {lesson.videoDuration}</span>
                        {lesson.pdfAttachmentUrl && (
                          <span className="text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <WorksheetPdfSvg className="w-3.5 h-3.5" />
                            ملزمة ملونة مرفقة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {lesson.pdfAttachmentUrl && (
                      <a
                        href={lesson.pdfAttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <WorksheetPdfSvg className="w-4 h-4" />
                        <span className="hidden sm:inline">تحميل الملزمة</span>
                      </a>
                    )}
                    <Link
                      href={`/portal/lesson/${lesson.slug}`}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition-all"
                    >
                      <XpGemSvg className="w-4 h-4" />
                      <span>مشاهدة المحاضرة</span>
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
