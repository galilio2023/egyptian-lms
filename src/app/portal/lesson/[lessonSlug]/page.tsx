"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight,
  Lock
} from "lucide-react";
import { ProtectedVideoPlayer } from "@/components/lms/protected-video-player";
import { INITIAL_LESSONS, INITIAL_QUIZ, INITIAL_UNITS, type MockLesson, type MockUnit } from "@/lib/db/mock-data";
import { useSession } from "@/lib/auth/auth-client";
import { 
  ChampionCupSvg, 
  WorksheetPdfSvg, 
  PhonicsSpeechSvg, 
  DrmVideoShieldSvg,
  CenterVoucherCardSvg
} from "@/components/ui/illustrated-icons";
import { PhonicsSoundBoard } from "@/components/lms/phonics-sound-board";
import { EgyptianCheckoutModal } from "@/components/checkout/egyptian-checkout-modal";

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { data: session } = useSession();
  const { lessonSlug } = use(params);
  const [lesson, setLesson] = useState<MockLesson>(() => {
    return INITIAL_LESSONS.find((l) => l.slug === lessonSlug) || INITIAL_LESSONS[0];
  });
  const [unit, setUnit] = useState<MockUnit>(() => {
    return INITIAL_UNITS.find((u) => u.id === lesson.unitId) || INITIAL_UNITS[0];
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(() => {
    return Boolean(lesson.isFreePreview);
  });

  useEffect(() => {
    let active = true;
    fetch(`/api/public/lesson/${lessonSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.lesson) {
          setLesson(data.lesson);
          if (data.unit) setUnit(data.unit);
          setIsEnrolled(Boolean(data.isEnrolled || data.lesson.isFreePreview));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lessonSlug]);

  useEffect(() => {
    if (lesson.isFreePreview) return;
    let active = true;
    fetch("/api/student/enrollments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.enrolledUnitIds) {
          const hasAccess = data.enrolledUnitIds.includes(unit.id) || data.enrolledUnitIds.includes(unit.slug);
          if (hasAccess) {
            setIsEnrolled(true);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lesson.isFreePreview, unit.id, unit.slug]);

  const handleEnrollSuccess = () => {
    fetch(`/api/public/lesson/${lessonSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.lesson) {
          setLesson(data.lesson);
          if (data.unit) setUnit(data.unit);
          setIsEnrolled(Boolean(data.isEnrolled || data.lesson.isFreePreview));
        }
      })
      .catch(() => {});
    setIsCheckoutOpen(false);
  };

  const studentName = session?.user?.name || "أحمد محمود الخولي";
  const studentPhone = ((session?.user as Record<string, unknown>)?.phoneNumber as string) || "01012345678";
  const isAccessible = isEnrolled || Boolean(lesson.isFreePreview);

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      
      {/* Top Header - Apple Style Pill */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="max-w-6xl mx-auto rounded-full bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-[0_8px_30px_rgba(139,92,246,0.1)] px-5 py-2.5 flex items-center justify-between">
          
          <Link 
            href={`/portal/learn/${unit.slug}`}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-purple-600" />
            <span>العودة للوحدة ({unit.title})</span>
          </Link>

          <Link
            href={`/portal/quiz/${INITIAL_QUIZ.id}`}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.03] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 transition-all"
          >
            <ChampionCupSvg className="w-4 h-4" />
            <span>اختبار الدرس</span>
          </Link>

        </div>
      </header>

      {/* Main Player Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Entitlement Guard: Locked Content Banner if not enrolled and not free preview */}
        {!isAccessible ? (
          <div className="rounded-3xl p-8 sm:p-12 bg-slate-900 border-2 border-purple-500/30 text-center text-white space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-black text-pink-400 uppercase tracking-wider block">
                محتوى تعليمي مدفوع ومحمي
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{lesson.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                هذه المحاضرة مخصصة للمشتركين في ({unit.title}). يمكنك تفعيل الاشتراك الفوري بكارت الشحن أو فودافون كاش وإنستاباي لمتابعة الشرح والملازم.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-vibrant hover:scale-[1.03] text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <CenterVoucherCardSvg className="w-5 h-5" />
                <span>تفعيل الكورس الآن ({unit.priceEgp} ج.م)</span>
              </button>
              <Link
                href={`/portal/learn/${unit.slug}`}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                العودة للدروس المجانية
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* DRM Video Player */}
            <div className="rounded-3xl p-3 bg-gradient-to-tr from-purple-950 via-slate-900 to-black shadow-2xl border-2 border-purple-500/30">
              <ProtectedVideoPlayer
                src={lesson.videoUrl}
                studentName={studentName}
                studentPhone={studentPhone}
                title={lesson.title}
              />
            </div>

            {/* Lesson Notes & PDF Worksheets Card */}
            <div className="modern-card bg-white/95 backdrop-blur-md p-6 sm:p-8 space-y-6 border-2 border-purple-100 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
                <div className="flex items-start gap-4">
                  <WorksheetPdfSvg className="w-12 h-12 shrink-0 drop-shadow-sm" />
                  <div>
                    <h2 className="text-xl font-black text-slate-900">الملزمة والواجب المنزلي الملون</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      قم بتحميل الملزمة والاطلاع على أسئلة الواجب بعد إنهاء مشاهدة المحاضرة مع مستر أحمد.
                    </p>
                  </div>
                </div>

                {lesson.pdfAttachmentUrl ? (
                  <a
                    href={lesson.pdfAttachmentUrl}
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
                  <p className="text-emerald-700/90 font-medium leading-relaxed">ردد الكلمات بصوت واضح مع مستر أحمد أثناء الشرح لتثبيت مخارج الحروف.</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <span className="font-black text-amber-900 flex items-center gap-2">
                    <ChampionCupSvg className="w-5 h-5 shrink-0" />
                    2. حل الاختبار التفاعلي
                  </span>
                  <p className="text-amber-700/90 font-medium leading-relaxed">بعد الانتهاء من الفيديو ادخل الاختبار فوراً لتسجيل درجاتك وإشعار ولي الأمر.</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
                  <span className="font-black text-purple-900 flex items-center gap-2">
                    <DrmVideoShieldSvg className="w-5 h-5 shrink-0" />
                    3. نظام المتابعة المحمي
                  </span>
                  <p className="text-purple-700/90 font-medium leading-relaxed">المشاهدات مسجلة ومحمية باسمك لضمان تقدمك واستمرارية اشتراكك بنجاح.</p>
                </div>
              </div>

              {/* Interactive Phonics Audio Playground */}
              <div className="pt-4">
                <PhonicsSoundBoard />
              </div>
            </div>
          </>
        )}

        {/* Checkout Modal */}
        <EgyptianCheckoutModal
          unit={unit}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleEnrollSuccess}
        />

      </main>
    </div>
  );
}
