import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/machinery", "/maintenance", "/settings"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!needsAuth) return NextResponse.next();

  const session = request.cookies.get("admin_session")?.value;
  if (session && session === process.env.ADMIN_PASSWORD) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/machinery/:path*", "/maintenance/:path*", "/settings/:path*"],
};
