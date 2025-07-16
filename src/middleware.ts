import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "./app/_lib/edge-session";

const protectedRoutes = ["/channels","connection"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((prefix) =>
    path.startsWith(prefix)
  );

  if (req.nextUrl.pathname == "/") {
    const session = await getSessionFromCookie(req);
    if (!session) {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/channels", req.nextUrl));
    }
  }

  if (isProtectedRoute) {
    const session = await getSessionFromCookie(req);
    if (!session) {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
