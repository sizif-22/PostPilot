import { MediaItem } from "@/interfaces/Media";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      accessToken,
      pageId,
      message,
      imageUrls,
      clientTimeZone,
    }: {
      imageUrls: MediaItem[];
      accessToken: string;
      pageId: string; // Instagram Business Account ID
      message: string;
      clientTimeZone?: string;
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
    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        {
          error:
            "Instagram requires at least one image or video. Text-only posts are not supported.",
        },
        { status: 400 }
      );
    }

    // Validate media types
    const hasVideos = imageUrls.some((item) => item.isVideo);
    const hasImages = imageUrls.some((item) => !item.isVideo);
    const videoCount = imageUrls.filter((item) => item.isVideo).length;

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
      imageUrls,
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

async function createAndPublishInstagramPost({
  accessToken,
  pageId,
  message,
  imageUrls,
  published,
}: {
  accessToken: string;
  pageId: string;
  message: string;
  imageUrls: MediaItem[];
  published: boolean;
}) {
  if (imageUrls.length === 1) {
    // Single media post
    const mediaItem = imageUrls[0];
    const mediaData = {
      ...(mediaItem.isVideo
        ? { video_url: mediaItem.url, media_type: "VIDEO" }
        : { image_url: mediaItem.url, media_type: "IMAGE" }),
      caption: message,
      access_token: accessToken,
    };

    // Create media container
    const createResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(mediaData),
      }
    );

    const createData = await createResponse.json();
    if (!createResponse.ok) {
      throw new Error(
        createData.error?.message || "Failed to create media container"
      );
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
        throw new Error(publishData.error?.message || "Failed to publish post");
      }

      return NextResponse.json(publishData);
    }

    return NextResponse.json(createData);
  } else {
    // Carousel post
    const mediaIds = [];

    // Upload each media item
    for (const item of imageUrls) {
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
        throw new Error(
          data.error?.message || "Failed to upload carousel item"
        );
      }

      mediaIds.push(data.id);
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
      throw new Error(
        carouselCreateData.error?.message || "Failed to create carousel"
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
  imageUrls,
  scheduledDate,
}: {
  accessToken: string;
  pageId: string;
  message: string;
  imageUrls: MediaItem[];
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
