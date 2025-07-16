import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const key = new TextEncoder().encode(process.env.SECRET);
export const cookie = {
  name: "session",
  options: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
  duration: 10 * 24 * 60 * 60 * 1000,
};

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10days")
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
  const sessionCookie = req.cookies.get(cookie.name)?.value;
  if (!sessionCookie) {
    return null;
  }
  return await decrypt(sessionCookie);
}