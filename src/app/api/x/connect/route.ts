// 2. Updated route.ts - API handler
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Cookies from "js-cookie";
const CLIENT_ID = process.env.X_CLIENT_ID!;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET!;
const REDIRECT_URI = process.env.X_REDIRECT_URI!;

interface XUserProfile {
  id: string;
  name: string;
  username: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Check for OAuth errors
  if (error) {
    return NextResponse.json(
      { error: `OAuth error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // Get cookies
    const cookieStore = await cookies();
    const storedState = cookieStore.get("xState")?.value;
    const codeVerifier = cookieStore.get("xCodeVerifier")?.value;

    // Verify state parameter
    if (!state || state !== storedState) {
      return NextResponse.json(
        { error: "Invalid state parameter" },
        { status: 400 }
      );
    }

    if (!codeVerifier) {
      return NextResponse.json(
        { error: "Missing code verifier" },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    });

    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: tokenParams,
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.json(
        {
          error:
            tokenData.error_description ||
            tokenData.error ||
            "Failed to get access token",
        },
        { status: 400 }
      );
    }

    // Check if we got a refresh token (required for long-lived tokens)
    if (!tokenData.refresh_token) {
      console.error(
        "No refresh token received. Make sure 'offline.access' scope is requested."
      );
      return NextResponse.json(
        {
          error:
            "No refresh token received. Please ensure 'offline.access' scope is requested.",
        },
        { status: 400 }
      );
    }

    // Exchange refresh token for long-lived access token
    const refreshParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenData.refresh_token,
      client_id: CLIENT_ID,
    });

    const refreshRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: refreshParams,
    });

    const refreshData = await refreshRes.json();

    if (!refreshRes.ok) {
      console.error("Refresh token exchange failed:", refreshData);
      return NextResponse.json(
        {
          error:
            refreshData.error_description ||
            refreshData.error ||
            "Failed to get long-lived access token",
        },
        { status: 400 }
      );
    }

    // Use the long-lived access token
    const longLivedAccessToken = refreshData.access_token;
    const newRefreshToken = refreshData.refresh_token; // X provides a new refresh token

    // Fetch user profile with long-lived token
    const userRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${longLivedAccessToken}`,
      },
    });

    const userData = await userRes.json();

    if (!userRes.ok) {
      console.error("User profile fetch failed:", userData);
      return NextResponse.json(
        { error: userData.error || "Failed to get user profile" },
        { status: 400 }
      );
    }

    // Clean up cookies
    const response = NextResponse.json({
      access_token: longLivedAccessToken,
      refresh_token: newRefreshToken,
      expires_in: refreshData.expires_in,
      organizations: [], // X doesn't have organizations like LinkedIn
      user: {
        id: userData.data.id,
        name: userData.data.name,
        username: userData.data.username,
      },
    });

    // Clear the temporary cookies
    response.cookies.set("xState", "", { expires: new Date(0) });
    response.cookies.set("xCodeVerifier", "", { expires: new Date(0) });

    return response;
  } catch (error: any) {
    console.error("Error in X connect:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
