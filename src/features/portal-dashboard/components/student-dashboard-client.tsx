"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Radio, Volume2 } from "lucide-react";
import { PhonicsSoundBoard } from "@/features/phonics";
import { PrintableCertificate } from "@/features/certificates";
import { PwaInstallBanner } from "@/components/ui/pwa-install-banner";
import { LiveSessionWidget } from "@/features/live-sessions";
import { HomeworkSubmissionModal } from "@/features/homework";
import { EgyptianCheckoutModal } from "@/features/checkout";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { StudentProgressTimeline } from "./student-progress-timeline";
import {
  MascotLionSvg,
  MascotFalconSvg,
  MascotRocketSvg,
  MascotStarSvg,
} from "@/components/ui/illustrated-icons";
import {
  type MascotItem,
  type StudentDashboardProfile,
  StudentNavHeader,
  StudentHeroCard,
  StudentHomeworkCard,
  MascotSelectorBar,
  QuickActionPills,
  WeeklyMissionsCard,
  CenterVoucherCard,
  NextLessonBanner,
  CoursesGridSection,
  SmartSrsVocabCard,
  StudentIDCardModal,
} from "@/features/portal-dashboard";
import {
  INITIAL_LESSONS,
  INITIAL_UNITS,
  type MockHomeworkAssignment,
  type MockHomeworkSubmission,
  type MockUnit,
  type MockPlatformSettings,
} from "@/lib/db/mock-data";
import type { StudentDashboardServerData } from "@/lib/data-dashboard";

const MASCOTS: MascotItem[] = [
  { id: "lion", name: "أسد الشجاعة", SvgComponent: MascotLionSvg, title: "مستكشف مبتدئ" },
  { id: "falcon", name: "صقر التميز", SvgComponent: MascotFalconSvg, title: "بطل الصوتيات" },
  { id: "rocket", name: "رائد الفضاء", SvgComponent: MascotRocketSvg, title: "فارس الكلمات" },
  { id: "star", name: "نجم الإيليت", SvgComponent: MascotStarSvg, title: "عبقري الجرامر" },
];

interface StudentDashboardClientProps {
  initialUnits: MockUnit[];
  initialSettings: MockPlatformSettings;
  initialDashboardData: StudentDashboardServerData;
  studentId: string;
  studentName: string;
  studentPhone: string;
}

