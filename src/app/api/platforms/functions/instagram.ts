async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (error: any) {
      if (error.cause?.code === 'ETIMEDOUT' && i < maxRetries - 1) {
        console.warn(`Fetch timed out. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
}

// instagram.ts - Fixed version with proper thumbnail handling
import { MediaItem } from "@/interfaces/Media";

export async function PostOnInstagram({
  accessToken,
  pageId,
  message,
  media,
}: {
  media: MediaItem[];
  accessToken: string;
  pageId: string;
  message?: string;
}) {
  // Validation logic
  if (!accessToken || !pageId || !media || media.length === 0) {
    throw new Error("Required parameters missing");
  }

  const hasVideos = media.some((item) => item.isVideo);
  const hasImages = media.some((item) => !item.isVideo);
  const videoCount = media.filter((item) => item.isVideo).length;

  if (hasVideos && hasImages) {
    throw new Error("Cannot mix videos and images in the same Instagram post.");
  }

  if (videoCount > 1) {
    throw new Error("Instagram supports only one video per post.");
  }

  return await createAndPublishInstagramPost({
    accessToken,
    pageId,
    message,
    media,
    published: true,
  });
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
  message?: string;
  media: MediaItem[];
  published: boolean;
}) {
  if (media.length === 1) {
    const mediaItem = media[0];

    if (mediaItem.isVideo) {
      console.log("Processing video upload with thumbnail:", mediaItem.thumbnailUrl);
      
      // CRITICAL: Instagram requires different approaches for thumbnails
      // For REELS and VIDEO, thumbnail handling is different
      
      let createData;
      let createResponse;
      
      // Try REELS first with thumbnail
      console.log("Attempting REELS upload...");
      const reelsData: Record<string, string> = {
        video_url: mediaItem.url,
        media_type: "REELS",
        access_token: accessToken,
        share_to_feed: "true",
        ...(message ? { caption: message } : {}),
      };

      // FIXED: For Instagram REELS, thumbnail is handled via cover parameter
      if (mediaItem.thumbnailUrl && isValidImageUrl(mediaItem.thumbnailUrl)) {
        console.log("Adding thumbnail to REELS:", mediaItem.thumbnailUrl);
        reelsData.cover_url = mediaItem.thumbnailUrl; // Use cover_url for REELS
      }

      createResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${pageId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(reelsData),
        }
      );
      createData = await createResponse.json();

      // If REELS fails, try regular VIDEO
      if (!createResponse.ok) {
        console.warn("REELS upload failed, trying VIDEO fallback:", createData);
        
        const videoData: Record<string, string> = {
          video_url: mediaItem.url,
          media_type: "VIDEO",
          access_token: accessToken,
          ...(message ? { caption: message } : {}),
        };

        // FIXED: For regular VIDEO, use thumb parameter instead of thumbnail_url
        if (mediaItem.thumbnailUrl && isValidImageUrl(mediaItem.thumbnailUrl)) {
          console.log("Adding thumbnail to VIDEO:", mediaItem.thumbnailUrl);
          videoData.thumb = mediaItem.thumbnailUrl; // Use thumb for regular VIDEO
        }

        createResponse = await fetchWithRetry(
          `https://graph.facebook.com/v19.0/${pageId}/media`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(videoData),
          }
        );
        createData = await createResponse.json();
      }

      if (!createResponse.ok) {
        console.error("Both REELS and VIDEO upload failed:", createData);
        throw new Error(
          createData.error?.message ||
            `Failed to create video container. Status: ${createResponse.status}`
        );
      }

      console.log("Video container created successfully:", createData);

      // Wait for video processing
      if (createData.id) {
        console.log("Waiting for video processing...");
        await waitForContainerReady(createData.id, accessToken);
      }

      // Publish if requested
      if (published) {
        console.log("Publishing video...");
        const publishResponse = await fetchWithRetry(
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
          console.error("Publish failed:", publishData);
          throw new Error(publishData.error?.message || "Failed to publish post");
        }
        
        console.log("Video published successfully:", publishData);
        return publishData;
      }

      return createData;
    } else {
      // Image handling
      console.log("Processing image upload...");
      
      const mediaData = {
        image_url: mediaItem.url,
        media_type: "IMAGE",
        access_token: accessToken,
        ...(message ? { caption: message } : {}),
      };

      const createResponse = await fetchWithRetry(
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
          createData.error?.message || "Failed to create image container"
        );
      }

      if (published) {
        const publishResponse = await fetchWithRetry(
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
    }
  } else if (media.length > 1) {
    // Carousel post with proper thumbnail handling
    console.log("Processing carousel post...");
    const mediaIds = [];

    // Upload each media item
    for (const [index, item] of media.entries()) {
      console.log(`Processing carousel item ${index + 1}/${media.length}`);
      
      const mediaParams: Record<string, string> = {
        is_carousel_item: "true",
        access_token: accessToken,
      };

      if (item.isVideo) {
        mediaParams.video_url = item.url;
        mediaParams.media_type = "VIDEO";
        
        // FIXED: Add thumbnail for carousel videos
        if (item.thumbnailUrl && isValidImageUrl(item.thumbnailUrl)) {
          console.log(`Adding thumbnail to carousel video ${index + 1}:`, item.thumbnailUrl);
          mediaParams.thumb = item.thumbnailUrl;
        }
      } else {
        mediaParams.image_url = item.url;
        mediaParams.media_type = "IMAGE";
      }

      const response = await fetchWithRetry(
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
          data.error?.message || `Failed to upload carousel item ${index + 1}`
        );
      }

      if (!data.id) {
        throw new Error(
          `Carousel item ${index + 1} was created but no ID was returned. Response: ${JSON.stringify(data)}`
        );
      }

      mediaIds.push(data.id);

      // Wait for video containers to be ready
      if (item.isVideo) {
        console.log(`Waiting for carousel video ${index + 1} to be ready...`);
        await waitForContainerReady(data.id, accessToken);
      }
    }

    // Create carousel container
    const carouselData = {
      media_type: "CAROUSEL",
      children: mediaIds.join(","),
      access_token: accessToken,
      ...(message ? { caption: message } : {}),
    };

    const carouselResponse = await fetchWithRetry(
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
        `Carousel container was created but no ID was returned. Response: ${JSON.stringify(carouselCreateData)}`
      );
    }

    // Publish carousel
    if (published) {
      const publishResponse = await fetchWithRetry(
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

  throw new Error("No media provided");
}

async function waitForContainerReady(
  containerId: string,
  accessToken: string,
  maxAttempts: number = 30, // Increased attempts
  delayMs: number = 3000 // Reduced delay
): Promise<boolean> {
  console.log(`Checking container status for ID: ${containerId}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const statusResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${containerId}?fields=status_code,status&access_token=${accessToken}`,
        { method: "GET" }
      );
      const statusData = await statusResponse.json();
      
      if (!statusResponse.ok) {
        console.warn(`Status check attempt ${attempt} failed:`, statusData);
        if (attempt === maxAttempts) {
          throw new Error(statusData.error?.message || "Failed to check container status");
        }
        continue;
      }
      
      console.log(`Container status (attempt ${attempt}):`, statusData.status_code || statusData.status);
      
      if (statusData.status_code === "FINISHED" || statusData.status === "FINISHED") {
        console.log("Container is ready!");
        return true;
      } else if (statusData.status_code === "ERROR" || statusData.status === "ERROR") {
        throw new Error(`Container processing failed with status: ${statusData.status}. Full error: ${JSON.stringify(statusData)}`);
      } else if (statusData.status_code === "IN_PROGRESS" || statusData.status === "IN_PROGRESS") {
        console.log(`Container still processing... (attempt ${attempt}/${maxAttempts})`);
      }
      
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.warn(`Error checking container status (attempt ${attempt}):`, error);
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  
  console.warn("Container did not become ready within the expected time, proceeding anyway...");
  return false; // Changed to return false instead of throwing
}

// Helper function to validate image URLs
function isValidImageUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const pathname = url.pathname.toLowerCase();
    
    return imageExtensions.some(ext => pathname.includes(ext)) || 
           pathname.includes('image') ||
           pathname.includes('thumb') ||
           pathname.includes('preview') ||
           pathname.includes('cover');
  } catch {
    return false;
  }
}