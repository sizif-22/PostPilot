// Fixed route.ts - API handler
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.X_CLIENT_ID!;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET!;
const REDIRECT_URI = process.env.X_REDIRECT_URI!;

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

    // Check if we got a refresh token (required for token refresh later)
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

    // Use the access token directly (it's valid for 2 hours)
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Fetch user profile
    const userRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

    // Return the tokens and user data
    const response = NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: tokenData.expires_in, // 7200 seconds (2 hours)
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      organizations: [], 
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