import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { Channel, Post } from "@/interfaces/Channel";

export async function POST(request: Request) {
  try {
    const { channelId, postId }: { channelId: string; postId: string } =
      await request.json();

    console.log("Processing post:", { channelId, postId });

    const channel: Channel | undefined = (
      await fs.getDoc(fs.doc(db, "Channels", channelId))
    ).data() as Channel;

    if (!channel) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 400 }
      );
    }

    // Add the id field to the channel object since Firestore doesn't include it by default
    channel.id = channelId;

    console.log("Channel found:", channel.id);

    const post: Post = channel.posts[postId];

    if (!post) {
      return NextResponse.json(
        { message: "Post Not found or has been deleted" },
        { status: 400 }
      );
    }

    console.log("Post found:", {
      postId,
      platforms: post.platforms,
      imageUrls: post.imageUrls?.length,
      message: post.message?.substring(0, 50) + "...",
    });

    // Validate platforms array
    if (
      !post.platforms ||
      !Array.isArray(post.platforms) ||
      post.platforms.length === 0
    ) {
      return NextResponse.json(
        { message: "No platforms specified for this post" },
        { status: 400 }
      );
    }

    // Validate imageUrls if present
    if (
      post.imageUrls &&
      (!Array.isArray(post.imageUrls) ||
        post.imageUrls.some(
          (url) => !url || typeof url !== "object" || !url.url
        ))
    ) {
      console.error("Invalid imageUrls:", post.imageUrls);
      return NextResponse.json(
        { message: "Invalid image URLs in post" },
        { status: 400 }
      );
    }

    const platformPromises = post.platforms
      .filter((platform) => platform && typeof platform === "string") // Filter out invalid platforms
      .map(async (platform) => {
        console.log("Processing platform:", platform);

        try {
          switch (platform) {
            case "facebook": {
              try {
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

                const success = response.ok;
                console.log(
                  success
                    ? "Post Published successfully on Facebook."
                    : "Post didn't get published on Facebook"
                );

                return {
                  platform: "facebook",
                  success,
                  message: success
                    ? "Published successfully"
                    : "Failed to publish",
                };
              } catch (error) {
                console.error("Error posting to Facebook:", error);
                return {
                  platform: "facebook",
                  success: false,
                  message: "Error occurred",
                };
              }
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
                      accessToken:
                        channel.socialMedia?.instagram?.pageAccessToken,
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
                  message: success
                    ? "Published successfully"
                    : "Failed to publish",
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
                  message: success
                    ? "Published successfully"
                    : "Failed to publish",
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
            case "linkedin": {
              try {
                const response = await fetch(
                  `https://postpilot-22.vercel.app/api/linkedin/createpost`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      postId: postId,
                      channelId: channelId,
                    }),
                  }
                );

                const success = response.ok;
                console.log(
                  success
                    ? "Post Published successfully on LinkedIn."
                    : "Post didn't get published on LinkedIn"
                );

                return {
                  platform: "linkedin",
                  success,
                  message: success
                    ? "Published successfully"
                    : "Failed to publish",
                };
              } catch (error) {
                console.error("Error posting to LinkedIn:", error);
                return {
                  platform: "linkedin",
                  success: false,
                  message: "Error occurred",
                };
              }
            }
            default:
              return { platform, success: false, message: "Unknown platform" };
          }
        } catch (platformError) {
          console.error(
            `Error processing platform ${platform}:`,
            platformError
          );
          return {
            platform,
            success: false,
            message: `Error processing platform: ${
              platformError instanceof Error
                ? platformError.message
                : "Unknown error"
            }`,
          };
        }
      });

    console.log(
      "Starting Promise.all with",
      platformPromises.length,
      "promises"
    );

    const results = await Promise.all(platformPromises);

    console.log("Promise.all completed, results:", results);

    // Validate results and filter out any invalid ones
    const validResults = results.filter(
      (result) =>
        result &&
        typeof result === "object" &&
        "platform" in result &&
        "success" in result
    );

    const successfulPlatforms = validResults
      .filter((r) => r.success)
      .map((r) => r.platform);

    console.log("posted");
    await fs.updateDoc(fs.doc(db, "Channels", channel.id), {
      [`posts.${postId}.published`]: true,
    });

    return NextResponse.json(
      {
        message: "Post published successfully.",
        results: validResults,
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
