// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionCookie, getUserByUid } from "@/firebase-admin/config";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Verify the session cookie
    const decodedToken = await verifySessionCookie(session, true);

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get fresh user data directly from Firebase Admin
    // This ensures we have the most up-to-date verification status
    const userRecord = await getUserByUid(decodedToken.uid);
    
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is verified using fresh user data
    if (!userRecord.emailVerified) {
      return NextResponse.json(
        {
          error: "Email not verified",
          emailVerified: false,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        emailVerified: true,
        uid: decodedToken.uid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth verification error:", error);
    
    // Clear invalid session cookie
    const response = NextResponse.json({ error: "Verification failed" }, { status: 401 });
    response.cookies.set({
      name: "session",
      value: "",
      maxAge: 0,
      path: "/",
    });
    
    return response;
  }
}