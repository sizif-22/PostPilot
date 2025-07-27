import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { Channel, Post } from "@/interfaces/Channel";
import { PostOnInstagram } from "../functions/instagram";
import { PostOnFacebook } from "../functions/facebook";
import { PostOnX } from "../functions/x";
import { decrypt, isValidEncryptedFormat } from "@/utils/encryption";
import { PostOnTiktok } from "../functions/tiktok";

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
                if (!channel.socialMedia?.facebook?.accessToken)
                  throw new Error("Facebook access_token not found");
                await PostOnFacebook({
                  accessToken: await decrypt(
                    channel.socialMedia?.facebook?.accessToken
                  ),
                  pageId: channel.socialMedia?.facebook?.id,
                  imageUrls: post.imageUrls,
                  message: post.message,
                  facebookVideoType: post.facebookVideoType as "default" | "reel" | undefined,
                });

                return {
                  platform: "facebook",
                  success: true,
                };
              } catch (error) {
                console.error("Error posting to Facebook:", error);
                return {
                  platform: "facebook",
                  success: false,
                  message:
                    error instanceof Error ? error.message : "Error occurred",
                };
              }
            }
            case "instagram": {
              try {
                const instagramAccessToken =
                  channel.socialMedia?.instagram?.pageAccessToken;
                if (!instagramAccessToken || !post.imageUrls) {
                  throw new Error(
                    "Instagram access token or image URLs missing"
                  );
                }
                if (!channel.socialMedia?.instagram?.instagramId)
                  throw new Error("Instagram access_token not found.");
                const result = await PostOnInstagram({
                  accessToken: await decrypt(
                    channel.socialMedia.instagram.pageAccessToken
                  ),
                  pageId: channel.socialMedia?.instagram?.instagramId,
                  message: post.message,
                  imageUrls: post.imageUrls,
                });

                return {
                  platform: "instagram",
                  success: true,
                  result,
                };
              } catch (error) {
                console.error("Error posting to Instagram:", error);
                return {
                  platform: "instagram",
                  success: false,
                  message:
                    error instanceof Error ? error.message : "Error occurred",
                };
              }
            }
            case "tiktok": {
              try {
                if (
                  !channel.socialMedia?.tiktok?.accessToken ||
                  !post.imageUrls ||
                  !channel.socialMedia.tiktok.openId
                ) {
                  throw new Error(
                    "Tiktok access token, image or openId URLs missing"
                  );
                }
                const result = await PostOnTiktok({
                  accessToken: channel.socialMedia.tiktok.accessToken,
                  openId: channel.socialMedia.tiktok.openId,
                  message: post.message,
                  imageUrls: post.imageUrls,
                });

                return {
                  platform: "Tiktok",
                  success: true,
                  result,
                };
              } catch (error) {
                console.error("Error posting to Tiktok:", error);
                return {
                  platform: "Tiktok",
                  success: false,
                  message:
                    error instanceof Error ? error.message : "Error occurred",
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
            case "x": {
              try {
                const xAccessToken = channel.socialMedia?.x?.accessToken;
                if (!xAccessToken) {
                  throw new Error("X access token is undefined");
                }

                // Validate encrypted token format
                if (!isValidEncryptedFormat(xAccessToken)) {
                  throw new Error(
                    "X access token is not in valid encrypted format"
                  );
                }

                let decryptedAccessToken: string;
                try {
                  decryptedAccessToken = await decrypt(xAccessToken);
                } catch (decryptError) {
                  console.error(
                    "Failed to decrypt X access token:",
                    decryptError
                  );
                  throw new Error(
                    `Token decryption failed: ${
                      decryptError instanceof Error
                        ? decryptError.message
                        : String(decryptError)
                    }`
                  );
                }
                if (!channel.socialMedia || !channel || !channel.socialMedia.x)
                  throw new Error("L2");
                const result = await PostOnX({
                  accessToken: decryptedAccessToken,
                  pageId: channel.socialMedia?.x?.userId || "", // X doesn't use pageId but kept for interface compatibility
                  message: post.message,
                  imageUrls: post.imageUrls,
                  ...(channel.socialMedia.x.refreshToken &&
                  channel.socialMedia.x.tokenExpiry
                    ? {
                        refreshToken: channel.socialMedia.x.refreshToken,
                        tokenExpiry: channel.socialMedia.x.tokenExpiry,
                      }
                    : {}),
                });

                console.log("Post Published successfully on X.");
                return {
                  platform: "x",
                  success: true,
                  result,
                  message: "Published successfully",
                };
              } catch (error) {
                console.error("Error posting to X:", error);
                return {
                  platform: "x",
                  success: false,
                  message:
                    error instanceof Error ? error.message : "Error occurred",
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
      .filter(
        (r): r is { platform: string; success: true } =>
          !!r &&
          typeof r === "object" &&
          "success" in r &&
          r.success === true &&
          "platform" in r
      )
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
