import { NextRequest, NextResponse } from "next/server";

/**
 * Development-only session bypass route.
 * Returns 404 in production builds to eliminate attack surface entirely.
 */
export async function GET(request: NextRequest) {
  // Defense-in-depth: unconditionally reject in production even if accidentally deployed
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const role = searchParams.get("role") || "student";
  const action = searchParams.get("action");

  if (action === "clear") {
    const res = NextResponse.redirect(new URL("/student-login", request.url));
    res.cookies.delete("dev_bypass");
    res.cookies.delete("dev_role");
    res.cookies.delete("elite_student_phone");
    res.cookies.delete("elite_device_id");
    res.cookies.delete("better-auth.session_token");
    res.cookies.delete("__Secure-better-auth.session_token");
    return res;
  }

  const targetPath = role === "admin" ? "/admin" : "/portal/dashboard";
  const res = NextResponse.redirect(new URL(targetPath, request.url));

  const cookieOptions = {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax" as const,
  };

  res.cookies.set("dev_bypass", "true", cookieOptions);
  res.cookies.set("dev_role", role, cookieOptions);

  if (role === "student") {
    res.cookies.set("elite_student_phone", "01012345678", cookieOptions);
    res.cookies.set("elite_device_id", "dev-device-student", cookieOptions);
  } else {
    res.cookies.set("elite_device_id", "dev-device-admin", cookieOptions);
  }

  return res;
}
