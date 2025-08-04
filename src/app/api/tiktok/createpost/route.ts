import { NextResponse } from "next/server";
import { MediaItem } from "@/interfaces/Media";

export async function POST(request: Request) {
  try {
    const {
      accessToken,
      openId,
      message,
      media,
    }: {
      accessToken: string;
      openId: string;
      message: string;
      media: MediaItem[];
    } = await request.json();

    // Validate required parameters
    if (!accessToken || !openId) {
      return NextResponse.json(
        { error: "TikTok accessToken and openId are required" },
        { status: 400 }
      );
    }

    if (!message && (!media || media.length === 0)) {
      return NextResponse.json(
        { error: "Message or media is required for TikTok post" },
        { status: 400 }
      );
    }

    // Simulate TikTok post (replace with real TikTok API integration)
    // TikTok's API for posting is more complex and may require video upload endpoints, etc.
    // For now, just return a simulated success response
    return NextResponse.json({
      success: true,
      message: "Post published to TikTok (simulated)",
      tiktok: {
        openId,
        message,
        media,
      },
    });
  } catch (error: any) {
    console.error("TikTok API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 