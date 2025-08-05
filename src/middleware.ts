import { NextRequest, NextResponse } from "next/server";
// import { checkVerified } from "./firebase/auth";

const protectedRoutes = ["/channels", "/connection"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((prefix) =>
    path.startsWith(prefix)
  );

  if (path === "/") {
    const session = req.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/channels", req.nextUrl));
  }
  if (isProtectedRoute) {
    const origin = req.nextUrl.origin;
    const res = await fetch(`${origin}/api/auth/verify`, {
      method: "GET",
      headers: {
        Cookie: req.headers.get("Cookie") || "",
      },
    });

    if (res.status !== 200) {
      return NextResponse.redirect(new URL("/home", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (path === "/signin") {
    const origin = req.nextUrl.origin;
    const res = await fetch(`${origin}/api/auth/verify`, {
      method: "GET",
      headers: {
        Cookie: req.headers.get("Cookie") || "",
      },
    });
    
    if (res.status == 200) {
      return NextResponse.redirect(new URL("/channels", req.nextUrl));
    }
    return NextResponse.next();
  }
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
