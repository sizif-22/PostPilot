"use server";
import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { getSession } from "./session";

const key = new TextEncoder().encode(process.env.SECRET);
const cookie = {
  name: "session",
  options: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
  duration: 7 * 24 * 60 * 60 * 1000,
};

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7days")
    .sign(key);
}

export async function decrypt(session: string) {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSessionFromCookie(req: NextRequest) {
  // const session = await getSession();
  const sessionCookie = req.cookies.get(cookie.name)?.value;
  if (sessionCookie == null ) {
    req.cookies.delete(cookie.name);
    return null;
  }
  return await decrypt(sessionCookie);
}
