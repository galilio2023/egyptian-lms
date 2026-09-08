"use client";

import { useState } from "react";
import Link from "next/link";
import { Volume2, CheckCircle2, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { 
  WorksheetPdfSvg, 
  PhonicsSpeechSvg, 
  ChampionCupSvg, 
  DrmVideoShieldSvg,
  StudentRegisterPencilSvg,
  XpGemSvg,
} from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";
import { PhonicsSoundBoard } from "@/features/phonics";

interface LessonWorksheetsCardProps {
  pdfAttachmentUrl?: string;
}

const INTERACTIVE_DRILL_WORDS = [
  { word: "Apple", phonics: "أَبِلْ", translation: "تفاحة 🍎", example: "I like red apples." },
  { word: "Cat", phonics: "كَاتْ", translation: "قطة 🐱", example: "The cat is fast." },
  { word: "Ship", phonics: "شِبْ", translation: "سفينة 🚢", example: "A big white ship." },
];

export function LessonWorksheetsCard({ pdfAttachmentUrl }: LessonWorksheetsCardProps) {
  const [activeTab, setActiveTab] = useState<"worksheet" | "phonics" | "notes">("worksheet");
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectQuizOption = (option: string) => {
    if (isQuizAnswered) return;
    setSelectedQuizOption(option);
    setIsQuizAnswered(true);

    if (option === "Small") {
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch {}
      toast.success("إجابة صحيحة يا بطل! 🌟 Small هو عكس كلمة Big (+15 XP)");
    } else {
      toast.error("إجابة قريبة! حاول تذكر ما شرحه المعلم في الفيديو 📚");
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-md p-6 sm:p-8 space-y-6 border-2 border-purple-100 shadow-xl">
      {/* Tab Navigation Controls */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-purple-50/80 border border-purple-200 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          type="button"
          onClick={() => setActiveTab("worksheet")}
          className={`flex-1 shrink-0 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "worksheet"
              ? "bg-white text-purple-900 shadow-sm border border-purple-200"
              : "text-slate-600 hover:text-purple-900 hover:bg-white/50"
          }`}
        >
          <WorksheetPdfSvg className="w-4 h-4" />
          <span>الملزمة والواجب المنزلي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("phonics")}
          className={`flex-1 shrink-0 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "phonics"
              ? "bg-white text-purple-900 shadow-sm border border-purple-200"
              : "text-slate-600 hover:text-purple-900 hover:bg-white/50"
          }`}
        >
          <PhonicsSpeechSvg className="w-4 h-4" />
          <span>لوحة الصوتيات الذكية (AI Mic)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`flex-1 shrink-0 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "notes"
              ? "bg-white text-purple-900 shadow-sm border border-purple-200"
              : "text-slate-600 hover:text-purple-900 hover:bg-white/50"
          }`}
        >
          <ChampionCupSvg className="w-4 h-4" />
          <span>إرشادات وتوجيهات المحاضرة</span>
        </button>
      </div>

      {/* Tab 1: Worksheet & PDF Download + Interactive Studio */}
      {activeTab === "worksheet" && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
            <div className="flex items-start gap-4">
              <WorksheetPdfSvg className="w-12 h-12 shrink-0 drop-shadow-sm" />
              <div>
                <h2 className="text-xl font-black text-slate-900">الملزمة والواجب المنزلي الملون</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  قم بتحميل ملزمة الدرس، حل التمارين بخط جميل في كراستك، أو تدرب عبر الملزمة التفاعلية أدناه.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {pdfAttachmentUrl ? (
                <a
                  href={pdfAttachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  <WorksheetPdfSvg className="w-4 h-4" />
                  <span>تحميل ملزمة الدرس PDF</span>
                </a>
              ) : (
                <span className="text-xs text-purple-800 font-bold bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  الملزمة التفاعلية الرقمية متاحة أدناه
                </span>
              )}

              <Link
                href="/portal/dashboard"
                className="px-5 py-2.5 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <StudentRegisterPencilSvg className="w-4 h-4" />
                <span>تسليم الواجب من لوحة الطالب</span>
              </Link>
            </div>
          </div>

          {/* Interactive In-Browser Worksheet Studio */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-pink-50/40 border-2 border-purple-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-700" />
                <h3 className="text-sm font-black text-slate-900">
                  تدريبات الملزمة التفاعلية السريعة (Vocabulary & Sentences Drill)
                </h3>
              </div>
              <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                تطبيق مباشر ⚡
              </span>
            </div>

            {/* Word cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INTERACTIVE_DRILL_WORDS.map((item) => (
                <div
                  key={item.word}
                  className="p-3.5 rounded-xl bg-white border border-purple-100 hover:border-purple-300 shadow-2xs space-y-1.5 transition-all text-right"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-900">{item.word}</span>
                    <button
                      type="button"
                      onClick={() => speakText(item.word)}
                      className="p-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                      title="استمع للنطق"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    النطق: <span className="font-bold text-purple-800">{item.phonics}</span>
                  </div>
                  <div className="text-xs text-slate-800 font-bold">{item.translation}</div>
                  <div className="text-[10px] text-slate-500 font-medium border-t border-purple-50 pt-1">
                    {item.example}
                  </div>
                </div>
              ))}
            </div>

            {/* In-Browser Practice Question */}
            <div className="p-4 rounded-xl bg-white border border-purple-200 space-y-2.5 text-right">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  سؤال الواجب السريع: What is the opposite of &quot;Big&quot;?
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <XpGemSvg className="w-3 h-3" />
                  +15 XP
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { text: "Fast", correct: false },
                  { text: "Small", correct: true },
                  { text: "Hot", correct: false },
                ].map((opt) => {
                  const isSelected = selectedQuizOption === opt.text;
                  return (
                    <button
                      key={opt.text}
                      type="button"
                      onClick={() => handleSelectQuizOption(opt.text)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? opt.correct
                            ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                            : "bg-rose-500 text-white border-rose-600 shadow-xs"
                          : "bg-purple-50/50 hover:bg-purple-100 text-purple-900 border-purple-200"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs font-medium leading-relaxed">
            <span className="font-black text-amber-900 block mb-1">💡 نصيحة المعلم للحل النموذجي:</span>
            بعد الانتهاء من سماع الشرح، اكتب الإجابات بالقلم الرصاص بوضوح والتقط صورة واضحة بإضاءة جيدة لكراستك ليقوم المعلم بتصحيحها بالقلم الأحمر وإرسال التقرير لولي الأمر.
          </div>
        </div>
      )}

      {/* Tab 2: Phonics Sound Board with AI Speech Practice */}
      {activeTab === "phonics" && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="space-y-1 text-right">
            <h3 className="text-base font-black text-slate-900">
              مختبر نطق الصوتيات التفاعلي (Interactive Phonics Lab)
            </h3>
            <p className="text-xs text-slate-500">
              استمع إلى أصوات الحروف الإنجليزية والكلمات النموذجية، واضغط على زر المايكروفون لترديد الكلمة والحصول على نجوم الذكاء الاصطناعي 🌟
            </p>
          </div>
          <PhonicsSoundBoard />
        </div>
      )}

      {/* Tab 3: Study Notes & Guidelines */}
      {activeTab === "notes" && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-right">
              <span className="font-black text-emerald-900 flex items-center gap-2">
                <PhonicsSpeechSvg className="w-5 h-5 shrink-0" />
                1. كرر النطق الصوتي
              </span>
              <p className="text-emerald-700/90 font-medium leading-relaxed">
                ردد الكلمات بصوت واضح مع المعلم أثناء الشرح لتثبيت مخارج الحروف.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-right">
              <span className="font-black text-amber-900 flex items-center gap-2">
                <ChampionCupSvg className="w-5 h-5 shrink-0" />
                2. حل الاختبار التفاعلي
              </span>
              <p className="text-amber-700/90 font-medium leading-relaxed">
                بعد الانتهاء من الفيديو ادخل الاختبار فوراً لتسجيل درجاتك وإشعار ولي الأمر.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5 text-right">
              <span className="font-black text-purple-900 flex items-center gap-2">
                <DrmVideoShieldSvg className="w-5 h-5 shrink-0" />
                3. نظام المتابعة المحمي
              </span>
              <p className="text-purple-700/90 font-medium leading-relaxed">
                المشاهدات مسجلة ومحمية باسمك لضمان تقدمك واستمرارية اشتراكك بنجاح.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
