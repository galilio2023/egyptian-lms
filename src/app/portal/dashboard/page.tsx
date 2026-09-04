"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Sparkles, 
  PlayCircle, 
  ChevronLeft, 
  ArrowLeft,
  Volume2,
  Award,
  MessageCircle,
  Ticket,
  CheckCircle2,
  X,
  BookOpen,
  Lock
} from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { 
  INITIAL_UNITS, 
  INITIAL_HOMEWORK_ASSIGNMENTS, 
  INITIAL_HOMEWORK_SUBMISSIONS, 
  INITIAL_LIVE_SESSIONS, 
  MockHomeworkAssignment, 
  MockHomeworkSubmission,
  MockUnit
} from "@/lib/db/mock-data";
import { PhonicsSoundBoard } from "@/components/lms/phonics-sound-board";
import { PrintableCertificate } from "@/components/lms/printable-certificate";
import { PwaInstallBanner } from "@/components/ui/pwa-install-banner";
import { LiveSessionWidget } from "@/components/lms/live-session-widget";
import { HomeworkSubmissionModal } from "@/components/lms/homework-submission-modal";
import { EgyptianCheckoutModal } from "@/components/checkout/egyptian-checkout-modal";
import { 
  EliteLogoBadge, 
  XpGemSvg, 
  StreakFlameSvg, 
  ChampionCupSvg,
  MascotLionSvg,
  MascotFalconSvg,
  MascotRocketSvg,
  MascotStarSvg,
  ToyDinoDinoSvg,
  ToyPrincessUnicornSvg,
  CenterVoucherCardSvg
} from "@/components/ui/illustrated-icons";
import { KidsToysMiniStrip } from "@/components/ui/floating-kids-toys";

