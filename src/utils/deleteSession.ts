"use server";
import { cookies } from "next/headers";

const cookie = {
  name: "session",
  options: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
  duration: 10 * 24 * 60 * 60 * 1000,
};
export async function deleteSession() {
  (await cookies()).delete(cookie.name);
}
