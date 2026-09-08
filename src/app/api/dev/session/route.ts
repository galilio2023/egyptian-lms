import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const role = searchParams.get("role") || "student";
  const action = searchParams.get("action");

  if (action === "clear") {
    const res = NextResponse.redirect(new URL("/student-login", request.url));
    res.cookies.delete("dev_bypass");
    res.cookies.delete("dev_role");
    return res;
  }

  const targetPath = role === "admin" ? "/admin" : "/portal/dashboard";
  const res = NextResponse.redirect(new URL(targetPath, request.url));

  res.cookies.set("dev_bypass", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  res.cookies.set("dev_role", role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  return res;
}