const MASCOTS = [
  { id: "lion", name: "أسد الشجاعة", SvgComponent: MascotLionSvg, title: "مستكشف مبتدئ" },
  { id: "falcon", name: "صقر التميز", SvgComponent: MascotFalconSvg, title: "بطل الصوتيات" },
  { id: "rocket", name: "رائد الفضاء", SvgComponent: MascotRocketSvg, title: "فارس الكلمات" },
  { id: "star", name: "نجم الإيليت", SvgComponent: MascotStarSvg, title: "عبقري الجرامر" },
];

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [selectedMascot, setSelectedMascot] = useState(MASCOTS[0]);
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
  const [studentProfile, setStudentProfile] = useState<{
    gradeLevel: number;
    gradeTitle: string;
    gradeSlug: string;
    xpPoints: number;
    parentPhoneNumber?: string;
  }>({
    gradeLevel: 1,
    gradeTitle: "Grade 1 (الصف الأول الابتدائي)",
    gradeSlug: "grade-1",
    xpPoints: 450,
  });
  const [viewAllGrades, setViewAllGrades] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/student/enrollments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          if (data?.profile) {
            setStudentProfile(data.profile);
          }
          if (data?.enrolledUnitIds) {
            setEnrolledUnitIds(data.enrolledUnitIds);
          }
        }
      })
      .catch(() => {});

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

  const studentName = session?.user?.name || "أحمد محمود الخولي";
  const studentPhone = ((session?.user as Record<string, unknown>)?.phoneNumber as string) || "01012345678";

  const currentStudent = {
    name: studentName,
    phone: studentPhone,
    gradeTitle: studentProfile.gradeTitle,
    gradeLevel: studentProfile.gradeLevel,
    gradeSlug: studentProfile.gradeSlug,
    xpPoints: studentProfile.xpPoints || 450,
    nextLevelXp: Math.max(600, Math.ceil(((studentProfile.xpPoints || 450) + 150) / 200) * 200),
    levelNumber: Math.max(1, Math.floor((studentProfile.xpPoints || 450) / 150) + 1),
    streakDays: 4,
    completedLessons: 6,
    activeQuizzes: 2,
  };

  const xpPercentage = Math.round((currentStudent.xpPoints / currentStudent.nextLevelXp) * 100);
  const ActiveMascotSvg = selectedMascot.SvgComponent;

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
      toast.success("مبروك يا بطل! تم شحن الكارت وتفعيل الوحدة بنجاح في حسابك 🎉");
      setVoucherCodeInput("");
      // Refresh enrollments
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
      `السلام عليكم يا ماما! ❤️\nأنا بطل أكاديمية إيليت: ${currentStudent.name}\nجمعت النهاردة ${currentStudent.xpPoints} نقطة XP وعندي حماس ${currentStudent.streakDays} أيام متتالية! 🏆🔥\nمستر أحمد بيشجعني وبيقولي شاطر جداً وبطل الأكاديمية! 🥳🎉`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      
      {/* Top Student Navigation */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="max-w-6xl mx-auto rounded-full bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-[0_8px_30px_rgba(139,92,246,0.1)] px-5 py-2.5 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2.5 group">
            <EliteLogoBadge className="w-9 h-9 group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-black text-sm text-slate-900 block leading-none">
                أكاديمية <span className="text-gradient-purple">إيليت</span>
              </span>
              <span className="text-[10px] text-purple-700 font-bold">بوابة الطالب الذكية</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 px-3 py-1 rounded-full shadow-sm">
              <ActiveMascotSvg className="w-7 h-7" />
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block leading-none">{currentStudent.name}</span>
                <span className="text-[9px] text-purple-700 font-bold">{currentStudent.gradeTitle}</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* PWA Mobile App Installation Prompt */}
      <PwaInstallBanner />

      {/* Main Student Hub Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        
        {/* Welcome Hero Card with Aurora Gradients & Floating Toys */}
        <div className="modern-card p-6 sm:p-8 bg-gradient-vibrant text-white border-0 shadow-xl shadow-purple-600/25 relative overflow-hidden">
          
          {/* Glowing Aura Rings */}
          <div className="absolute -bottom-10 -end-10 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 start-1/3 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Floating Cheerful Toys inside Student Hero */}
          <div className="absolute top-3 end-4 sm:end-12 animate-float-slow pointer-events-none opacity-85 hover:opacity-100 transition-opacity">
            <ToyDinoDinoSvg className="w-14 h-14 sm:w-20 sm:h-20 drop-shadow-lg" />
          </div>
          <div className="absolute bottom-2 start-4 sm:start-24 animate-float-reverse pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
            <ToyPrincessUnicornSvg className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
                <ActiveMascotSvg className="w-5 h-5" />
                <span>المستوى {currentStudent.levelNumber}: {selectedMascot.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                أهلاً بك يا بطل اللغة الإنجليزية {currentStudent.name} 👋
              </h1>
              
              <p className="text-xs sm:text-sm text-purple-100 max-w-xl font-medium leading-relaxed">
                واصل مغامراتك التعليمية مع مستر أحمد عبد الرحمن، احصل على النقاط واجتز الاختبارات لترقية بطلك!
              </p>

              {/* XP Level Progress Bar */}
              <div className="space-y-1.5 max-w-md pt-1">
                <div className="flex items-center justify-between text-xs font-black text-white">
                  <span>المستوى {currentStudent.levelNumber}</span>
                  <span className="text-amber-200 font-bold">{currentStudent.xpPoints} / {currentStudent.nextLevelXp} XP (باقي {currentStudent.nextLevelXp - currentStudent.xpPoints} للمستوى التالي)</span>
                </div>
                <div className="w-full h-3 bg-purple-950/40 rounded-full overflow-hidden p-0.5 border border-white/30 backdrop-blur-sm">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Gamification Stats */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-4 text-center min-w-[110px] shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-amber-300 mb-1">
                  <XpGemSvg className="w-5 h-5 drop-shadow" />
                  <span className="text-xs font-black">نقاط XP</span>
                </div>
                <div className="text-2xl font-black text-white">{currentStudent.xpPoints}</div>
              </div>

              <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-4 text-center min-w-[110px] shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-orange-300 mb-1">
                  <StreakFlameSvg className="w-5 h-5 drop-shadow" />
                  <span className="text-xs font-black">حماس متتالي</span>
                </div>
                <div className="text-2xl font-black text-white">{currentStudent.streakDays} أيام</div>
              </div>
            </div>
          </div>
        </div>

        {/* Playful Interactive Kids Toys Ribbon */}
        <div className="modern-card p-4 bg-white/90 backdrop-blur-md border-2 border-purple-100 shadow-sm text-center">
          <span className="text-xs font-black text-purple-900 block mb-1">
            🌟 شخصيات وألعاب الأكاديمية المرحة للأبطال الصغار
          </span>
          <KidsToysMiniStrip />
        </div>

        {/* Live Revision Session & Homework Interactive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Live Session (Col 7) */}
          <div className="lg:col-span-7">
            <LiveSessionWidget session={INITIAL_LIVE_SESSIONS[0]} studentName={currentStudent.name} />
          </div>

          {/* Homework Submission & Correction Hub (Col 5) */}
          <div className="lg:col-span-5">
            <div className="modern-card p-6 bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30 border-2 border-purple-200 rounded-3xl shadow-md h-full flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-900">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="font-black text-xs">كراسة الواجب المنزلية</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                    {currentAssignment.pageNumber}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900 line-clamp-1">
                    {currentAssignment.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                    {currentAssignment.instructions}
                  </p>
                </div>

                {/* Status Callout */}
                <div className="p-3 rounded-2xl bg-purple-100/50 border border-purple-200 text-xs flex items-center justify-between">
                  <span className="font-bold text-slate-700">حالة التصحيح:</span>
                  {studentSubmission?.status === "graded" ? (
                    <span className="font-black text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم التصحيح ({studentSubmission.score}/{studentSubmission.maxScore}) 📜</span>
                    </span>
                  ) : studentSubmission ? (
                    <span className="font-black text-amber-700 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>تم التسليم (بانتظار المعلم)</span>
                    </span>
                  ) : (
                    <span className="font-bold text-rose-600">
                      لم يتم التسليم بعد
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowHomeworkModal(true)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{studentSubmission?.status === "graded" ? "عرض كراسة الواجب المصححة بالقلم ✍️" : "تسليم صور كراسة الواجب الآن 🚀"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Mascot / Avatar Selector Bar */}
        <div className="modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-purple-100 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
              <ChampionCupSvg className="w-5 h-5" />
              <span>اختر تميمتك وشخصيتك البطلة:</span>
            </h3>
            <span className="text-[11px] text-purple-700 font-extrabold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              شخصية نشطة: {selectedMascot.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {MASCOTS.map((m) => {
              const isSelected = selectedMascot.id === m.id;
              const IconSvg = m.SvgComponent;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMascot(m);
                    toast.success(`تم اختيار ${m.name} كتميمة الطالب!`);
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-right transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-purple-50/80 border-purple-500 shadow-md ring-4 ring-purple-100 scale-[1.02]'
                      : 'bg-white border-purple-100 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  <IconSvg className="w-9 h-9 shrink-0 drop-shadow-sm" />
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-900 block truncate">{m.name}</span>
                    <span className="text-[10px] text-purple-600 font-bold block truncate">{m.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Action Super-Pills for Kids & Parents */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => setShowSoundboardModal(true)}
            className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-200 hover:border-purple-400 hover:scale-[1.03] transition-all shadow-md text-right group flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block group-hover:text-purple-700 transition-colors">
                لوحة الصوتيات 🔊
              </span>
              <span className="text-[10px] text-purple-600 font-bold block">
                استمع لنطق الحروف والكلمات
              </span>
            </div>
          </button>

          <button
            onClick={() => setShowCertificateModal(true)}
            className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-amber-200 hover:border-amber-400 hover:scale-[1.03] transition-all shadow-md text-right group flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block group-hover:text-amber-700 transition-colors">
                شهادة التفوق 🎓
              </span>
              <span className="text-[10px] text-amber-600 font-bold block">
                عرض وطباعة شهادة التقدير
              </span>
            </div>
          </button>

          <button
            onClick={handleSendToMom}
            className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-emerald-200 hover:border-emerald-400 hover:scale-[1.03] transition-all shadow-md text-right group flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                واتساب ماما 💬
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">
                إرسال النتيجة لماما فورياً
              </span>
            </div>
          </button>

          <a
            href="#center-voucher-box"
            className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-indigo-200 hover:border-indigo-400 hover:scale-[1.03] transition-all shadow-md text-right group flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block group-hover:text-indigo-700 transition-colors">
                كارت السنتر 🎟️
              </span>
              <span className="text-[10px] text-indigo-600 font-bold block">
                شحن كود كارت الشحن
              </span>
            </div>
          </a>
        </div>

        {/* Today's Hero Mission Checklist (مهام الأسبوع للأبطال) */}
        <div className="modern-card p-6 bg-gradient-to-r from-purple-50/90 via-white to-pink-50/90 border-2 border-purple-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-black text-sm text-slate-900">
                مهام الأسبوع للبطل {currentStudent.name} (Weekly Checklist)
              </h3>
            </div>
            <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              أنجزت 2 من 3 مهام
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Task 1 */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-900 block">1. مشاهدة الحصة الأولى</span>
                <span className="text-[10px] text-emerald-600 font-bold block">تمت المشاهدة بنجاح ✓</span>
              </div>
            </div>

            {/* Task 2 */}
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-900 block">2. تحميل ملزمة الشرح</span>
                <span className="text-[10px] text-emerald-600 font-bold block">تم حفظ الملزمة PDF ✓</span>
              </div>
            </div>

            {/* Task 3 */}
            <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-400 shadow-sm flex items-start gap-3 animate-pulse-soft">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                3
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black text-purple-950 block">3. امتحان حديقة الحيوان</span>
                <Link
                  href="/portal/quiz/grade-1-unit-1-quiz"
                  className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full shadow-xs hover:scale-105 transition-transform"
                >
                  <span>ابدأ الاختبار (+50 XP)</span>
                  <ChevronLeft className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Center Scratch Card Voucher Redemption Section */}
        <div id="center-voucher-box" className="modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-indigo-200 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                <CenterVoucherCardSvg className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  شحن كارت السنتر والمكتبة (Center Scratch Card)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  لو اشتريت كارت الشحن من السنتر أو المكتبة المعتمدة، اكتب الكود المطبوع هنا لتفعيل الحصة فورياً.
                </p>
              </div>
            </div>

            {redeemedUnitTitle && (
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 shrink-0">
                تم تفعيل: {redeemedUnitTitle} ✓
              </span>
            )}
          </div>

          <form onSubmit={handleRedeemVoucher} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={voucherCodeInput}
              onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
              placeholder="مثال: ELITE-GR1-998271"
              className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-600 focus:outline-hidden font-mono font-bold text-sm tracking-wider uppercase text-slate-800 bg-purple-50/30"
              disabled={isRedeemingVoucher}
            />
            <button
              type="submit"
              disabled={isRedeemingVoucher}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0 disabled:opacity-50"
            >
              {isRedeemingVoucher ? "جاري الشحن..." : "تفعيل الكارت فورياً"}
            </button>
          </form>
        </div>

        {/* Continue Learning Next Lesson Banner */}
        <div className="modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
              <PlayCircle className="w-7 h-7" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-black text-purple-700 uppercase tracking-wider">
                المحاضرة التالية للمشاهدة
              </span>
              <h3 className="font-black text-base text-slate-900">
                الدرس 1 و 2: الحروف والنطق الصوتي (Phonics & Letters)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Unit 1: Hello & My Class • مستر أحمد عبد الرحمن</p>
            </div>
          </div>

          <Link
            href="/portal/lesson/phonics-and-letters"
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-vibrant hover:scale-[1.03] text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <span>متابعة الدرس الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Enrolled Courses / Units */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ChampionCupSvg className="w-6 h-6" />
                <span>{viewAllGrades ? "جميع المناهج والمراحل الدراسية" : `الوحدات المفعلة ومنهج (${currentStudent.gradeTitle})`}</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {viewAllGrades 
                  ? "تصفح وحدات المنهج لجميع الصفوف من الصف الأول إلى السادس الابتدائي" 
                  : `الوحدات المشترك بها والمقررة لبطلنا الصغير`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewAllGrades(!viewAllGrades)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  viewAllGrades
                    ? "bg-purple-100 text-purple-900 border-purple-300 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {viewAllGrades ? "عرض صفي فقط 🎯" : "استعراض باقي الصفوف 📚"}
              </button>

              <Link href="/#courses_section" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 shrink-0">
                <span>تفعيل وحدات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const gradeUnits = units.filter(
                (u) =>
                  u.gradeSlug === currentStudent.gradeSlug ||
                  u.gradeTitle?.toLowerCase().includes(`grade ${currentStudent.gradeLevel}`) ||
                  enrolledUnitIds.includes(u.id) ||
                  enrolledUnitIds.includes(u.slug)
              );
              const displayedUnits = viewAllGrades ? units : gradeUnits.length > 0 ? gradeUnits : units;

              return displayedUnits.map((unit) => {
                const isUnlocked = enrolledUnitIds.includes(unit.id) || enrolledUnitIds.includes(unit.slug);

              return (
                <div
                  key={unit.id}
                  className={`modern-card overflow-hidden bg-white border-2 flex flex-col justify-between group shadow-md transition-all ${
                    isUnlocked ? "border-purple-100 hover:border-purple-300" : "border-slate-200 opacity-90"
                  }`}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={unit.thumbnailUrl}
                      alt={unit.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute top-3 start-3 px-3 py-1 rounded-full text-white text-[10px] font-black shadow-md flex items-center gap-1 ${
                      isUnlocked ? "bg-emerald-500" : "bg-slate-900/80 backdrop-blur-xs"
                    }`}>
                      {isUnlocked ? (
                        <span>مفعّل ونشط ✓</span>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>غير مفعل (مغلق 🔒)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          {unit.gradeTitle}
                        </span>
                        {!isUnlocked && (
                          <span className="text-xs font-black text-pink-600">
                            {unit.priceEgp} ج.م
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                        {unit.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {unit.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-purple-50">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>{isUnlocked ? "التقدم في الوحدة" : "حالة الاشتراك"}</span>
                        <span className="text-purple-700 font-black">
                          {isUnlocked ? `${Math.round((2 / unit.lessonsCount) * 100)}%` : "مطلوب الاشتراك"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-purple-50 rounded-full overflow-hidden border border-purple-200">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all"
                          style={{ width: isUnlocked ? `${Math.round((2 / unit.lessonsCount) * 100)}%` : "0%" }}
                        />
                      </div>
                    </div>

                    {isUnlocked ? (
                      <Link
                        href={`/portal/learn/${unit.slug}`}
                        className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-gradient-vibrant hover:text-white text-purple-900 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-purple-200 hover:border-transparent transition-all shadow-sm"
                      >
                        <span>الدخول للوحدة والمحاضرات</span>
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => setCheckoutUnit(unit)}
                        className="w-full py-2.5 rounded-xl bg-gradient-vibrant hover:scale-[1.02] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                      >
                        <CenterVoucherCardSvg className="w-4 h-4" />
                        <span>تفعيل الوحدة الآن ({unit.priceEgp} ج.م)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            });
            })()}
          </div>
        </div>

      </main>

      {/* Phonics Soundboard Modal */}
      {showSoundboardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 relative border-2 border-purple-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-purple-600" />
                <h3 className="font-black text-base text-slate-900">لوحة الصوتيات ونطق الحروف الإنجليزية 🔊</h3>
              </div>
              <button
                onClick={() => setShowSoundboardModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PhonicsSoundBoard />
          </div>
        </div>
      )}

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
          onSubmitSuccess={(newSub) => {
            setStudentSubmission(newSub);
          }}
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
