import { MediaItem } from "@/interfaces/Media";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      accessToken,
      pageId,
      message,
      media,
    }: {
      media: MediaItem[];
      accessToken: string;
      pageId: string; // Instagram Business Account ID
      message: string;
    } = await request.json();

    // Validate required parameters
    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    if (!pageId) {
      return NextResponse.json(
        { error: "Instagram Business Account ID is required" },
        { status: 400 }
      );
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Caption is required for Instagram posts" },
        { status: 400 }
      );
    }

    // Validate media requirements
    if (!media || media.length === 0) {
      return NextResponse.json(
        {
          error:
            "Instagram requires at least one image or video. Text-only posts are not supported.",
        },
        { status: 400 }
      );
    }

    // Validate media types
    const hasVideos = media.some((item) => item.isVideo);
    const hasImages = media.some((item) => !item.isVideo);
    const videoCount = media.filter((item) => item.isVideo).length;

    // Check for mixed media
    if (hasVideos && hasImages) {
      return NextResponse.json(
        {
          error: "Cannot mix videos and images in the same Instagram post.",
        },
        { status: 400 }
      );
    }

    // Check for multiple videos
    if (videoCount > 1) {
      return NextResponse.json(
        {
          error: "Instagram supports only one video per post.",
        },
        { status: 400 }
      );
    }

    // Handle scheduling logic

    // Publish immediately
    return await createAndPublishInstagramPost({
      accessToken,
      pageId,
      message,
      media,
      published: true,
    });
  } catch (error: any) {
    console.error("Instagram API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to wait for container to be ready
async function waitForContainerReady(
  containerId: string,
  accessToken: string,
  maxAttempts: number = 10,
  delayMs: number = 3000
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const statusResponse = await fetch(
        `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`,
        {
          method: "GET",
        }
      );

      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        console.error(`Status check attempt ${attempt} failed:`, statusData);
        if (attempt === maxAttempts) {
          throw new Error(
            statusData.error?.message || "Failed to check container status"
          );
        }
        continue;
      }

      console.log(
        `Container ${containerId} status attempt ${attempt}:`,
        statusData.status_code
      );

      if (statusData.status_code === "FINISHED") {
        return true;
      } else if (statusData.status_code === "ERROR") {
        throw new Error("Container processing failed with ERROR status");
      }

      // Wait before next attempt (except on last attempt)
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Container status check attempt ${attempt} error:`, error);
      if (attempt === maxAttempts) {
        throw error;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Container did not become ready within the expected time");
}

async function createAndPublishInstagramPost({
  accessToken,
  pageId,
  message,
  media,
  published,
}: {
  accessToken: string;
  pageId: string;
  message: string;
  media: MediaItem[];
  published: boolean;
}) {
  if (media.length === 1) {
    // Single media post
    const mediaItem = media[0];
    let mediaData: Record<string, string> = {
      caption: message,
      access_token: accessToken,
    };

    if (mediaItem.isVideo) {
      // Try REELS first
      mediaData = {
        video_url: mediaItem.url,
        media_type: "REELS",
        caption: message,
        access_token: accessToken,
        share_to_feed: "true",
      };
    } else {
      mediaData = {
        image_url: mediaItem.url,
        media_type: "IMAGE",
        caption: message,
        access_token: accessToken,
      };
    }

    // Create media container
    let createResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(mediaData),
      }
    );

    let createData = await createResponse.json();

    // Enhanced error logging
    if (!createResponse.ok) {
      console.error("Instagram API create media failed:", {
        status: createResponse.status,
        statusText: createResponse.statusText,
        response: createData,
        requestData: mediaData,
      });

      // If REELS fails for video, try VIDEO as fallback
      if (mediaItem.isVideo && mediaData.media_type === "REELS") {
        console.warn("REELS upload failed, falling back to VIDEO");
        mediaData = {
          video_url: mediaItem.url,
          media_type: "VIDEO",
          caption: message,
          access_token: accessToken,
        };
        createResponse = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}/media`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(mediaData),
          }
        );
        createData = await createResponse.json();
      }
    }

    if (!createResponse.ok) {
      throw new Error(
        createData.error?.message ||
          `Failed to create media container. Status: ${
            createResponse.status
          }. Response: ${JSON.stringify(createData)}`
      );
    }

    if (!createData.id) {
      throw new Error(
        `Media container was created but no ID was returned. Response: ${JSON.stringify(
          createData
        )}`
      );
    }

    // Wait for container to be ready (especially important for videos)
    if (mediaItem.isVideo) {
      console.log(
        `Waiting for video container ${createData.id} to be ready...`
      );
      await waitForContainerReady(createData.id, accessToken);
      console.log(`Container ${createData.id} is ready for publishing`);
    }

    // Publish the media
    if (published) {
      const publishResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/media_publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            creation_id: createData.id,
            access_token: accessToken,
          }),
        }
      );

      const publishData = await publishResponse.json();
      if (!publishResponse.ok) {
        console.error("Instagram API publish failed:", {
          status: publishResponse.status,
          statusText: publishResponse.statusText,
          response: publishData,
        });
        throw new Error(publishData.error?.message || "Failed to publish post");
      }

      return NextResponse.json(publishData);
    }

    return NextResponse.json(createData);
  } else {
    // Carousel post
    const mediaIds = [];

    // Upload each media item
    for (const item of media) {
      const mediaParams = {
        ...(item.isVideo
          ? { video_url: item.url, media_type: "VIDEO" }
          : { image_url: item.url, media_type: "IMAGE" }),
        is_carousel_item: "true",
        access_token: accessToken,
      };

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(mediaParams),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Instagram API carousel item failed:", {
          status: response.status,
          statusText: response.statusText,
          response: data,
          requestData: mediaParams,
        });
        throw new Error(
          data.error?.message || "Failed to upload carousel item"
        );
      }

      if (!data.id) {
        throw new Error(
          `Carousel item was created but no ID was returned. Response: ${JSON.stringify(
            data
          )}`
        );
      }

      mediaIds.push(data.id);

      // Wait for video containers to be ready
      if (item.isVideo) {
        console.log(
          `Waiting for video carousel item ${data.id} to be ready...`
        );
        await waitForContainerReady(data.id, accessToken);
      }
    }

    // Create carousel container
    const carouselData = {
      media_type: "CAROUSEL",
      children: mediaIds.join(","),
      caption: message,
      access_token: accessToken,
    };

    const carouselResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(carouselData),
      }
    );

    const carouselCreateData = await carouselResponse.json();
    if (!carouselResponse.ok) {
      console.error("Instagram API carousel creation failed:", {
        status: carouselResponse.status,
        statusText: carouselResponse.statusText,
        response: carouselCreateData,
      });
      throw new Error(
        carouselCreateData.error?.message || "Failed to create carousel"
      );
    }

    if (!carouselCreateData.id) {
      throw new Error(
        `Carousel container was created but no ID was returned. Response: ${JSON.stringify(
          carouselCreateData
        )}`
      );
    }

    // Publish carousel
    if (published) {
      const publishResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/media_publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            creation_id: carouselCreateData.id,
            access_token: accessToken,
          }),
        }
      );

      const publishData = await publishResponse.json();
      if (!publishResponse.ok) {
        console.error("Instagram API carousel publish failed:", {
          status: publishResponse.status,
          statusText: publishResponse.statusText,
          response: publishData,
        });
        throw new Error(
          publishData.error?.message || "Failed to publish carousel"
        );
      }

      return NextResponse.json(publishData);
    }

    return NextResponse.json(carouselCreateData);
  }
}

async function createScheduledInstagramPost({
  accessToken,
  pageId,
  message,
  media,
  scheduledDate,
}: {
  accessToken: string;
  pageId: string;
  message: string;
  media: MediaItem[];
  scheduledDate: number;
}) {
  // Create the media container(s) but don't publish
  // Store the creation_id(s) with scheduled time in your database
  // Implement a cron job or scheduled task to publish later

  // This is a simplified version - you'd need to implement
  // your own scheduling system since Instagram doesn't support it natively

  return NextResponse.json({
    message: "Post scheduled successfully",
    scheduledFor: new Date(scheduledDate * 1000).toISOString(),
    note: "Custom scheduling system required - Instagram doesn't support native scheduling",
  });
}
