import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { Channel } from "@/interfaces/Channel";
import { NextResponse } from "next/server";
import { decrypt, encrypt } from "@/utils/encryption";

const CLIENT_ID = process.env.X_CLIENT_ID!;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET!;

export async function POST(request: Request) {
  try {
    const { channelId } = await request.json();

    const channel: Channel | undefined = (
      await fs.getDoc(fs.doc(db, "Channels", channelId))
    ).data() as Channel;

    if (channel == undefined) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 400 }
      );
    }

    const encryptedRefreshToken = channel.socialMedia?.x?.refreshToken;
    if (!encryptedRefreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    const refreshToken: string = await decrypt(encryptedRefreshToken);

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

    // Use the existing profile data from channel.socialMedia.x
    const currentX = channel.socialMedia?.x;
    if (!currentX) {
      return NextResponse.json(
        { error: "X profile not found in channel" },
        { status: 400 }
      );
    }

    // Encrypt new tokens
    const encryptedAccessToken: string = await encrypt(refreshData.access_token);
    const encryptedRefreshTokenValue: string = await encrypt(refreshData.refresh_token);

    // Prepare updated socialMedia.x object
    const updatedSocialMediaX = {
      ...currentX,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshTokenValue,
      expiresIn: refreshData.expires_in,
      tokenExpiry: refreshData.expires_in
        ? new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
        : null,
    };

    // Update Firestore with new tokens
    await fs.updateDoc(fs.doc(db, "Channels", channelId as string), {
      "socialMedia.x": updatedSocialMediaX,
    });


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
