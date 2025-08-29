import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(request: Request) {
  try {
    const { channelId, refreshToken } = await request.json();

    if (!channelId || !refreshToken) {
      return NextResponse.json(
        { message: "channelId and refreshToken are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY!,
          client_secret: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.error.message || "Failed to refresh token" },
        { status: 500 }
      );
    }

    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    await updateDoc(doc(db, "Channels", channelId), {
      "socialMedia.tiktok.accessToken": newAccessToken,
      "socialMedia.tiktok.refreshToken": newRefreshToken,
    });

    return NextResponse.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing TikTok token:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
