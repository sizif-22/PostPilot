// api/instagram/connect

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!,
      client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_REDIRECT_URI}/instagram`,
      code,
    });

    const response = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);
    const data1 = await response.json();

    if (!data1.access_token) {
      throw new Error("Failed to get short-lived token");
    }

    const longLivedParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!,
      client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET!,
      fb_exchange_token: data1.access_token,
    });

    const response2 = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${longLivedParams.toString()}`);
    const data2 = await response2.json();

    return NextResponse.json(data2);
  } catch (error: unknown) {
    console.error("Error getting access token:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
