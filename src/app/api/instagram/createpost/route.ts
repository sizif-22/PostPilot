import { MediaItem } from "@/interfaces/Media";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      pageAccessToken,
      instagramId,
      message,
      scheduledDate,
      published,
      imageUrls,
      clientTimeZone,
    }: {
      imageUrls: MediaItem[];
      pageAccessToken: any;
      instagramId: any;
      message: any;
      scheduledDate: any;
      published: any;
      clientTimeZone: any;
    } = await request.json();

    // Validate required parameters
    if (!pageAccessToken) {
      return NextResponse.json(
        { error: "Page access token is required" },
        { status: 400 }
      );
    }

    if (!instagramId) {
      return NextResponse.json(
        { error: "Instagram ID is required" },
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

    // Handle different media scenarios
    if (imageUrls && imageUrls.length === 1) {
      if (imageUrls[0].isVideo) {
        // Single video post
        const videoData: any = {
          media_type: "REELS",
          video_url: imageUrls[0].url,
          caption: message,
          access_token: pageAccessToken,
        };

        // Add scheduling info for video if needed
        if (time.scheduled_publish_time) {
          videoData.scheduled_publish_time = time.scheduled_publish_time;
          videoData.published = false;
        } else {
          videoData.published = published ?? true;
        }

        const response = await fetch(
          `https://graph.facebook.com/v19.0/${instagramId}/media`,
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
          console.error("Instagram Video API Error:", data);
          throw new Error(data.error?.message || "Failed to upload video");
        }

        // If not scheduled, publish immediately
        if (!time.scheduled_publish_time) {
          const publishResponse = await fetch(
            `https://graph.facebook.com/v19.0/${instagramId}/media_publish`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                creation_id: data.id,
                access_token: pageAccessToken,
              }),
            }
          );

          const publishData = await publishResponse.json();
          if (!publishResponse.ok) {
            console.error("Instagram Publish API Error:", publishData);
            throw new Error(
              publishData.error?.message || "Failed to publish video"
            );
          }

          return NextResponse.json(publishData);
        }

        return NextResponse.json(data);
      } else {
        // Single image post
        const imageData: any = {
          media_type: "IMAGE",
          image_url: imageUrls[0].url,
          caption: message,
          access_token: pageAccessToken,
        };

        // Add scheduling info for single image if needed
        if (time.scheduled_publish_time) {
          imageData.scheduled_publish_time = time.scheduled_publish_time;
          imageData.published = false;
        } else {
          imageData.published = published ?? true;
        }

        const response = await fetch(
          `https://graph.facebook.com/v19.0/${instagramId}/media`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(
              Object.entries(imageData)
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
          console.error("Instagram Image API Error:", data);
          throw new Error(data.error?.message || "Failed to create post");
        }

        // If not scheduled, publish immediately
        if (!time.scheduled_publish_time) {
          const publishResponse = await fetch(
            `https://graph.facebook.com/v19.0/${instagramId}/media_publish`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                creation_id: data.id,
                access_token: pageAccessToken,
              }),
            }
          );

          const publishData = await publishResponse.json();
          if (!publishResponse.ok) {
            console.error("Instagram Publish API Error:", publishData);
            throw new Error(
              publishData.error?.message || "Failed to publish image"
            );
          }

          return NextResponse.json(publishData);
        }

        return NextResponse.json(data);
      }
    } else if (imageUrls && imageUrls.length > 1) {
      // Multiple images post
      const mediaIds = [];

      for (const item of imageUrls) {
        if (item.isVideo) {
          const videoParams = {
            media_type: "REELS",
            video_url: item.url,
            published: "false",
            access_token: pageAccessToken,
          };

          const response = await fetch(
            `https://graph.facebook.com/v19.0/${instagramId}/media`,
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
            console.error("Instagram Video Upload Error:", data);
            throw new Error(data.error?.message || "Failed to upload video");
          }

          mediaIds.push(data.id);
        } else {
          const imageParams = {
            media_type: "IMAGE",
            image_url: item.url,
            published: "false",
            access_token: pageAccessToken,
          };

          const response = await fetch(
            `https://graph.facebook.com/v19.0/${instagramId}/media`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams(imageParams),
            }
          );

          const data = await response.json();
          if (!response.ok) {
            console.error("Instagram Image Upload Error:", data);
            throw new Error(data.error?.message || "Failed to upload image");
          }

          mediaIds.push(data.id);
        }
      }

      // Create the carousel post
      const carouselData: any = {
        media_type: "CAROUSEL_ALBUM",
        children: mediaIds.join(","),
        caption: message,
        access_token: pageAccessToken,
      };

      // Add scheduling info
      if (time.scheduled_publish_time) {
        carouselData.scheduled_publish_time = time.scheduled_publish_time;
        carouselData.published = "false";
      } else {
        carouselData.published = (published ?? true).toString();
      }

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${instagramId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(
            Object.entries(carouselData)
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
        console.error("Instagram Carousel API Error:", data);
        throw new Error(
          data.error?.message || "Failed to create carousel post"
        );
      }

      // If not scheduled, publish immediately
      if (!time.scheduled_publish_time) {
        const publishResponse = await fetch(
          `https://graph.facebook.com/v19.0/${instagramId}/media_publish`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              creation_id: data.id,
              access_token: pageAccessToken,
            }),
          }
        );

        const publishData = await publishResponse.json();
        if (!publishResponse.ok) {
          console.error("Instagram Publish API Error:", publishData);
          throw new Error(
            publishData.error?.message || "Failed to publish carousel"
          );
        }

        return NextResponse.json(publishData);
      }

      return NextResponse.json(data);
    } else {
      // Text-only post (Instagram doesn't support text-only posts, so we'll return an error)
      return NextResponse.json(
        {
          error:
            "Instagram requires media content. Please add at least one image or video.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Instagram API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
