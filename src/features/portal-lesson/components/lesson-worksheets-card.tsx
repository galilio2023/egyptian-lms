"use client";

import { 
  WorksheetPdfSvg, 
  PhonicsSpeechSvg, 
  ChampionCupSvg, 
  DrmVideoShieldSvg 
} from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";
import { PhonicsSoundBoard } from "@/features/phonics";

interface LessonWorksheetsCardProps {
  pdfAttachmentUrl?: string;
}

export function LessonWorksheetsCard({ pdfAttachmentUrl }: LessonWorksheetsCardProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-md p-6 sm:p-8 space-y-6 border-2 border-purple-100 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
        <div className="flex items-start gap-4">
          <WorksheetPdfSvg className="w-12 h-12 shrink-0 drop-shadow-sm" />
          <div>
            <h2 className="text-xl font-black text-slate-900">الملزمة والواجب المنزلي الملون</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              قم بتحميل الملزمة والاطلاع على أسئلة الواجب بعد إنهاء مشاهدة المحاضرة.
            </p>
          </div>
        </div>

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
      </div>

      {/* Tips for Student */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
          <span className="font-black text-emerald-900 flex items-center gap-2">
            <PhonicsSpeechSvg className="w-5 h-5 shrink-0" />
            1. كرر النطق الصوتي
          </span>
          <p className="text-emerald-700/90 font-medium leading-relaxed">
            ردد الكلمات بصوت واضح مع المعلم أثناء الشرح لتثبيت مخارج الحروف.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
          <span className="font-black text-amber-900 flex items-center gap-2">
            <ChampionCupSvg className="w-5 h-5 shrink-0" />
            2. حل الاختبار التفاعلي
          </span>
          <p className="text-amber-700/90 font-medium leading-relaxed">
            بعد الانتهاء من الفيديو ادخل الاختبار فوراً لتسجيل درجاتك وإشعار ولي الأمر.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
          <span className="font-black text-purple-900 flex items-center gap-2">
            <DrmVideoShieldSvg className="w-5 h-5 shrink-0" />
            3. نظام المتابعة المحمي
          </span>
          <p className="text-purple-700/90 font-medium leading-relaxed">
            المشاهدات مسجلة ومحمية باسمك لضمان تقدمك واستمرارية اشتراكك بنجاح.
          </p>
        </div>
      </div>

      {/* Interactive Phonics Audio Playground */}
      <div className="pt-4">
        <PhonicsSoundBoard />
      </div>
    </Card>
  );
}
