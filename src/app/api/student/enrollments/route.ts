import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getStudentEnrollmentsData } from "@/server/services/student-enrollments.service";

export async function GET() {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        enrolledUnitIds: [],
        enrollments: [],
        nextLesson: null,
      });
    }

    // Resolve device identifiers
    const clientCookie = headerList.get("cookie") || "";
    const cookieMatch = clientCookie.match(/(?:^|;\s*)elite_device_id=([^;]*)/);
    const clientDeviceId = headerList.get("x-device-id") || (cookieMatch ? decodeURIComponent(cookieMatch[1].trim()) : null);
    const sessionDeviceId = (session.session as { deviceId?: string } | undefined)?.deviceId;

    const result = await getStudentEnrollmentsData({
      userId: session.user.id,
      clientDeviceId,
      sessionDeviceId,
      sessionId: session.session?.id,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 403 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Student enrollments fetch error:", error);
    return NextResponse.json({
      success: true,
      profile: {
        gradeLevel: 1,
        gradeTitle: "Grade 1 (الصف الأول الابتدائي)",
        gradeSlug: "grade-1",
        xpPoints: 450,
        completedLessons: 0,
        parentPhoneNumber: "01000000000",
        governorate: "cairo",
      },
      enrolledUnitIds: [],
      enrollments: [],
      nextLesson: null,
    });
  }
}
