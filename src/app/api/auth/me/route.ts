// app/api/me/route.ts
import { getAuth } from "firebase-admin/auth";
import { serverApp } from "@/firebase-admin/config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = (await cookies()).get("session")?.value;
  if (!session) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }

  try {
    const decoded = await getAuth(serverApp).verifySessionCookie(session, true);
    return NextResponse.json({
      email: decoded.email,
    });
  } catch {
    return NextResponse.json({ email: null }, { status: 401 });
  }
}
