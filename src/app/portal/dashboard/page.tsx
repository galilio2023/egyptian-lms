"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Volume2 } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { 
  INITIAL_UNITS, 
  INITIAL_LESSONS,
  INITIAL_HOMEWORK_ASSIGNMENTS, 
  INITIAL_HOMEWORK_SUBMISSIONS, 
  INITIAL_LIVE_SESSIONS, 
  MockHomeworkAssignment, 
  MockHomeworkSubmission,
  MockUnit
} from "@/lib/db/mock-data";
import { PhonicsSoundBoard } from "@/features/phonics";
import { PrintableCertificate } from "@/features/certificates";
import { PwaInstallBanner } from "@/components/ui/pwa-install-banner";
import { LiveSessionWidget } from "@/features/live-sessions";
import { HomeworkSubmissionModal } from "@/features/homework";
import { EgyptianCheckoutModal } from "@/features/checkout";
import { Modal } from "@/components/ui/modal";
import { 
  MascotLionSvg,
  MascotFalconSvg,
  MascotRocketSvg,
  MascotStarSvg
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
  CoursesGridSection
} from "@/features/portal-dashboard";

const MASCOTS: MascotItem[] = [
  { id: "lion", name: "أسد الشجاعة", SvgComponent: MascotLionSvg, title: "مستكشف مبتدئ" },
  { id: "falcon", name: "صقر التميز", SvgComponent: MascotFalconSvg, title: "بطل الصوتيات" },
  { id: "rocket", name: "رائد الفضاء", SvgComponent: MascotRocketSvg, title: "فارس الكلمات" },
  { id: "star", name: "نجم الإيليت", SvgComponent: MascotStarSvg, title: "عبقري الجرامر" },
];

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [selectedMascot, setSelectedMascot] = useState<MascotItem>(MASCOTS[0]);
  const [showSoundboardModal, setShowSoundboardModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [currentAssignment] = useState<MockHomeworkAssignment>(INITIAL_HOMEWORK_ASSIGNMENTS[0]);
  const [studentSubmission, setStudentSubmission] = useState<MockHomeworkSubmission | undefined>(INITIAL_HOMEWORK_SUBMISSIONS[0]);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [isRedeemingVoucher, setIsRedeemingVoucher] = useState(false);
  const [redeemedUnitTitle, setRedeemedUnitTitle] = useState<string | null>(null);
  const [enrolledUnitIds, setEnrolledUnitIds] = useState<string[]>([]);
  const [units, setUnits] = useState<MockUnit[]>(INITIAL_UNITS);
  const [checkoutUnit, setCheckoutUnit] = useState<MockUnit | null>(null);
  const [viewAllGrades, setViewAllGrades] = useState(false);
  const [enrollmentsLoaded, setEnrollmentsLoaded] = useState(false);
  const [nextLesson, setNextLesson] = useState<{
    title: string;
    unitTitle: string;
    durationMinutes: number;
    slug: string;
  } | null>(null);

  const [studentProfile, setStudentProfile] = useState<{
    gradeLevel: number;
    gradeTitle: string;
    gradeSlug: string;
    xpPoints: number;
    completedLessons: number;
    parentPhoneNumber?: string;
  }>({
    gradeLevel: 1,
    gradeTitle: "Grade 1 (الصف الأول الابتدائي)",
    gradeSlug: "grade-1",
    xpPoints: 450,
    completedLessons: 0,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/student/enrollments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          if (data?.profile) setStudentProfile(data.profile);
          if (data?.enrolledUnitIds) setEnrolledUnitIds(data.enrolledUnitIds);
          if (data && "nextLesson" in data) setNextLesson(data.nextLesson);
          setEnrollmentsLoaded(true);
        }
      })
      .catch(() => {
        if (active) setEnrollmentsLoaded(true);
      });

    fetch("/api/public/landing-data")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.units && data.units.length > 0) {
          setUnits(data.units);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const studentName = session?.user?.name || "طالب بطل";
  const studentPhone = ((session?.user as Record<string, unknown>)?.phoneNumber as string) || "01000000000";

  const currentStudent: StudentDashboardProfile = {
    name: studentName,
    phone: studentPhone,
    gradeTitle: studentProfile.gradeTitle,
    gradeLevel: studentProfile.gradeLevel,
    gradeSlug: studentProfile.gradeSlug,
    xpPoints: studentProfile.xpPoints || 450,
    nextLevelXp: Math.max(600, Math.ceil(((studentProfile.xpPoints || 450) + 150) / 200) * 200),
    levelNumber: Math.max(1, Math.floor((studentProfile.xpPoints || 450) / 150) + 1),
    streakDays: 4,
    completedLessons: studentProfile.completedLessons,
    activeQuizzes: 2,
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
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      toast.success("مبروك يا بطل! تم شحن الكارت وتفعيل الوحدة بنجاح في حسابك 🎉");
      setVoucherCodeInput("");
      fetch("/api/student/enrollments")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.enrolledUnitIds) setEnrolledUnitIds(d.enrolledUnitIds);
        });
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setIsRedeemingVoucher(false);
    }
  };

  const handleSendToMom = () => {
    const msg = encodeURIComponent(
      `السلام عليكم يا ماما! ❤️\nأنا بطل المنصة التعليمية: ${currentStudent.name}\nجمعت النهاردة ${currentStudent.xpPoints} نقطة XP وعندي حماس ${currentStudent.streakDays} أيام متتالية! 🏆🔥\nالمعلم المشرف بيشجعني وبيقولي شاطر جداً وبطل المنصة! 🥳🎉`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      {/* 1. Header */}
      <StudentNavHeader student={currentStudent} activeMascot={selectedMascot} />

      {/* 2. PWA Prompt */}
      <PwaInstallBanner />

      {/* 3. Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        {/* Next Lesson Banner - Moved up as top priority */}
        <div className="flex items-center gap-2 pt-4">
          <span className="text-sm font-black text-slate-900">🎯 محطتك التالية يا بطل</span>
          <div className="flex-1 h-px bg-purple-200" />
        </div>
        <section className="border-2 border-purple-400 animate-pulse shadow-lg shadow-purple-500/20 rounded-3xl">
          <NextLessonBanner
            lessonTitle={nextLesson?.title ?? INITIAL_LESSONS[0].title}
            unitTitle={nextLesson?.unitTitle ?? INITIAL_UNITS[0].title}
            durationMinutes={nextLesson?.durationMinutes ?? Number.parseInt(INITIAL_LESSONS[0].videoDuration, 10)}
            lessonSlug={nextLesson?.slug ?? INITIAL_LESSONS[0].slug}
            isCompleted={enrollmentsLoaded && !nextLesson}
          />
        </section>

        {/* Welcome Hero */}
        <StudentHeroCard student={currentStudent} activeMascot={selectedMascot} />

        {/* Live Session & Homework Interactive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <LiveSessionWidget session={INITIAL_LIVE_SESSIONS[0]} studentName={currentStudent.name} />
          </div>
          <div className="lg:col-span-5">
            <StudentHomeworkCard
              assignment={currentAssignment}
              submission={studentSubmission}
              onOpenSubmissionModal={() => setShowHomeworkModal(true)}
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div id="courses" className="flex items-center gap-2 pt-4">
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

        {/* Quick Action Super-Pills */}
        <div className="flex items-center gap-2 pt-4">
          <span className="text-sm font-black text-slate-900">⚡ أدوات البطل السريعة</span>
          <div className="flex-1 h-px bg-purple-200" />
        </div>
        <QuickActionPills
          onOpenSoundboard={() => setShowSoundboardModal(true)}
          onOpenCertificate={() => setShowCertificateModal(true)}
          onSendToMom={handleSendToMom}
        />

        {/* Center Voucher Scratch Card Redemption */}
        <CenterVoucherCard
          voucherCodeInput={voucherCodeInput}
          onVoucherCodeChange={setVoucherCodeInput}
          onSubmit={handleRedeemVoucher}
          isRedeeming={isRedeemingVoucher}
          redeemedUnitTitle={redeemedUnitTitle}
        />

        {/* Weekly Checklist */}
        <WeeklyMissionsCard studentName={currentStudent.name} />

        {/* Mascot / Avatar Selector */}
        <MascotSelectorBar
          mascots={MASCOTS}
          selectedMascot={selectedMascot}
          onSelectMascot={setSelectedMascot}
        />
      </main>

      {/* Phonics Soundboard Modal with centralized Modal primitive */}
      <Modal
        isOpen={showSoundboardModal}
        onClose={() => setShowSoundboardModal(false)}
        title="لوحة الصوتيات ونطق الحروف الإنجليزية 🔊"
        icon={<Volume2 className="w-6 h-6 text-purple-600" />}
        maxWidth="4xl"
      >
        <PhonicsSoundBoard />
      </Modal>

      {/* Printable Certificate Modal */}
      {showCertificateModal && (
        <PrintableCertificate
          studentName={currentStudent.name}
          courseTitle="English Primary 1 (منهج اللغة الإنجليزية)"
          quizTitle="إختبار حديقة الحيوان السحري (Zoo Adventure Exam)"
          scorePercentage={95}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Homework Submission Modal */}
      {showHomeworkModal && (
        <HomeworkSubmissionModal
          assignment={currentAssignment}
          existingSubmission={studentSubmission}
          isOpen={showHomeworkModal}
          onClose={() => setShowHomeworkModal(false)}
          onSubmitSuccess={setStudentSubmission}
        />
      )}

      {/* Checkout Modal for Locked Courses */}
      {checkoutUnit && (
        <EgyptianCheckoutModal
          isOpen={Boolean(checkoutUnit)}
          unit={checkoutUnit}
          onClose={() => setCheckoutUnit(null)}
          onSuccess={() => {
            setCheckoutUnit(null);
            fetch("/api/student/enrollments")
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => {
                if (d?.enrolledUnitIds) setEnrolledUnitIds(d.enrolledUnitIds);
              });
          }}
        />
      )}
    </div>
  );
}
