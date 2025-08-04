import { MediaItem } from "@/interfaces/Media";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      accessToken,
      pageId,
      message,
      media,
      facebookVideoType,
    }: {
      media: MediaItem[];
      accessToken: any;
      pageId: any;
      message: any;
      facebookVideoType?: "default" | "reel";
    } = await request.json();
    facebookVideoType && console.log(facebookVideoType);
    // Validate required parameters
    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    if (!pageId || pageId === "0" || pageId === 0) {
      return NextResponse.json(
        { error: "Valid page ID is required" },
        { status: 400 }
      );
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Validate media types
    if (media && media.length > 0) {
      const hasVideos = media.some((item) => item.isVideo);
      const hasImages = media.some((item) => !item.isVideo);
      const videoCount = media.filter((item) => item.isVideo).length;

      // Check for mixed media
      if (hasVideos && hasImages) {
        return NextResponse.json(
          {
            error:
              "Cannot mix videos and images in the same post. Please select either all videos or all images.",
          },
          { status: 400 }
        );
      }

      // Check for multiple videos
      if (videoCount > 1) {
        return NextResponse.json(
          {
            error:
              "Cannot post multiple videos at once. Please select only one video.",
          },
          { status: 400 }
        );
      }
    }

    // Get the proper page access token (if not already a page token)
    let pageAccessToken = accessToken;

    try {
      // Check if this is a user token and get the page token
      const pageTokenResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=access_token,name&access_token=${accessToken}`
      );
      const pageTokenData = await pageTokenResponse.json();

      if (pageTokenData.access_token) {
        pageAccessToken = pageTokenData.access_token;
        console.log("Using page access token for:", pageTokenData.name);
      } else {
        console.log(
          "Using provided token (assuming it's already a page token)"
        );
      }
    } catch (tokenError) {
      console.warn(
        "Could not get page token, using provided token:",
        tokenError
      );
    }

    interface PData {
      message: string;
      caption?: string;
      access_token: string;
      url?: string;
      attached_media?: {
        media_fbid: string;
      }[];
      media_fbid?: string;
    }

    const postData: PData = {
      message,
      access_token: pageAccessToken, // Use page token instead of user token
    };

    // Initialize attached_media array if we have multiple images
    if (media && media.length > 1) {
      postData.attached_media = [];
    }

    if (media && media.length === 1) {
      if (media[0].isVideo) {
        // --- REEL LOGIC ---
        if (facebookVideoType === "reel") {
          // Step 1: Initialize upload session
          const initRes = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                upload_phase: "start",
                access_token: pageAccessToken,
              }),
            }
          );
          const initData = await initRes.json();
          if (!initRes.ok) {
            throw new Error(
              initData.error?.message || "Failed to initialize reel upload"
            );
          }
          const { video_id, upload_url } = initData;

          // Step 2: Upload the video (hosted file)
          const uploadRes = await fetch(upload_url, {
            method: "POST",
            headers: {
              Authorization: `OAuth ${pageAccessToken}`,
              file_url: media[0].url,
            },
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok || !uploadData.success) {
            throw new Error(
              uploadData.error?.message || "Failed to upload reel video"
            );
          }

          // Step 3: Publish the reel
          const publishRes = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                access_token: pageAccessToken,
                video_id,
                upload_phase: "finish",
                video_state: "PUBLISHED",
                description: message,
              }),
            }
          );
          const publishData = await publishRes.json();
          if (!publishRes.ok) {
            throw new Error(
              publishData.error?.message || "Failed to publish reel"
            );
          }
          return NextResponse.json(publishData);
        }
        // --- END REEL LOGIC ---
        // --- DEFAULT VIDEO LOGIC (existing) ---
        const videoData: any = {
          file_url: media[0].url,
          description: message,
          access_token: pageAccessToken, // Use page token
        };
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}/videos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(
              Object.entries(videoData)
                .filter(([_, value]) => value !== undefined && value !== null)
                .reduce(
                  (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
                  {}
                )
            ),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          console.error("Facebook Video API Error:", data);
          throw new Error(data.error?.message || "Failed to upload video");
        }
        return NextResponse.json(data);
      } else {
        // Single image post
        postData.url = media[0].url;
        postData.caption = message;

        const photoData: any = {
          url: postData.url,
          caption: postData.caption,
          access_token: postData.access_token,
        };

        const response = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}/photos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(
              Object.entries(photoData)
                .filter(([_, value]) => value !== undefined && value !== null)
                .reduce(
                  (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
                  {}
                )
            ),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          console.error("Facebook Photo API Error:", data);
          throw new Error(data.error?.message || "Failed to create post");
        }

        return NextResponse.json(data);
      }
    } else if (media && media.length > 1) {
      // Multiple images post
      for (const item of media) {
        if (item.isVideo) {
          const videoParams = {
            file_url: item.url,
            published: "false",
            access_token: pageAccessToken, // Use page token
          };

          const response = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}/videos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams(videoParams),
            }
          );

          const data = await response.json();
          if (!response.ok) {
            console.error("Facebook Video Upload Error:", data);
            throw new Error(data.error?.message || "Failed to upload video");
          }

          postData.attached_media!.push({
            media_fbid: data.id,
          });
        } else {
          const photoParams = {
            url: item.url,
            published: "false",
            access_token: pageAccessToken, // Use page token
          };

          const response = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}/photos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams(photoParams),
            }
          );

          const data = await response.json();
          if (!response.ok) {
            console.error("Facebook Photo Upload Error:", data);
            throw new Error(data.error?.message || "Failed to upload image");
          }

          postData.attached_media!.push({
            media_fbid: data.id,
          });
        }
      }

      // Create the multi-image post
      const feedData: any = {
        message: postData.message,
        access_token: postData.access_token,
        attached_media: JSON.stringify(postData.attached_media),
      };

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(
            Object.entries(feedData)
              .filter(([_, value]) => value !== undefined && value !== null)
              .reduce(
                (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
                {}
              )
          ),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Facebook Feed API Error:", data);
        throw new Error(data.error?.message || "Failed to create post");
      }

      return NextResponse.json(data);
    } else {
      // Text-only post
      const feedData: any = {
        message: postData.message,
        access_token: postData.access_token,
      };

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(
            Object.entries(feedData)
              .filter(([_, value]) => value !== undefined && value !== null)
              .reduce(
                (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
                {}
              )
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Facebook Feed API Error:", data);
        throw new Error(data.error?.message || "Failed to create post");
      }

      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error("Facebook API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
