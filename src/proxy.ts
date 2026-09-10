import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Session token extraction from cookies (Better Auth standard cookie)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // Dev-Mode authentication bypass for local development and rapid UI testing
  const isDevMode = process.env.NODE_ENV === "development";
  const hasDevBypass =
    isDevMode &&
    (request.cookies.get("dev_bypass")?.value === "true" ||
      request.nextUrl.searchParams.get("dev") === "true" ||
      process.env.DEV_BYPASS_AUTH === "true");

  // Allow public adventure quizzes (/portal/quiz/*) so landing page quizzes are immediately playable
  if (pathname.startsWith("/portal/quiz")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // Student Portal Route Protection (/portal/*)
  if (pathname.startsWith("/portal")) {
    if (!sessionToken && !hasDevBypass) {
      const loginUrl = new URL("/student-login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // Teacher & Assistant CMS Route (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!sessionToken && !hasDevBypass) {
      const loginUrl = new URL("/student-login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Security headers for admin routes
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // Default passthrough for public landing and course preview pages
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");

  if (isDevMode && request.nextUrl.searchParams.get("dev") === "true") {
    response.cookies.set("dev_bypass", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
