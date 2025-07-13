import { NextResponse } from "next/server";

const CLIENT_ID = process.env.X_CLIENT_ID!;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET!;

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Exchange refresh token for new access token
    const refreshParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
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
            "Failed to refresh access token",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      access_token: refreshData.access_token,
      refresh_token: refreshData.refresh_token, // X provides a new refresh token
      expires_in: refreshData.expires_in,
      token_expiry: new Date(
        Date.now() + refreshData.expires_in * 1000
      ).toISOString(),
    });
  } catch (error: any) {
    console.error("Error refreshing X token:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
