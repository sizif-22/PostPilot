import { MediaItem } from "@/interfaces/Media";

export async function PostOnInstagram({
  accessToken,
  pageId,
  message,
  imageUrls,
}: {
  imageUrls: MediaItem[];
  accessToken: string;
  pageId: string; // Instagram Business Account ID
  message?: string;
}) {
  // Validate required parameters
  if (!accessToken) {
    throw new Error("Access token is required");
  }
  if (!pageId) {
    throw new Error("Instagram Business Account ID is required");
  }
  //   if (!message || message.trim() === "") {
  //     throw new Error("Caption is required for Instagram posts");
  //   }
  // Validate media requirements
  if (!imageUrls || imageUrls.length === 0) {
    throw new Error(
      "Instagram requires at least one image or video. Text-only posts are not supported."
    );
  }
  // Validate media types
  const hasVideos = imageUrls.some((item) => item.isVideo);
  const hasImages = imageUrls.some((item) => !item.isVideo);
  const videoCount = imageUrls.filter((item) => item.isVideo).length;
  // Check for mixed media
  if (hasVideos && hasImages) {
    throw new Error("Cannot mix videos and images in the same Instagram post.");
  }
  // Check for multiple videos
  if (videoCount > 1) {
    throw new Error("Instagram supports only one video per post.");
  }
  // Publish immediately
  return await createAndPublishInstagramPost({
    accessToken,
    pageId,
    message,
    imageUrls,
    published: true,
  });
}

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
        if (attempt === maxAttempts) {
          throw new Error(
            statusData.error?.message || "Failed to check container status"
          );
        }
        continue;
      }
      if (statusData.status_code === "FINISHED") {
        return true;
      } else if (statusData.status_code === "ERROR") {
        throw new Error("Container processing failed with ERROR status");
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Container did not become ready within the expected time");
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
  message?: string;
  imageUrls: MediaItem[];
  published: boolean;
}) {
  if (imageUrls.length === 1) {
    // Single media post
    const mediaItem = imageUrls[0];
    let mediaData: Record<string, string> = {
      access_token: accessToken,
      ...(message ? { caption: message } : {}),
    };
    if (mediaItem.isVideo) {
      // Try REELS first
      mediaData = {
        video_url: mediaItem.url,
        media_type: "REELS",
        ...(message ? { caption: message } : {}),
        access_token: accessToken,
        share_to_feed: "true",
      };
    } else {
      mediaData = {
        image_url: mediaItem.url,
        media_type: "IMAGE",
        ...(message ? { caption: message } : {}),
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
      // If REELS fails for video, try VIDEO as fallback
      if (mediaItem.isVideo && mediaData.media_type === "REELS") {
        mediaData = {
          video_url: mediaItem.url,
          media_type: "VIDEO",
          ...(message ? { caption: message } : {}),
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
      await waitForContainerReady(createData.id, accessToken);
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
      return publishData;
    }
    return createData;
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
        await waitForContainerReady(data.id, accessToken);
      }
    }
    // Create carousel container
    const carouselData = {
      media_type: "CAROUSEL",
      children: mediaIds.join(","),
      ...(message ? { caption: message } : {}),
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
        throw new Error(
          publishData.error?.message || "Failed to publish carousel"
        );
      }
      return publishData;
    }
    return carouselCreateData;
  }
}
