import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "./app/_lib/edge-session";

const protectedRoutes = ["/channels", "connection"];
const publicRoutes = ["/home"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  // if (isPublicRoute) {
  //   const session = await getSessionFromCookie(req);
  //   if (!session) {
  //     const response = NextResponse.redirect(new URL(path, req.nextUrl));
  //     response.cookies.delete("session");
  //     return response;
  //   }
  // }
  const isProtectedRoute = protectedRoutes.some((prefix) =>
    path.startsWith(prefix)
  );
  if (req.nextUrl.pathname == "/") {
    const session = await getSessionFromCookie(req);
    if (!session) {
      const response = NextResponse.redirect(new URL("/home", req.nextUrl));
      response.cookies.delete("session");
      return response;
    } else {
      return NextResponse.redirect(new URL("/channels", req.nextUrl));
    }
  }
  if (isProtectedRoute) {
    const session = await getSessionFromCookie(req);
    if (!session) {
      const response = NextResponse.redirect(new URL("/home", req.nextUrl));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
