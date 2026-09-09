import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getPublicUnitDetails } from "@/server/services/public-curriculum.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitSlug: string }> }
) {
  try {
    const { unitSlug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const data = await getPublicUnitDetails(unitSlug, currentUserId);
    if (!data) {
      return NextResponse.json({ error: "الوحدة الدراسية غير موجودة" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Public unit fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب بيانات الوحدة الدراسية" }, { status: 500 });
  }
}
