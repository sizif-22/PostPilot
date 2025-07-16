import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverApp } from "@/firebase-admin/config";
import { getAuth } from "firebase-admin/auth";
import { encrypt, decrypt, cookie } from "./edge-session";
import { NextResponse } from "next/server";

export async function createSession(idToken: string) {
  try {
    // Verify the token with explicit project ID check
    const decoded = await getAuth(serverApp).verifyIdToken(idToken, true);

    // Additional validation to ensure the token is for the correct project
    const expectedProjectId = process.env.NEXT_PUBLIC_PROJECT_ID;
    if (decoded.aud !== expectedProjectId) {
      throw new Error(
        `Token audience mismatch. Expected: ${expectedProjectId}, Got: ${decoded.aud}`
      );
    }

    const expires = new Date(Date.now() + cookie.duration);
    const session = await encrypt({ idToken, expires });
    (await cookies()).set(cookie.name, session, {
      ...cookie.options,
      expires,
      sameSite: "lax",
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/`);
  } catch (error) {
    console.error("Session creation failed:", error);
    throw error;
  }
}

export async function getSession() {
  try {
    const sessionCookie = (await cookies()).get(cookie.name)?.value;
    if (!sessionCookie) {
      return null;
    }

    const payload = await decrypt(sessionCookie);
    if (!payload || typeof payload.idToken !== "string") {
      return null;
    }

    const decoded = await getAuth(serverApp).verifyIdToken(
      payload.idToken,
      true
    );
    if (!decoded.email) {
      return null;
    }

    return {
      email: decoded.email,
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    deleteSession();
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(cookie.name);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/`);
}
