import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getLandingPageData } from "@/lib/data-landing";
import { getStudentDashboardData } from "@/lib/data-dashboard";
import { StudentDashboardClient } from "@/features/portal-dashboard/components/student-dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة تحكم الطالب البطل",
  description: "تابع تقدمك الدراسي، واجباتك، ونقاط XP في أكاديمية إيليت.",
  robots: { index: false, follow: false },
};

export default async function StudentDashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) {
    redirect("/student-login?callbackUrl=/portal/dashboard");
  }

  const userId = session.user.id;
  const cookieHeader = headersList.get("cookie");

  // Parallel data fetch — no waterfall
  const [{ units, settings }, dashboardData] = await Promise.all([
    getLandingPageData(),
    getStudentDashboardData(userId, cookieHeader),
  ]);

  // If student is banned / device locked, redirect to login
  if (dashboardData.isDeviceLocked) {
    redirect("/student-login?reason=device_locked");
  }

  const studentUser = session.user as { id: string; name: string; email: string; phoneNumber?: string };

  return (
    <StudentDashboardClient
      initialUnits={units}
      initialSettings={settings}
      initialDashboardData={dashboardData}
      studentId={studentUser.id}
      studentName={studentUser.name}
      studentPhone={(studentUser.phoneNumber as string | undefined) ?? "01000000000"}
    />
  );
}
