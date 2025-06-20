import { MediaItem } from "@/interfaces/Media";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      accessToken,
      pageId,
      message,
      scheduledDate,
      published,
      imageUrls,
      clientTimeZone,
    }: {
      imageUrls: MediaItem[];
      accessToken: any;
      pageId: any;
      message: any;
      scheduledDate: any;
      published: any;
      clientTimeZone: any;
    } = await request.json();

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
    if (imageUrls && imageUrls.length > 0) {
      const hasVideos = imageUrls.some((item) => item.isVideo);
      const hasImages = imageUrls.some((item) => !item.isVideo);
      const videoCount = imageUrls.filter((item) => item.isVideo).length;

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
      scheduled_publish_time?: number;
      published: boolean;
      message: string;
      caption?: string;
      access_token: string;
      url?: string;
      attached_media?: {
        media_fbid: string;
      }[];
      media_fbid?: string;
    }

    let finalScheduledTimestamp: number | undefined;

    if (scheduledDate && clientTimeZone) {
      finalScheduledTimestamp = scheduledDate;
    }

    const time = finalScheduledTimestamp
      ? {
          scheduled_publish_time: finalScheduledTimestamp,
          published: false,
        }
      : {
          published: published ?? true,
        };

    // Validate scheduled time
    if (time.scheduled_publish_time) {
      const now = Math.floor(Date.now() / 1000);
      // Add a buffer of 180 seconds (3 minutes) to account for processing time and network latency
      const minScheduledTime = now + 10 * 60 + 3 * 60; // 10 minutes + 3 minute buffer

      if (time.scheduled_publish_time < minScheduledTime) {
        return NextResponse.json(
          {
            error:
              "Scheduled time must be at least 13 minutes in the future (to account for processing time and network delays)",
          },
          { status: 400 }
        );
      }
    }

    const postData: PData = {
      ...time,
      message,
      access_token: pageAccessToken, // Use page token instead of user token
    };

    // Initialize attached_media array if we have multiple images
    if (imageUrls && imageUrls.length > 1) {
      postData.attached_media = [];
    }

    if (imageUrls && imageUrls.length === 1) {
      if (imageUrls[0].isVideo) {
        // Share video
        const videoData: any = {
          file_url: imageUrls[0].url,
          description: message,
          access_token: pageAccessToken, // Use page token
        };

        // Add scheduling info for video if needed
        if (time.scheduled_publish_time) {
          videoData.scheduled_publish_time = time.scheduled_publish_time;
          videoData.published = false;
        } else {
          videoData.published = published ?? true;
        }

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
        postData.url = imageUrls[0].url;
        postData.caption = message;

        const photoData: any = {
          url: postData.url,
          caption: postData.caption,
          access_token: postData.access_token,
        };

        // Add scheduling info for single photo if needed
        if (time.scheduled_publish_time) {
          photoData.scheduled_publish_time = time.scheduled_publish_time;
          photoData.published = false;
        } else {
          photoData.published = postData.published;
        }

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
    } else if (imageUrls && imageUrls.length > 1) {
      // Multiple images post
      for (const item of imageUrls) {
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

      // Add scheduling info
      if (time.scheduled_publish_time) {
        feedData.scheduled_publish_time = time.scheduled_publish_time;
        feedData.published = "false";
      } else {
        feedData.published = postData.published.toString();
      }

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

      // Add scheduling info
      if (time.scheduled_publish_time) {
        feedData.scheduled_publish_time = time.scheduled_publish_time;
        feedData.published = "false";
      } else {
        feedData.published = (postData.published ?? true).toString();
      }

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
