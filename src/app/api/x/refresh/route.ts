import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { Channel } from "@/interfaces/Channel";
import { NextResponse } from "next/server";
import { decrypt, encrypt } from "@/utils/encryption";
import axios from "axios";

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
        { status: 400 },
      );
    }

    await Promise.all([
      refreshYoutube(channel, channelId),
      refreshX(channel, channelId),
      refreshTiktok(channel),
    ]);

    return NextResponse.json({ message: "Token refreshed" });
  } catch (error: any) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

const refreshX = async (channel: Channel, channelIdParam?: string) => {
  if (!channel.socialMedia?.x) {
    return NextResponse.json(
      { error: "X profile not found in channel" },
      { status: 400 },
    );
  }
  const encryptedRefreshToken = channel.socialMedia?.x?.refreshToken;
  if (!encryptedRefreshToken) {
    return NextResponse.json(
      { error: "Refresh token is required" },
      { status: 400 },
    );
  }

  const refreshToken: string = await decrypt(encryptedRefreshToken);

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token is required" },
      { status: 400 },
    );
  }

  // Exchange refresh token for new access token
  const refreshParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });

  const refreshRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`,
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
      { status: 400 },
    );
  }

  // Use the existing profile data from channel.socialMedia.x
  const currentX = channel.socialMedia?.x;
  if (!currentX) {
    return NextResponse.json(
      { error: "X profile not found in channel" },
      { status: 400 },
    );
  }

  // Encrypt new tokens
  const encryptedAccessToken: string = await encrypt(refreshData.access_token);
  const encryptedRefreshTokenValue: string = await encrypt(
    refreshData.refresh_token,
  );

  // Prepare updated socialMedia.x object
  const updatedSocialMediaX = {
    ...currentX,
    accessToken: encryptedAccessToken,
    refreshToken: encryptedRefreshTokenValue,
    expiresIn: refreshData.expires_in,
    tokenExpiry: refreshData.expires_in
      ? new Date(Date.now() + refreshData.expires_in * 1000)
      : null,
  };

  // Update Firestore with new tokens
  const targetId = channelIdParam ?? channel.id;
  await fs.updateDoc(fs.doc(db, "Channels", targetId), {
    "socialMedia.x": updatedSocialMediaX,
  });
  return NextResponse.json({ message: "X token refreshed" });
};

const refreshTiktok = async (channel: Channel) => {
  if (!channel.socialMedia?.tiktok) {
    return NextResponse.json(
      { error: "Tiktok profile not found in channel" },
      { status: 400 },
    );
  }
  const encryptedRefreshToken = channel.socialMedia?.tiktok?.refreshToken;
  if (!encryptedRefreshToken) {
    return NextResponse.json(
      { error: "Refresh token is required" },
      { status: 400 },
    );
  }
  const refreshToken: string = await decrypt(encryptedRefreshToken);
  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token is required" },
      { status: 400 },
    );
  }
  const CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY!;

  // Exchange refresh token for new access token
  const refreshParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_key: CLIENT_KEY,
  });

  const refreshRes = await axios.post(
    "https://api.tiktok.com/oauth/refresh_token",
    refreshParams,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  const refreshData = refreshRes.data;

  if (refreshRes.status !== 200) {
    console.error("Refresh token exchange failed:", refreshData);
    return NextResponse.json(
      {
        error:
          refreshData.error_description ||
          refreshData.error ||
          "Failed to refresh access token",
      },
      { status: 400 },
    );
  }

  // Encrypt new tokens
  const encryptedAccessToken: string = await encrypt(refreshData.access_token);
  const encryptedRefreshTokenValue: string = await encrypt(
    refreshData.refresh_token,
  );

  // Prepare updated socialMedia.x object
  const updatedSocialMediaTiktok = {
    ...channel.socialMedia?.tiktok,
    accessToken: encryptedAccessToken,
    refreshToken: encryptedRefreshTokenValue,
    expiresIn: refreshData.expires_in,
    tokenExpiry: refreshData.expires_in
      ? new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
      : null,
  };

  // Update Firestore with new tokens
  await fs.updateDoc(fs.doc(db, "Channels", channel.id), {
    "socialMedia.tiktok": updatedSocialMediaTiktok,
  });
  return NextResponse.json({ message: "TikTok token refreshed" });
};

const refreshYoutube = async (channel: Channel, channelIdParam?: string) => {
  if (!channel.socialMedia?.youtube) {
    return NextResponse.json(
      { error: "Youtube profile not found in channel" },
      { status: 400 },
    );
  }

  const encryptedRefreshToken = channel.socialMedia?.youtube?.refreshToken;
  if (!encryptedRefreshToken) {
    return NextResponse.json(
      { error: "Refresh token is required" },
      { status: 400 },
    );
  }

  const refreshToken: string = await decrypt(encryptedRefreshToken);

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token is required" },
      { status: 400 },
    );
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

  // Exchange refresh token for new access token
  const refreshParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
  });

  const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
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
      { status: 400 },
    );
  }

  // Use the existing profile data from channel.socialMedia.youtube
  const currentYoutube = channel.socialMedia?.youtube;
  if (!currentYoutube) {
    return NextResponse.json(
      { error: "Youtube profile not found in channel" },
      { status: 400 },
    );
  }

  // Encrypt new tokens
  const encryptedAccessToken: string = await encrypt(refreshData.access_token);
  const encryptedRefreshTokenValue: string = await encrypt(refreshToken);

  // Prepare updated socialMedia.youtube object
  const updatedSocialMediaYoutube = {
    ...currentYoutube,
    accessToken: encryptedAccessToken,
    refreshToken: encryptedRefreshTokenValue,
    expiresIn: refreshData.expires_in,
    tokenExpiry: refreshData.expires_in
      ? new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
      : null,
  };

  // Update Firestore with new tokens
  const targetId = channelIdParam ?? channel.id;
  await fs.updateDoc(fs.doc(db, "Channels", targetId), {
    "socialMedia.youtube": updatedSocialMediaYoutube,
  });
  return NextResponse.json({ message: "YouTube token refreshed" });
}