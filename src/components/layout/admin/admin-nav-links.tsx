"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { Sliders, ShieldAlert } from "lucide-react";
import { 
  AdminShieldCrownSvg,
  CurriculumBookSvg,
  ExamQuizSheetSvg,
  UsersGraduationSvg,
  EgyptianWalletSvg,
  BroadcastMegaphoneSvg,
  StudentRegisterPencilSvg,
  DrmVideoShieldSvg
} from "@/components/ui/illustrated-icons";

export interface NavItemConfig {
  href: string;
  label: string;
  Svg: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const ADMIN_NAV_ITEMS: NavItemConfig[] = [
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

export const AdminNavLinks: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAssistant = userRole === "assistant";

  const visibleNavItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (isAssistant && (item.href === "/admin/settings" || item.href === "/admin/security")) {
      return false;
    }
    return true;
  });

  return (
    <nav className="space-y-1.5">
      {visibleNavItems.map((item) => {
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
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