export function StudentDashboardClient({
  initialUnits,
  initialSettings,
  initialDashboardData,
  studentId,
  studentName,
  studentPhone,
}: StudentDashboardClientProps) {
  const router = useRouter();

  const [selectedMascot, setSelectedMascot] = useState<MascotItem>(MASCOTS[0]);
  const [showSoundboardModal, setShowSoundboardModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);

  const [currentAssignment, setCurrentAssignment] = useState<MockHomeworkAssignment | null>(
    initialDashboardData.currentAssignment
  );
  const [studentSubmission, setStudentSubmission] = useState<MockHomeworkSubmission | undefined>(
    initialDashboardData.studentSubmission
  );
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [isRedeemingVoucher, setIsRedeemingVoucher] = useState(false);
  const [redeemedUnitTitle, setRedeemedUnitTitle] = useState<string | null>(null);
  const [enrolledUnitIds, setEnrolledUnitIds] = useState<string[]>(
    initialDashboardData.enrolledUnitIds
  );
  const [units] = useState<MockUnit[]>(initialUnits);
  const [checkoutUnit, setCheckoutUnit] = useState<MockUnit | null>(null);
  const [viewAllGrades, setViewAllGrades] = useState(false);
  const [settings] = useState<MockPlatformSettings>(initialSettings);
  const [nextLesson] = useState(initialDashboardData.nextLesson);

  const [studentProfile, setStudentProfile] = useState({
    gradeLevel: initialDashboardData.profile?.gradeLevel ?? 1,
    gradeTitle: initialDashboardData.profile?.gradeTitle ?? "Grade 1 (الصف الأول الابتدائي)",
    gradeSlug: initialDashboardData.profile?.gradeSlug ?? "grade-1",
    xpPoints: initialDashboardData.profile?.xpPoints ?? 450,
    completedLessons: initialDashboardData.profile?.completedLessons ?? 0,
    parentPhoneNumber: initialDashboardData.profile?.parentPhoneNumber ?? "",
  });

  const refetchEnrollments = useCallback(async () => {
    try {
      const r = await fetch("/api/student/enrollments");
      if (r.status === 403) {
        const errData = await r.json().catch(() => ({}));
        if (errData.isDeviceLocked || errData.isBanned) {
          toast.error(errData.error || "تم قفل الجلسة على هذا الجهاز.");
          // Use router.push per AGENTS.md Rule #2 — no window.location.href
          router.push("/student-login?reason=device_locked");
          return;
        }
      }
      const d = r.ok ? await r.json() : null;
      if (d?.enrolledUnitIds) setEnrolledUnitIds(d.enrolledUnitIds);
    } catch {
      // Silent fail — user sees stale data but app doesn't crash
    }
  }, [router]);

  const fetchHomework = useCallback(async () => {
    try {
      const res = await fetch("/api/student/homework");
      const data = res.ok ? await res.json() : null;
      if (data?.assignments && data.assignments.length > 0) {
        const first = data.assignments[0];
        setCurrentAssignment({
          id: first.id,
          unitId: first.unitId,
          unitTitle: first.unitTitle || "الوحدة الدراسية",
          gradeSlug: first.gradeSlug || "grade-1",
          lessonTitle: first.lessonTitle || undefined,
          title: first.title,
          instructions: first.instructions,
          pageNumber: first.pageNumber,
          maxScore: first.maxScore,
          dueDate: first.dueDate,
        });
        if (first.submission) {
          setStudentSubmission({
            id: first.submission.id,
            assignmentId: first.id,
            assignmentTitle: first.title,
            studentId,
            studentName,
            studentPhone,
            parentPhone: "01000000000",
            gradeTitle: first.gradeSlug || "Grade 1",
            status: first.submission.status,
            score: first.submission.score ?? undefined,
            maxScore: first.maxScore || 10,
            feedbackNotes: first.submission.feedbackNotes ?? undefined,
            studentImages: first.submission.studentImages || [],
            audioVoiceNoteUrl: first.submission.audioVoiceNoteUrl || undefined,
            annotatedImages: first.submission.annotatedImages || undefined,
            submittedAt: first.submission.submittedAt
              ? new Date(first.submission.submittedAt).toLocaleDateString("ar-EG")
              : "اليوم",
          });
        } else {
          setStudentSubmission(undefined);
        }
      } else if (data?.assignments?.length === 0) {
        setCurrentAssignment(null);
        setStudentSubmission(undefined);
      }
    } catch {
      // Keep existing data
    }
  }, [studentId, studentName, studentPhone]);

  // Only fetch missing client data if not pre-populated server-side
  useEffect(() => {
    let active = true;

    if (!initialDashboardData.profile) {
      fetch("/api/student/enrollments")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (active && d?.enrolledUnitIds) {
            setEnrolledUnitIds(d.enrolledUnitIds);
          }
        })
        .catch(() => {});
    }

    if (!initialDashboardData.currentAssignment) {
      fetch("/api/student/homework")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active) return;
          if (data?.assignments && data.assignments.length > 0) {
            const first = data.assignments[0];
            setCurrentAssignment({
              id: first.id,
              unitId: first.unitId,
              unitTitle: first.unitTitle || "الوحدة الدراسية",
              gradeSlug: first.gradeSlug || "grade-1",
              lessonTitle: first.lessonTitle || undefined,
              title: first.title,
              instructions: first.instructions,
              pageNumber: first.pageNumber,
              maxScore: first.maxScore,
              dueDate: first.dueDate,
            });
            if (first.submission) {
              setStudentSubmission({
                id: first.submission.id,
                assignmentId: first.id,
                assignmentTitle: first.title,
                studentId,
                studentName,
                studentPhone,
                parentPhone: "01000000000",
                gradeTitle: first.gradeSlug || "Grade 1",
                status: first.submission.status,
                score: first.submission.score ?? undefined,
                maxScore: first.maxScore || 10,
                feedbackNotes: first.submission.feedbackNotes ?? undefined,
                studentImages: first.submission.studentImages || [],
                audioVoiceNoteUrl: first.submission.audioVoiceNoteUrl || undefined,
                annotatedImages: first.submission.annotatedImages || undefined,
                submittedAt: first.submission.submittedAt
                  ? new Date(first.submission.submittedAt).toLocaleDateString("ar-EG")
                  : "اليوم",
              });
            } else {
              setStudentSubmission(undefined);
            }
          } else if (data?.assignments?.length === 0) {
            setCurrentAssignment(null);
            setStudentSubmission(undefined);
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [initialDashboardData.profile, initialDashboardData.currentAssignment, studentId, studentName, studentPhone]);

  const currentStudent: StudentDashboardProfile = {
    name: studentName,
    phone: studentPhone,
    gradeTitle: studentProfile.gradeTitle,
    gradeLevel: studentProfile.gradeLevel,
    gradeSlug: studentProfile.gradeSlug,
    xpPoints: studentProfile.xpPoints,
    nextLevelXp: Math.max(600, Math.ceil((studentProfile.xpPoints + 150) / 200) * 200),
    levelNumber: Math.max(1, Math.floor(studentProfile.xpPoints / 150) + 1),
    streakDays: initialDashboardData.streakDays ?? 4,
    completedLessons: studentProfile.completedLessons,
    activeQuizzes: initialDashboardData.activeQuizzesCount ?? 2,
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) {
      toast.error("يرجى إدخال كود كارت الشحن المكون من أرقام وحروف.");
      return;
    }
    setIsRedeemingVoucher(true);
    try {
      const res = await fetch("/api/voucher/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "كود كارت الشحن غير صحيح أو تم استخدامه من قبل.");
        return;
      }
      setRedeemedUnitTitle(data.unitTitle || "الوحدة الدراسية الجديدة");
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      toast.success("مبروك يا بطل! تم شحن الكارت وتفعيل الوحدة بنجاح في حسابك 🎉");
      setVoucherCodeInput("");
      await refetchEnrollments();
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setIsRedeemingVoucher(false);
    }
  };

  const handleSendToMom = () => {
    const rawParentPhone = studentProfile.parentPhoneNumber?.trim();
    const formattedParentPhone = rawParentPhone
      ? rawParentPhone.startsWith("2")
        ? rawParentPhone
        : `20${rawParentPhone.replace(/^0+/, "")}`
      : "";
    const msg = encodeURIComponent(
      `السلام عليكم يا ماما! ❤️\nأنا بطل المنصة التعليمية: ${currentStudent.name}\nجمعت النهاردة ${currentStudent.xpPoints} نقطة XP وعندي حماس ${currentStudent.streakDays} أيام متتالية! 🏆🔥\nالمعلم المشرف بيشجعني وبيقولي شاطر جداً وبطل المنصة! 🥳🎉`
    );
    const targetUrl = formattedParentPhone
      ? `https://wa.me/${formattedParentPhone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(targetUrl, "_blank");
  };

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      <StudentNavHeader student={currentStudent} activeMascot={selectedMascot} />
      <PwaInstallBanner />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-5 sm:space-y-8">
        <div className="flex items-center gap-2 pt-1 sm:pt-4">
          <span className="text-sm font-black text-slate-900">🎯 محطتك التالية يا بطل</span>
          <div className="flex-1 h-px bg-purple-200" />
        </div>
        <section>
          <NextLessonBanner
            lessonTitle={nextLesson?.title ?? INITIAL_LESSONS[0].title}
            unitTitle={nextLesson?.unitTitle ?? INITIAL_UNITS[0].title}
            durationMinutes={
              nextLesson?.durationMinutes ??
              Number.parseInt(INITIAL_LESSONS[0].videoDuration, 10)
            }
            lessonSlug={nextLesson?.slug ?? INITIAL_LESSONS[0].slug}
            isCompleted={!nextLesson && enrolledUnitIds.length > 0}
          />
        </section>

        <StudentHeroCard
          student={currentStudent}
          activeMascot={selectedMascot}
          showToys={settings.enableHeroToys !== false}
          onOpenIdCard={() => setShowIdCardModal(true)}
        />

        <SmartSrsVocabCard
          userId={studentId}
          onEarnXp={(earnedXp) => {
            setStudentProfile((prev) => ({ ...prev, xpPoints: prev.xpPoints + earnedXp }));
            fetch("/api/student/xp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ xpAmount: earnedXp, reason: "srs_daily_challenge" }),
            }).catch((err) => console.warn("Failed to persist SRS XP:", err));
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-7">
            {initialDashboardData.liveSession ? (
              <LiveSessionWidget
                session={initialDashboardData.liveSession}
                studentName={currentStudent.name}
              />
            ) : (
              <EmptyState
                icon={<Radio className="w-7 h-7" />}
                title="لا توجد حصة بث مباشر قادمة"
                description="ستظهر هنا حصة المراجعة القادمة فور تحديد موعدها لصفك."
                className="min-h-[280px] h-full bg-white/80"
              />
            )}
          </div>
          <div className="lg:col-span-5">
            {currentAssignment ? (
              <StudentHomeworkCard
                assignment={currentAssignment}
                submission={studentSubmission}
                onOpenSubmissionModal={() => setShowHomeworkModal(true)}
              />
            ) : (
              <div className="modern-card p-6 bg-linear-to-br from-white via-purple-50/40 to-pink-50/30 border-2 border-purple-200 rounded-3xl shadow-xs text-center flex flex-col items-center justify-center min-h-[220px] h-full space-y-2">
                <span className="text-3xl">🎉</span>
                <h4 className="text-sm font-black text-slate-800">لا توجد واجبات معلقة حالياً</h4>
                <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                  أنت متميز جداً! تم الانتهاء من جميع المهام والواجبات المطلوبة في وحداتك المشترك بها.
                </p>
              </div>
            )}
          </div>
        </div>

        <div id="courses" className="flex items-center gap-2 pt-1 sm:pt-4">
          <span className="text-sm font-black text-slate-900">📚 وحداتك الدراسية</span>
          <div className="flex-1 h-px bg-purple-200" />
        </div>
        <CoursesGridSection
          units={units}
          enrolledUnitIds={enrolledUnitIds}
          student={currentStudent}
          viewAllGrades={viewAllGrades}
          onToggleViewAllGrades={() => setViewAllGrades(!viewAllGrades)}
          onSelectLockedUnit={setCheckoutUnit}
        />

        <div className="flex items-center gap-2 pt-1 sm:pt-4">
          <span className="text-sm font-black text-slate-900">⚡ أدوات البطل السريعة</span>
          <div className="flex-1 h-px bg-purple-200" />
        </div>
        <QuickActionPills
          onOpenSoundboard={() => setShowSoundboardModal(true)}
          onOpenCertificate={() => setShowCertificateModal(true)}
          onSendToMom={handleSendToMom}
        />

        <CenterVoucherCard
          voucherCodeInput={voucherCodeInput}
          onVoucherCodeChange={setVoucherCodeInput}
          onSubmit={handleRedeemVoucher}
          isRedeeming={isRedeemingVoucher}
          redeemedUnitTitle={redeemedUnitTitle}
        />

        <WeeklyMissionsCard studentName={currentStudent.name} />

        {/* Learning Journey Timeline */}
        <div className="flex items-center gap-2 pt-1 sm:pt-4">
          <span className="text-sm font-black text-slate-900">⏳ رحلتك التعليمية</span>
          <div className="flex-1 h-px bg-purple-200" />
        </div>
        <StudentProgressTimeline />

        <MascotSelectorBar
          mascots={MASCOTS}
          selectedMascot={selectedMascot}
          onSelectMascot={setSelectedMascot}
        />
      </main>

      <Modal
        isOpen={showSoundboardModal}
        onClose={() => setShowSoundboardModal(false)}
        title="لوحة الصوتيات ونطق الحروف الإنجليزية 🔊"
        icon={<Volume2 className="w-6 h-6 text-purple-600" />}
        maxWidth="4xl"
      >
        <PhonicsSoundBoard />
      </Modal>

      {showCertificateModal && (
        <PrintableCertificate
          studentName={currentStudent.name}
          courseTitle={units[0]?.title || "English Primary 1 (منهج اللغة الإنجليزية)"}
          quizTitle="اختبار التميز الشامل وبطل المنهج"
          scorePercentage={100}
          academyName={settings.academyNameArabic}
          instructorName={settings.teacherNameArabic}
          instructorTitle={settings.teacherTitle}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {showHomeworkModal && currentAssignment && (
        <HomeworkSubmissionModal
          assignment={currentAssignment}
          existingSubmission={studentSubmission}
          isOpen={showHomeworkModal}
          onClose={() => setShowHomeworkModal(false)}
          onSubmitSuccess={(newSub) => {
            setStudentSubmission(newSub);
            void fetchHomework();
          }}
        />
      )}

      {checkoutUnit && (
        <EgyptianCheckoutModal
          isOpen={Boolean(checkoutUnit)}
          unit={checkoutUnit}
          onClose={() => setCheckoutUnit(null)}
          onSuccess={async () => {
            setCheckoutUnit(null);
            await refetchEnrollments();
          }}
        />
      )}

      <StudentIDCardModal
        isOpen={showIdCardModal}
        onClose={() => setShowIdCardModal(false)}
        studentId={studentId}
        studentName={currentStudent.name}
        studentPhone={currentStudent.phone}
        gradeTitle={currentStudent.gradeTitle}
        academyName={settings.academyNameArabic}
        xpPoints={currentStudent.xpPoints}
      />
    </div>
  );
}
