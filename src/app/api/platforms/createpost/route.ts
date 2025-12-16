import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { Channel, Post } from "@/interfaces/Channel";
import { PostOnInstagram } from "../functions/instagram";
import { PostOnFacebook } from "../functions/facebook";
import { PostOnX } from "../functions/x";
import { PostOnLinkedIn } from "../functions/linkedin";
import { decrypt, isValidEncryptedFormat, encrypt } from "@/utils/encryption";
import { PostOnTiktok } from "../functions/tiktok";
import { PostOnYouTube } from "../functions/youtube";
import { PostInstagramStory, PostFacebookStory } from "../functions/story";
import { transporter } from "../../../../utils/smtp.config";

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
        { status: 400 },
      );
    }

    // Add the id field to the channel object since Firestore doesn't include it by default
    channel.id = channelId;

    console.log("Channel found:", channel.id);

    const post: Post = channel.posts[postId];

    if (!post) {
      return NextResponse.json(
        { message: "Post Not found or has been deleted" },
        { status: 400 },
      );
    }

    console.log("Post found:", {
      postId,
      platforms: post.platforms,
      media: post.media?.length,
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
        { status: 400 },
      );
    }

    // Validate media if present
    if (
      post.media &&
      (!Array.isArray(post.media) ||
        post.media.some((url) => !url || typeof url !== "object" || !url.url))
    ) {
      console.error("Invalid media:", post.media);
      return NextResponse.json(
        { message: "Invalid image URLs in post" },
        { status: 400 },
      );
    }

    // Platform-specific validation
    const validationErrors: string[] = [];

    post.platforms.forEach((platform) => {
      if (!platform || typeof platform !== "string") return;

      switch (platform) {
        case "youtube":
          // YouTube: Requires Video + Title
          const hasVideo = post.media?.some(
            (m) => m.contentType?.startsWith("video/") || m.isVideo
          );
          if (!hasVideo) {
            validationErrors.push("YouTube requires at least one video file.");
          }
          if (!post.youtubeTitle && !post.title) {
            validationErrors.push("YouTube requires a title.");
          }
          break;

        case "instagram":
          // Instagram: Requires Media
          if (!post.media || post.media.length === 0) {
            validationErrors.push("Instagram requires at least one image or video.");
          }
          break;

        case "tiktok":
          // TikTok: Requires Media (Video or Image)
          const hasTiktokMedia = post.media && post.media.length > 0;
          if (!hasTiktokMedia) {
            validationErrors.push("TikTok requires at least one video or image file.");
          }
          break;

        case "facebook":
        case "linkedin":
        case "x":
          // FB/LinkedIn/X: Requires Text OR Media
          const hasText = post.message || post[`${platform}Text` as keyof Post];
          const hasMedia = post.media && post.media.length > 0;

          if (!hasText && !hasMedia) {
            validationErrors.push(
              `${platform.charAt(0).toUpperCase() + platform.slice(1)} requires either text or media.`
            );
          }
          break;
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { message: "Validation failed", errors: validationErrors },
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

                const facebookAccessToken = await decrypt(
                  channel.socialMedia?.facebook?.accessToken,
                );

                // Check if this is a Story post
                if (post.postType === "story") {
                  await PostFacebookStory({
                    accessToken: facebookAccessToken,
                    pageId: channel.socialMedia?.facebook?.id,
                    media: post.media || [],
                  });
                } else {
                  await PostOnFacebook({
                    accessToken: facebookAccessToken,
                    pageId: channel.socialMedia?.facebook?.id,
                    media: post.media,
                    message: post.facebookText || post.message,
                    facebookVideoType: post.facebookVideoType as
                      | "default"
                      | "reel"
                      | undefined,
                  });
                }

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
                if (!instagramAccessToken || !post.media) {
                  throw new Error(
                    "Instagram access token or image URLs missing",
                  );
                }
                if (!channel.socialMedia?.instagram?.instagramId)
                  throw new Error("Instagram access_token not found.");

                const decryptedToken = await decrypt(
                  channel.socialMedia.instagram.pageAccessToken,
                );

                let result;
                // Check if this is a Story post
                if (post.postType === "story") {
                  result = await PostInstagramStory({
                    accessToken: decryptedToken,
                    pageId: channel.socialMedia?.instagram?.instagramId,
                    media: post.media,
                  });
                } else {
                  result = await PostOnInstagram({
                    accessToken: decryptedToken,
                    pageId: channel.socialMedia?.instagram?.instagramId,
                    message: post.instagramText || post.message,
                    media: post.media,
                  });
                }

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
                  !post.media ||
                  !channel.socialMedia.tiktok.openId
                ) {
                  throw new Error(
                    "Tiktok access token, image or openId URLs missing",
                  );
                }
                const result = await PostOnTiktok({
                  accessToken: await decrypt(
                    channel.socialMedia.tiktok.accessToken,
                  ),
                  openId: channel.socialMedia.tiktok.openId,
                  message: post.message,
                  media: post.media,
                  title: post.title,
                  description: post.tiktokDescription,
                  privacy_level: post.tiktokPrivacy,
                  disable_comment: !post.tiktokAllowComment, // API expects disable_*, UI has Allow *
                  disable_duet: !post.tiktokAllowDuet,
                  disable_stitch: !post.tiktokAllowStitch,
                  brand_content_toggle: post.tiktokCommercialContent,
                  brand_organic_toggle: post.tiktokBrandOrganic,
                  branded_content_toggle: post.tiktokBrandedContent,
                  // channelId: channel.id,
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
                if (!channel.socialMedia?.linkedin?.accessToken)
                  throw new Error("LinkedIn access token not found");
                if (!channel.socialMedia?.linkedin?.accountId)
                  throw new Error("LinkedIn person ID not found");

                let decryptedAccessToken: string;
                const linkedinToken = channel.socialMedia.linkedin.accessToken;

                // Check if the token is in the expected encrypted format
                if (isValidEncryptedFormat(linkedinToken)) {
                  // Token is properly encrypted, decrypt it
                  console.log(
                    "LinkedIn token is in encrypted format, decrypting...",
                  );
                  decryptedAccessToken = await decrypt(linkedinToken);
                } else {
                  // Token is not in the expected format - treat as plain token
                  console.log(
                    "LinkedIn token is not in expected encrypted format, treating as plain token",
                  );

                  // Check if it looks like a valid LinkedIn access token
                  if (
                    linkedinToken.length > 50 &&
                    /^[A-Za-z0-9+/=_-]+$/.test(linkedinToken)
                  ) {
                    decryptedAccessToken = linkedinToken;
                    console.log(
                      "Using LinkedIn token as-is (appears to be plain access token)",
                    );
                  } else {
                    throw new Error(
                      "LinkedIn access token format is not recognized - please reconnect your LinkedIn account",
                    );
                  }
                }

                const result = await PostOnLinkedIn({
                  accessToken: decryptedAccessToken,
                  author: channel.socialMedia.linkedin.accountId,
                  message: (post.linkedinText || post.message) as string,
                  media: post.media || [],
                  accountType: channel.socialMedia.linkedin
                    .accountType as string, // Pass account type
                  urn: channel.socialMedia.linkedin.urn as string, // Pass URN for organizations
                });

                console.log("Post Published successfully on LinkedIn.");
                return {
                  platform: "linkedin",
                  success: true,
                  result,
                  message: "Published successfully",
                };
              } catch (error) {
                console.error("Error posting to LinkedIn:", error);
                return {
                  platform: "linkedin",
                  success: false,
                  message:
                    error instanceof Error ? error.message : "Error occurred",
                };
              }
            }
            case "x": {
              try {
                const xSocialMedia = channel.socialMedia?.x;
                if (
                  !xSocialMedia?.accessToken ||
                  !xSocialMedia.refreshToken ||
                  !xSocialMedia.tokenExpiry
                ) {
                  throw new Error(
                    "X credentials (accessToken, refreshToken, tokenExpiry) are missing.",
                  );
                }

                if (!isValidEncryptedFormat(xSocialMedia.accessToken)) {
                  throw new Error(
                    "X access token is not in a valid encrypted format.",
                  );
                }

                const decryptedAccessToken = await decrypt(
                  xSocialMedia.accessToken,
                );

                const decryptedV1aAccessToken = xSocialMedia.v1aAccessToken
                  ? await decrypt(xSocialMedia.v1aAccessToken)
                  : undefined;
                const decryptedV1aAccessSecret = xSocialMedia.v1aAccessSecret
                  ? await decrypt(xSocialMedia.v1aAccessSecret)
                  : undefined;

                const result = await PostOnX({
                  accessToken: decryptedAccessToken,
                  refreshToken: xSocialMedia.refreshToken,
                  tokenExpiry: xSocialMedia.tokenExpiry,
                  message: post.message,
                  media: post.media,
                  xText: post.xText,
                  pageId: "", // Not used for X
                  v1aAccessToken: decryptedV1aAccessToken,
                  v1aAccessSecret: decryptedV1aAccessSecret,
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
            case "youtube": {
              try {
                if (!channel.socialMedia?.youtube?.accessToken)
                  throw new Error("YouTube access_token not found");

                // We need to handle the case where the token might be expired
                let accessToken = await decrypt(
                  channel.socialMedia.youtube.accessToken,
                );

                // Check if we have refresh token and if access token is expired
                if (
                  channel.socialMedia.youtube.refreshToken &&
                  channel.socialMedia.youtube.tokenExpiry
                ) {
                  const expiryDate = new Date(
                    channel.socialMedia.youtube.tokenExpiry,
                  );
                  const now = new Date();

                  if (now >= expiryDate) {
                    // Token is expired, refresh it
                    const refreshResponse = await fetch(
                      "/api/youtube/refresh",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          refreshToken: await decrypt(
                            channel.socialMedia.youtube.refreshToken,
                          ),
                        }),
                      },
                    );

                    if (refreshResponse.ok) {
                      const newTokenData = await refreshResponse.json();
                      accessToken = newTokenData.accessToken;

                      // Update the channel with new tokens
                      await fs.updateDoc(fs.doc(db, "Channels", channel.id), {
                        "socialMedia.youtube.accessToken": await encrypt(
                          newTokenData.accessToken,
                        ),
                        "socialMedia.youtube.tokenExpiry":
                          newTokenData.tokenExpiry,
                      });
                    } else {
                      console.error("Failed to refresh YouTube token");
                      throw new Error("YouTube token refresh failed");
                    }
                  }
                }

                const result = await PostOnYouTube({
                  accessToken: accessToken,
                  title: post.youtubeTitle || post.title || "Untitled Video",
                  description: post.youtubeDisc || post.message || "",
                  tags: post.youtubeTags || [], // Support tags if available
                  privacy: (post.youtubePrivacy as "public" | "private" | "unlisted") || "public",
                  media: post.media || [],
                  scheduleTime:
                    post.isScheduled && post.date
                      ? new Date(post.date.toDate()).toISOString()
                      : undefined,
                });

                return {
                  platform: "youtube",
                  success: true,
                  result,
                };
              } catch (error) {
                console.error("Error posting to YouTube:", error);
                return {
                  platform: "youtube",
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
            platformError,
          );
          return {
            platform,
            success: false,
            message: `Error processing platform: ${platformError instanceof Error
              ? platformError.message
              : "Unknown error"
              }`,
          };
        }
      });

    console.log(
      "Starting Promise.all with",
      platformPromises.length,
      "promises",
    );

    const results = await Promise.all(platformPromises);

    console.log("Promise.all completed, results:", results);

    // Validate results and filter out any invalid ones
    const validResults = results.filter(
      (result) =>
        result &&
        typeof result === "object" &&
        "platform" in result &&
        "success" in result,
    );

    const successfulPlatforms = validResults
      .filter(
        (r): r is { platform: string; success: true } =>
          !!r &&
          typeof r === "object" &&
          "success" in r &&
          r.success === true &&
          "platform" in r,
      )
      .map((r) => r.platform);

    console.log("posted");
    await fs.updateDoc(fs.doc(db, "Channels", channel.id), {
      [`posts.${postId}.published`]: true,
    });

    if (channel.TeamMembers[0]) {
      const user = channel.TeamMembers[0];

      if (user) {
        const successfulPlatforms = validResults.filter((r) => r.success);
        const failedPlatforms = validResults.filter((r) => !r.success);

        let emailBody = `Hi ${user.name},<br><br>Here is the summary of your recent post publication:<br><br>`;

        if (successfulPlatforms.length > 0) {
          emailBody += "<b>Successfully published on:</b><br>";
          successfulPlatforms.forEach((p) => {
            emailBody += `- ${p.platform}<br>`;
          });
          emailBody += "<br>";
        }

        if (failedPlatforms.length > 0) {
          emailBody += "<b>Failed to publish on:</b><br>";
          failedPlatforms.forEach((p) => {
            emailBody += `- ${p.platform}: ${p.message}<br>`;
          });
          emailBody += "<br>";
        }

        await transporter.sendMail({
          from: '"PostPilot" <postpilot@webbingstone.org>',
          to: user.email,
          subject: "Your Post Publication Summary",
          html: emailBody,
        });
      } else {
        console.error("Could not find user to send email to.");
      }
    } else {
      console.error("Collection owner is not defined.");
    }

    return NextResponse.json(
      {
        message: "Post published successfully.",
        results: validResults,
        successfulPlatforms,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error publishing posts:", error);
    return NextResponse.json(
      {
        message: "Error publishing posts",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
