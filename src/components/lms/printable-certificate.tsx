"use client";

import { useRef } from "react";
import { Printer, Sparkles, X } from "lucide-react";
import { 
  EliteLogoBadge, 
  ChampionCupSvg, 
  AdminShieldCrownSvg, 
  WhatsAppBubbleSvg
} from "@/components/ui/illustrated-icons";

interface PrintableCertificateProps {
  studentName: string;
  courseTitle: string;
  quizTitle: string;
  scorePercentage: number;
  gradeLevel?: string;
  issuedDate?: string;
  onClose?: () => void;
}

export function PrintableCertificate({
  studentName,
  courseTitle,
  quizTitle,
  scorePercentage,
  gradeLevel = "الصف الأول الابتدائي (Grade 1)",
  issuedDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }),
  onClose,
}: PrintableCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `🌟 شهادة تفوق واجتياز بطل أكاديمية إيليت 🌟\nالطالب البطل: ${studentName}\nالمرحلة: ${gradeLevel}\nالاختبار: ${quizTitle}\nالنسبة المئوية: ${scorePercentage}% مع مرتبة الشرف 🏆\nإشراف: مستر أحمد عبد الرحمن`
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      
      {/* Container Dialog */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border-2 border-amber-300 print:border-0 print:shadow-none print:max-w-none print:w-full">
        
        {/* Action Header - Hidden during print */}
        <div className="print:hidden bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 text-white p-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ChampionCupSvg className="w-6 h-6 text-amber-300 drop-shadow" />
            <div>
              <h2 className="text-sm sm:text-base font-black">شهادة تفوق بطل أكاديمية إيليت 🎓</h2>
              <span className="text-[11px] text-purple-200 block">جاهزة للطباعة بجودة عالية A4 أو المشاركة مع العائلة</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الشهادة (A4)</span>
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <WhatsAppBubbleSvg className="w-4 h-4" />
              <span className="hidden sm:inline">إرسال لولي الأمر</span>
            </a>

            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Certificate Canvas (Styled for A4 Landscape) */}
        <div 
          ref={certificateRef}
          className="p-6 sm:p-10 bg-gradient-to-br from-amber-50/40 via-white to-purple-50/30 text-center relative select-none print:p-8"
        >
          {/* Ornate Double Frame with Golden Corners */}
          <div className="border-[6px] border-amber-400 rounded-3xl p-6 sm:p-8 relative bg-white/90 backdrop-blur-sm shadow-inner">
            <div className="border-2 border-dashed border-purple-300 rounded-2xl p-6 relative">
              
              {/* Corner Stars */}
              <div className="absolute -top-3.5 -start-3.5 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md">★</div>
              <div className="absolute -top-3.5 -end-3.5 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md">★</div>
              <div className="absolute -bottom-3.5 -start-3.5 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md">★</div>
              <div className="absolute -bottom-3.5 -end-3.5 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md">★</div>

              {/* Certificate Top Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-amber-200">
                <div className="flex items-center gap-2.5 text-right">
                  <EliteLogoBadge className="w-12 h-12" />
                  <div>
                    <span className="text-base font-black text-slate-900 block leading-tight">أكاديمية إيليت للغة الإنجليزية</span>
                    <span className="text-[10px] text-purple-700 font-bold">Elite English Academy • Egypt</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>شهادة تفوق واعتماد رسمي</span>
                </div>
              </div>

              {/* Title */}
              <div className="py-6 space-y-2">
                <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
                  شَهَادَةُ تَمَيُّزٍ وَتَفَوُّق 🏆
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-bold">
                  Certificate of Excellence & Achievement in English Language
                </p>
              </div>

              {/* Student Name Presentation */}
              <div className="space-y-3 py-2">
                <p className="text-xs text-slate-500 font-bold">تشهد إدارة الأكاديمية بأن البطل المتميز:</p>
                <div className="inline-block px-8 py-2 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 shadow-sm">
                  <span className="text-2xl sm:text-3xl font-black text-purple-900">
                    {studentName}
                  </span>
                </div>
                <p className="text-xs text-purple-800 font-black">{gradeLevel}</p>
              </div>

              {/* Achievement Paragraph */}
              <div className="max-w-xl mx-auto py-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                قد اجتاز بنجاح فائق واقتدار جميع متطلبات واختبارات:
                <strong className="text-purple-950 font-black block text-sm sm:text-base mt-1">
                  {quizTitle} — {courseTitle}
                </strong>
                بنسبة نجاح نهائية بلغت <strong className="text-emerald-700 font-black text-base">{scorePercentage}%</strong> مع مرتبة الشرف الأولى للأبطال الصغار.
              </div>

              {/* Signatures & Seal Footer */}
              <div className="pt-6 mt-4 border-t-2 border-amber-200 flex items-center justify-between text-right">
                
                {/* Issue Date */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">تاريخ المنح والاعتماد:</span>
                  <span className="text-xs font-black text-slate-800">{issuedDate}</span>
                </div>

                {/* Golden Official Stamp */}
                <div className="w-20 h-20 rounded-full border-4 border-double border-amber-500 bg-amber-50 flex flex-col items-center justify-center text-center p-1 shadow-md rotate-[-6deg]">
                  <AdminShieldCrownSvg className="w-6 h-6 text-amber-600" />
                  <span className="text-[8px] font-black text-amber-900 leading-tight">معتمد رسمياً</span>
                  <span className="text-[7px] text-amber-700 font-bold">ELITE VERIFIED</span>
                </div>

                {/* Lecturer Signature */}
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold block">المشرف العام والمحاضر:</span>
                  <span className="text-sm font-black text-purple-900 block">مستر أحمد عبد الرحمن</span>
                  <span className="text-[9px] text-purple-600 font-semibold block">خبير مناهج اللغة الإنجليزية</span>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
