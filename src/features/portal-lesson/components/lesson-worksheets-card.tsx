"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  WorksheetPdfSvg, 
  PhonicsSpeechSvg, 
  ChampionCupSvg, 
  DrmVideoShieldSvg,
  StudentRegisterPencilSvg
} from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";
import { PhonicsSoundBoard } from "@/features/phonics";

interface LessonWorksheetsCardProps {
  pdfAttachmentUrl?: string;
}

export function LessonWorksheetsCard({ pdfAttachmentUrl }: LessonWorksheetsCardProps) {
  const [activeTab, setActiveTab] = useState<"worksheet" | "phonics" | "notes">("worksheet");

  return (
    <Card className="bg-white/95 backdrop-blur-md p-6 sm:p-8 space-y-6 border-2 border-purple-100 shadow-xl">
      {/* Tab Navigation Controls */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-purple-50/80 border border-purple-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("worksheet")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "notes"
              ? "bg-white text-purple-900 shadow-sm border border-purple-200"
              : "text-slate-600 hover:text-purple-900 hover:bg-white/50"
          }`}
        >
          <ChampionCupSvg className="w-4 h-4" />
          <span>إرشادات وتوجيهات المحاضرة</span>
        </button>
      </div>

      {/* Tab 1: Worksheet & PDF Download */}
      {activeTab === "worksheet" && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
            <div className="flex items-start gap-4">
              <WorksheetPdfSvg className="w-12 h-12 shrink-0 drop-shadow-sm" />
              <div>
                <h2 className="text-xl font-black text-slate-900">الملزمة والواجب المنزلي الملون</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  قم بتحميل ملزمة الدرس، حل التمارين بخط جميل في كراستك، ثم ارفع الواجب للمعلم المشرف.
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
                <span className="text-xs text-slate-400 font-medium">لا توجد ملزمة مرفقة</span>
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
