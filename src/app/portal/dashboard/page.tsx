import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getLandingPageData } from "@/lib/data-landing";
import { getStudentDashboardData, type StudentDashboardServerData } from "@/lib/data-dashboard";
import { INITIAL_PLATFORM_SETTINGS } from "@/lib/db/mock-data";
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

  const cookieHeader = headersList.get("cookie") || "";
  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    (cookieHeader.includes("dev_bypass=true") || process.env.DEV_BYPASS_AUTH === "true");

  if (!session?.user?.id && !isDevBypass) {
    redirect("/student-login?callbackUrl=/portal/dashboard");
  }

  const userId = session?.user?.id || "student-dev-primary";

  // Parallel data fetch — gracefully handle local DB unavailability in dev mode
  let landingData: Awaited<ReturnType<typeof getLandingPageData>> = { units: [], settings: INITIAL_PLATFORM_SETTINGS };
  let dashboardData: StudentDashboardServerData = {
    profile: null,
    enrolledUnitIds: ["u-101"],
    nextLesson: null,
    currentAssignment: null,
    studentSubmission: undefined,
    isBanned: false,
    isDeviceLocked: false,
  };

  try {
    const [landing, dash] = await Promise.all([
      getLandingPageData(),
      getStudentDashboardData(userId, cookieHeader),
    ]);
    landingData = landing;
    dashboardData = dash;
  } catch (err) {
    if (isDevBypass) {
      console.warn("[portal/dashboard] Using fallback landing/dashboard data for dev bypass:", err);
      try {
        landingData = await getLandingPageData();
      } catch {
        // use defaults
      }
    } else {
      throw err;
    }
  }

  // Provide high-fidelity mock student profile in development bypass if DB record is empty
  if (isDevBypass && !dashboardData.profile) {
    dashboardData.profile = {
      gradeLevel: 1,
      gradeTitle: "Grade 1 (الصف الأول الابتدائي)",
      gradeSlug: "grade-1",
      xpPoints: 850,
      completedLessons: 3,
      parentPhoneNumber: "01098765432",
      isBanned: false,
    };
    if (dashboardData.enrolledUnitIds.length === 0) {
      dashboardData.enrolledUnitIds = ["u-101"];
    }
    if (!dashboardData.nextLesson) {
      dashboardData.nextLesson = {
        title: "الدرس الأول: الحروف والنطق الصوتي (Phonics & Letters)",
        unitTitle: "Unit 1: Back to School",
        durationMinutes: 24,
        slug: "phonics-and-letters",
      };
    }
  }

  // If student is banned / device locked, redirect to login (bypassed in dev)
  if (!isDevBypass && dashboardData.isBanned) {
    redirect("/student-login?reason=banned");
  }

  if (!isDevBypass && dashboardData.isDeviceLocked) {
    redirect("/student-login?reason=device_locked");
  }

  const studentUser = session?.user
    ? (session.user as { id: string; name: string; email: string; phoneNumber?: string })
    : {
        id: "student-dev-primary",
        name: "طالب تجريبي (وضع التطوير)",
        email: "student.dev@elite-academy.edu.eg",
        phoneNumber: "01012345678",
      };

  return (
    <StudentDashboardClient
      initialUnits={landingData.units}
      initialSettings={landingData.settings}
      initialDashboardData={dashboardData}
      studentId={studentUser.id}
      studentName={studentUser.name}
      studentPhone={(studentUser.phoneNumber as string | undefined) ?? "01012345678"}
    />
  );
}
