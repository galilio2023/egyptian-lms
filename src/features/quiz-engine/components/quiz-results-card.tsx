"use client";

import { useState } from "react";
import { 
  XCircle, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  Volume2 
} from "lucide-react";
import { 
  ChampionCupSvg, 
  XpGemSvg, 
  WhatsAppBubbleSvg 
} from "@/components/ui/illustrated-icons";
import { PrintableCertificate } from "@/features/certificates";
import type { MockQuiz } from "@/lib/db/mock-data";
import type { ServerGradeResult } from "../types";

interface QuizResultsCardProps {
  quiz: MockQuiz;
  studentName: string;
  gradeResult: ServerGradeResult;
  onRetake: () => void;
  onSpeakText: (text: string) => void;
}

export function QuizResultsCard({
  quiz,
  studentName,
  gradeResult,
  onRetake,
  onSpeakText,
}: QuizResultsCardProps) {
  const [showCertificate, setShowCertificate] = useState(false);

  return (
    <div className="modern-card bg-white/95 backdrop-blur-md p-8 max-w-2xl mx-auto space-y-6 text-center shadow-xl border-2 border-purple-200 animate-in fade-in-50 duration-500">
      {/* Result Trophy / Fail Icon */}
      <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center bg-purple-50 border border-purple-200 shadow-md">
        {gradeResult.passed ? (
          <ChampionCupSvg className="w-16 h-16 animate-bounce" />
        ) : (
          <XCircle className="w-14 h-14 text-rose-500" />
        )}
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {gradeResult.passed
            ? "ألف مبروك يا بطل! اجتزت الاختبار بنجاح 🎉"
            : "حاول مرة أخرى! يمكنك مراجعة الدرس وإعادة الاختبار 💪"}
        </h2>
        <p className="text-xs sm:text-sm text-purple-700 font-bold mt-1">
          {quiz.title} • {studentName}
        </p>
      </div>

      {/* Score Pill Card */}
      <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl p-4 border border-purple-200">
        <div>
          <div className="text-xs font-bold text-slate-500">الدرجة المكتسبة</div>
          <div className="text-2xl font-black text-slate-900">
            {gradeResult.score} / {gradeResult.total}
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-500">النسبة المئوية</div>
          <div
            className={`text-2xl font-black ${
              gradeResult.passed ? "text-emerald-600" : "text-amber-600"
            }`}
          >
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
            <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
              سبق احتساب النقاط
            </span>
          )}
        </div>
      </div>

      {/* Attempts Usage Notice */}
      {typeof gradeResult.remainingAttempts === "number" && (
        <div className="text-xs font-bold text-slate-600 bg-slate-100/80 border border-slate-200 py-1.5 px-4 rounded-xl inline-block">
          المحاولات المتبقية:{" "}
          <span className="text-indigo-600 font-black">{gradeResult.remainingAttempts}</span> من
          أصل {gradeResult.maxAttempts || 3}
        </div>
      )}

      {/* Certificate Button if passed */}
      {gradeResult.passed && (
        <button
          type="button"
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
                  رقم ولي الأمر:{" "}
                  <bdi dir="ltr">{gradeResult.parentNotification.parentPhone}</bdi>
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

      {/* Question Review Breakdown */}
      <div className="text-right space-y-3 pt-2">
        <h4 className="font-bold text-sm text-slate-900">مراجعة الإجابات النموذجية والشرح:</h4>
        <div className="space-y-2">
          {quiz.questions.map((q, idx) => {
            const res = gradeResult.results[q.id];
            const isCorrect = res?.correct;
            return (
              <div
                key={q.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSpeakText(q.text)}
                      className="p-1 rounded-md bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                      title="استمع لنطق السؤال"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-slate-800">
                      {idx + 1}. <bdi dir="ltr">{q.text}</bdi>
                    </span>
                  </div>
                  <span className={isCorrect ? "text-emerald-600" : "text-rose-600"}>
                    {isCorrect ? "إجابة صحيحة ✓" : "إجابة خاطئة ✗"}
                  </span>
                </div>
                {res?.explanation && (
                  <p className="text-[11px] text-slate-500 pt-1">
                    💡 التوضيح: {res.explanation}
                  </p>
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
            type="button"
            onClick={onRetake}
            className="px-6 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-2 transition-all border border-purple-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              إعادة الاختبار{" "}
              {typeof gradeResult.remainingAttempts === "number"
                ? `(${gradeResult.remainingAttempts} محاولات متبقية)`
                : ""}
            </span>
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
