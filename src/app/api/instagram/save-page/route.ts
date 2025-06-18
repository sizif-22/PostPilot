import { NextResponse } from "next/server";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function POST(request: Request) {
  try {
    const { channelId, instagramData } = await request.json();

    if (!channelId || !instagramData) {
      return NextResponse.json(
        { error: "Channel ID and Instagram data are required" },
        { status: 400 }
      );
    }

    // Update the channel with Instagram data
    const channelRef = doc(db, "channels", channelId);

    await updateDoc(channelRef, {
      "socialMedia.instagram": {
        pageId: instagramData.pageId,
        pageName: instagramData.pageName,
        pageAccessToken: instagramData.pageAccessToken,
        instagramId: instagramData.instagramId,
        instagramUsername: instagramData.instagramUsername,
        instagramName: instagramData.instagramName,
        profilePictureUrl: instagramData.profilePictureUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Instagram page saved successfully",
    });
  } catch (error: unknown) {
    console.error("Error saving Instagram page:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
