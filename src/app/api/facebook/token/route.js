// app/api/facebook/token/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=https://postpilot-22.vercel.app/dashboard/connected&code=${code}`;

    const response = await fetch(tokenUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to get access token");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
