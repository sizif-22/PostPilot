import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { Channel, Post } from "@/interfaces/Channel";

export async function POST(request: Request) {
  const { channelId, postId }: { channelId: string; postId: string } =
    await request.json();
  const channel: Channel | undefined = (
    await fs.getDoc(fs.doc(db, "Channels", channelId))
  ).data() as Channel;

  if (!channel) {
    return NextResponse.json({ message: "Channel not found" }, { status: 400 });
  }
  const post: Post = channel.posts[postId];

  if (!post) {
    return NextResponse.json(
      { message: "Post Not found or has been deleted" },
      { status: 400 }
    );
  }
  const platformPromises =
    post.platforms?.map(async (platform) => {
      switch (platform) {
        case "facebook": {
          const response = await fetch(
            "https://postpilot-22.vercel.app/api/facebook/createpost",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                accessToken: channel.socialMedia?.facebook?.accessToken,
                pageId: channel.socialMedia?.facebook?.id,
                imageUrls: post.imageUrls,
                message: post.message || post.content,
              }),
            }
          );
        }
        case "instagram": {
          try {
            const response = await fetch(
              `https://postpilot-22.vercel.app/api/instagram/createpost`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accessToken: channel.socialMedia?.instagram?.pageAccessToken,
                  pageId: channel.socialMedia?.instagram?.instagramId,
                  message: post.message || post.content,
                  imageUrls: post.imageUrls,
                }),
              }
            );

            const success = response.ok;
            console.log(
              success
                ? "Post Published successfully on Instagram."
                : "Post didn't get published on Instagram"
            );

            return {
              platform: "instagram",
              success,
              message: success ? "Published successfully" : "Failed to publish",
            };
          } catch (error) {
            console.error("Error posting to Instagram:", error);
            return {
              platform: "instagram",
              success: false,
              message: "Error occurred",
            };
          }
        }
        case "tiktok": {
          try {
            const response = await fetch(
              `https://postpilot-22.vercel.app/api/tiktok/createpost`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accessToken: channel.socialMedia?.tiktok?.accessToken,
                  openId: channel.socialMedia?.tiktok?.openId,
                  message: post.message || post.content,
                  imageUrls: post.imageUrls,
                }),
              }
            );

            const success = response.ok;
            console.log(
              success
                ? "Post Published successfully on TikTok."
                : "Post didn't get published on TikTok"
            );

            return {
              platform: "tiktok",
              success,
              message: success ? "Published successfully" : "Failed to publish",
            };
          } catch (error) {
            console.error("Error posting to TikTok:", error);
            return {
              platform: "tiktok",
              success: false,
              message: "Error occurred",
            };
          }
        }
        default:
          return { platform, success: false, message: "Unknown platform" };
      }
    }) || [];

  try {
    const results = await Promise.all(platformPromises);
    const successfulPlatforms = results
      .filter((r) => r.success)
      .map((r) => r.platform);

    return NextResponse.json(
      {
        message: "Post published successfully.",
        results,
        successfulPlatforms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error publishing posts:", error);
    return NextResponse.json(
      {
        message: "Error publishing posts",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
