import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { serverApp } from "@/firebase-admin/config";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;
  if (!session) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }
  try {
    await getAuth(serverApp).verifySessionCookie(session, true);
    return NextResponse.json({
      verified: true,
    });
  } catch (error) {
    console.log("Error:", error);
    const response = NextResponse.json({ verified: false }, { status: 401 });
    response.cookies.set({
      name: "session",
      value: "",
      maxAge: 0,
      path: "/",
    });
    return response;
  }
}
