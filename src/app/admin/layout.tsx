"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ExternalLink,
  LogOut,
  ShieldAlert,
  Sliders
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { 
  EliteLogoBadge,
  AdminShieldCrownSvg,
  CurriculumBookSvg,
  ExamQuizSheetSvg,
  UsersGraduationSvg,
  EgyptianWalletSvg,
  BroadcastMegaphoneSvg,
  StudentRegisterPencilSvg,
  DrmVideoShieldSvg
} from "@/components/ui/illustrated-icons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  // Role guard: strict verification for admin/teacher/assistant
  const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;
  const isAuthorizedAdmin = userRole === "admin" || userRole === "teacher" || userRole === "assistant";
  
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#faf5ff] flex items-center justify-center">
        <div className="text-center space-y-3">
          <EliteLogoBadge className="w-16 h-16 mx-auto animate-bounce" />
          <p className="text-sm font-bold text-purple-900">جاري فتح لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated or unauthorized, render Access Denied guard
  if (!session?.user || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border border-purple-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black">منطقة إدارة محمية</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              يتطلب الوصول إلى لوحة تحكم واستوديو الأكاديمية حساب مشرف معتمد (Admin أو Teacher أو Assistant).
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/student-login?callbackUrl=/admin"
              className="w-full py-3 rounded-2xl bg-gradient-vibrant text-white font-black text-xs shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition-all text-center block"
            >
              تسجيل الدخول بحساب المشرف
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-2xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors text-center block"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminDisplayName = session.user.name || "مستر أحمد عبد الرحمن";
  const adminRoleTitle = userRole === "admin" ? "مدير النظام العام" : userRole === "teacher" ? "المعلم المشرف" : "مساعد تعليمي";

  const navItems = [
    { href: "/admin", label: "نظرة عامة والتقارير", Svg: AdminShieldCrownSvg },
    { href: "/admin/homework", label: "كنترول كراسات الواجب", Svg: StudentRegisterPencilSvg, badge: "جديد ✍️" },
    { href: "/admin/live-sessions", label: "البث المباشر والزووم", Svg: DrmVideoShieldSvg, badge: "🔴 لايف" },
    { href: "/admin/curriculum", label: "إدارة المنهج والمحاضرات", Svg: CurriculumBookSvg },
    { href: "/admin/quizzes", label: "بنك الأسئلة والامتحانات", Svg: ExamQuizSheetSvg },
    { href: "/admin/students", label: "الطلاب والأجهزة", Svg: UsersGraduationSvg },
    { href: "/admin/orders", label: "مراجعة إيصالات إنستاباي", Svg: EgyptianWalletSvg, badge: "2 جديد" },
    { href: "/admin/broadcasts", label: "رسائل الواتساب الجماعية", Svg: BroadcastMegaphoneSvg },
    { href: "/admin/settings", label: "إعدادات المنصة والكاروسيل", Svg: Sliders },
    { href: "/admin/security", label: "سجل الأمان ومكافحة التهديدات", Svg: ShieldAlert, badge: "🛡️ آمن" },
  ];

  return (
    <div className="min-h-screen bg-[#faf5ff] text-slate-900 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white/90 backdrop-blur-md border-b md:border-b-0 md:border-l border-purple-100 p-5 flex flex-col justify-between shrink-0 shadow-sm">
        
        <div className="space-y-5">
          
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-4 border-b border-purple-100">
            <Link href="/" className="flex items-center gap-3">
              <EliteLogoBadge className="w-10 h-10" />
              <div>
                <span className="font-black text-sm text-slate-900 block">
                  لوحة تحكم <span className="text-gradient-purple">إيليت</span>
                </span>
                <span className="text-[10px] text-purple-700 font-bold">Elite CMS Studio</span>
              </div>
            </Link>
          </div>

          {/* Active Admin Profile Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-vibrant text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-purple-500/25">
              <AdminShieldCrownSvg className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-black text-slate-900 block truncate leading-tight">
                {adminDisplayName}
              </span>
              <span className="text-[10px] text-purple-700 font-bold block truncate">
                {adminRoleTitle}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const ItemSvg = item.Svg;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-vibrant text-white shadow-md shadow-purple-500/25 scale-[1.02]"
                      : "text-slate-600 hover:text-purple-800 hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ItemSvg className="w-5 h-5 drop-shadow-sm" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Footer Link to Student Portal */}
        <div className="pt-5 border-t border-purple-100 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors border border-purple-200"
          >
            <span>عرض موقع الأكاديمية</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج من الإدارة</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
