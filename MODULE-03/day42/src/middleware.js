import { NextResponse } from "next/server";
import { SESSION_COOKIE, isSessionToken } from "@/lib/session-cookie";

export function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (isSessionToken(token)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/checkout", "/orders/:path*"],
};
