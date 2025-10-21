import "server-only";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { serverApp } from "@/firebase-admin/config";

export async function login(idToken: string) {
  try {
    const expiresIn = 60 * 60 * 1000; // 1 hour in milliseconds
    const sessionCookie = await getAuth(serverApp).createSessionCookie(
      idToken,
      {
        expiresIn,
      },
    );
    console.log("Session cookie created successfully");

    (await cookies()).set("session", sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    console.log("Cookie set successfully");
  } catch (error) {
    console.error("Error in login:", error);
    throw error;
  }
}
export async function logout() {
  (await cookies()).delete("session");
}
