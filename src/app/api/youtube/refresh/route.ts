import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
    }

    // Use refresh token to get a new access token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error refreshing YouTube token:", errorData);
      return NextResponse.json({ error: errorData.error_description || "Failed to refresh token" }, { status: 500 });
    }

    const tokenData = await response.json();

    // Calculate token expiry time (usually 1 hour from now)
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokenData.expires_in);

    return NextResponse.json({
      accessToken: tokenData.access_token,
      refreshToken: refreshToken, // Return the same refresh token as it doesn't change
      tokenExpiry: tokenExpiry.toISOString(),
    });
  } catch (error: any) {
    console.error("Error in YouTube refresh token:", error);
    return NextResponse.json({ error: error.message || "An error occurred during token refresh" }, { status: 500 });
  }
}