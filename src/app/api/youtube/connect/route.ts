import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No authorization code provided" }, { status: 400 });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URL!,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error_description || "Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    // Get user's YouTube channel information using the access token
    const profileResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch YouTube channel information");
    }

    const profileData = await profileResponse.json();
    
    if (!profileData.items || profileData.items.length === 0) {
      throw new Error("No YouTube channel found for this account");
    }

    const channel = profileData.items[0];
    
    // Calculate token expiry time (usually 1 hour from now)
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokenData.expires_in);

    // Return the channel data along with the tokens
    const responseData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token, // This is only available on first authorization
      tokenExpiry: tokenExpiry.toISOString(),
      channel: {
        id: channel.id,
        name: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails?.default?.url,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        viewCount: channel.statistics.viewCount,
      },
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error in YouTube connect:", error);
    return NextResponse.json({ error: error.message || "An error occurred during YouTube connection" }, { status: 500 });
  }
}