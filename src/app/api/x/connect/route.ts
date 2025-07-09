import { NextResponse } from "next/server";
const CLIENT_ID = process.env.X_CLIENT_ID!;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET!;
const REDIRECT_URI = process.env.X_REDIRECT_URI!;

interface XOrganization {
  id: string;
  name: string;
  urn: string;
}

interface XUserProfile {
  id: string;
  name: string;
  username: string;
}

interface XResponse {
  access_token: string;
  organizations: XOrganization[];
  user: XUserProfile;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: tokenData.error || "Failed to get access token" },
        { status: 400 }
      );
    }
    const access_token = tokenData.access_token;

    // 2. Fetch user profile
    const userRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const userData = await userRes.json();
    if (!userRes.ok) {
      return NextResponse.json(
        { error: userData.error || "Failed to get user profile" },
        { status: 400 }
      );
    }

    // 3. (Optional) Fetch organizations or managed accounts if available
    // Twitter/X API does not have organizations like LinkedIn, so you may skip or adapt this part.

    return NextResponse.json({
      access_token,
      organizations: [], // X API does not provide organizations, but you can adapt if you have a business API
      user: {
        id: userData.data.id,
        name: userData.data.name,
        username: userData.data.username,
      },
    });
  } catch (error: any) {
    console.error("Error in X connect:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
