import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Session token extraction from cookies (Better Auth standard cookie)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // Student Portal Route Protection (/portal/*)
  if (pathname.startsWith("/portal")) {
    if (!sessionToken) {
      const loginUrl = new URL("/student-login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Teacher & Assistant CMS Route (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!sessionToken) {
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

  // Protected portal routes
  if (pathname.startsWith("/portal")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // Default passthrough for public landing and course preview pages
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
