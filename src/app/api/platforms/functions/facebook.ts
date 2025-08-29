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

// facebook.ts - Fixed version with proper thumbnail handling
import { MediaItem } from "@/interfaces/Media";
import { Blob } from 'buffer';

async function getPageAccessToken(pageId: string, userAccessToken: string): Promise<string> {
  if (!pageId || pageId === "0") {
    console.log("Using provided token (assuming it's already a page token or user token for a page-less post).");
    return userAccessToken;
  }

  try {
    const response = await fetchWithRetry(
      `https://graph.facebook.com/v19.0/${pageId}?fields=access_token,name&access_token=${userAccessToken}`,
      { method: "GET" }
    );
    const data = await response.json();
    if (data.access_token) {
      console.log("Using page access token for:", data.name);
      return data.access_token;
    } else {
      console.warn("Could not retrieve page-specific access token. Falling back to the provided token.", data.error || '');
      return userAccessToken;
    }
  } catch (error) {
    console.error("Error fetching page access token, using provided token:", error);
    return userAccessToken;
  }
}

async function uploadVideo({ pageId, pageAccessToken, message, mediaItem }: { pageId: string; pageAccessToken: string; message: string; mediaItem: MediaItem }) {
  console.log("Publishing as Default Video...");

  if (!mediaItem.url || !isValidUrl(mediaItem.url)) {
    throw new Error("Invalid video URL provided for default video upload.");
  }

  const formData = new FormData();
  formData.append("access_token", pageAccessToken);
  formData.append("file_url", mediaItem.url);
  formData.append("description", message);

  if (mediaItem.thumbnailUrl && isValidImageUrl(mediaItem.thumbnailUrl)) {
    console.log("Fetching thumbnail from:", mediaItem.thumbnailUrl);
    try {
      // fetchWithRetry expects at least 2 arguments: url and options
      const response = await fetchWithRetry(
        mediaItem.thumbnailUrl,
        { method: "GET" }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch thumbnail: ${response.statusText}`);
      }
      const imageBuffer = await response.arrayBuffer();
      // Use Blob from buffer
      const imageBlob = new Blob([imageBuffer], { type: response.headers.get('content-type') || 'image/jpeg' });
      formData.append("thumb", imageBlob as any, 'thumbnail.jpg');
      console.log("Thumbnail fetched and added to the request.");
    } catch (error) {
      console.warn("Could not fetch thumbnail, proceeding without it:", error);
    }
  }

  console.log("Final video data (form data):", {
    file_url: formData.get('file_url'),
    description: formData.get('description'),
    access_token: "[REDACTED]",
    thumb: formData.has("thumb") ? "Exists" : "Does not exist"
  });

  const response = await fetchWithRetry(
    `https://graph.facebook.com/v19.0/${pageId}/videos`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    console.error("Facebook Video API Error:", data);
    console.error("Request data was FormData, see details above.");
    throw new Error(data.error?.message || "Failed to upload video");
  }

  console.log("Default video published successfully:", data);
  return data;
}

async function uploadReel({ pageId, pageAccessToken, message, mediaItem }: { pageId: string; pageAccessToken: string; message: string; mediaItem: MediaItem }) {
  console.log("Publishing as Reel...");

  if (!mediaItem.url || !isValidUrl(mediaItem.url)) {
    throw new Error("Invalid video URL provided for reel upload.");
  }

  // Step 1: Initialize upload session
  const initRes = await fetchWithRetry(
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

  // Step 2: Upload the video file
  const uploadRes = await fetchWithRetry(upload_url, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${pageAccessToken}`,
      file_url: mediaItem.url,
    },
  });

  // The response for video upload might not be JSON, check for success status
  if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error('Reel upload failed:', errorText);
      throw new Error("Failed to upload reel video file.");
  }

  // Step 3: Publish the reel
  const publishPayload: any = {
    access_token: pageAccessToken,
    video_id,
    upload_phase: "finish",
    video_state: "PUBLISHED",
    description: message,
  };

  if (mediaItem.thumbnailUrl && isValidImageUrl(mediaItem.thumbnailUrl)) {
    console.log("Adding thumbnail to reel:", mediaItem.thumbnailUrl);
    publishPayload.thumb_url = mediaItem.thumbnailUrl;
  }

  const publishRes = await fetchWithRetry(
    `https://graph.facebook.com/v19.0/${pageId}/video_reels`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(publishPayload),
    }
  );
  const publishData = await publishRes.json();
  if (!publishRes.ok) {
    throw new Error(
      publishData.error?.message || "Failed to publish reel"
    );
  }
  return publishData;
}

export async function PostOnFacebook({
  accessToken,
  pageId,
  message,
  media,
  facebookVideoType,
}: {
  media?: MediaItem[];
  accessToken: any;
  pageId: any;
  message: any;
  facebookVideoType?: "default" | "reel";
}): Promise<any> {
  try {
    if (!accessToken) throw new Error("Access token is required");
    if (!pageId) throw new Error("Valid page ID is required");

    const pageAccessToken = await getPageAccessToken(pageId, accessToken);

    const hasMedia = media && media.length > 0;
    const hasVideo = hasMedia && media.some((item) => item.isVideo);
    const hasImage = hasMedia && media.some((item) => !item.isVideo);

    if (hasVideo && hasImage) {
      throw new Error("Cannot mix videos and images in the same post.");
    }
    if (hasVideo && media.filter(item => item.isVideo).length > 1) {
      throw new Error("Cannot post more than one video at a time.");
    }

    // Video Post
    if (hasVideo) {
      const mediaItem = media.find(item => item.isVideo);
      if (!mediaItem) {
        throw new Error("No video media item found.");
      }
      if (facebookVideoType === 'reel') {
        return await uploadReel({ pageId, pageAccessToken, message, mediaItem });
      }
      return await uploadVideo({ pageId, pageAccessToken, message, mediaItem });
    }

    // Image(s) Post
    if (hasImage) {
      if (media.length === 1) {
        // Single Image Post
        const photoData = { url: media[0].url, caption: message, access_token: pageAccessToken };
        const response = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
          method: "POST",
          body: new URLSearchParams(photoData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Failed to post image.");
        return data;
      } else {
        // Multi-Image Post
        const attached_media = await Promise.all(media.map(async (item) => {
          const photoParams = { url: item.url, published: "false", access_token: pageAccessToken };
          const response = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
            method: "POST",
            body: new URLSearchParams(photoParams),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error?.message || `Failed to upload image ${item.url}`);
          return { media_fbid: data.id };
        }));

        const feedData = { message, access_token: pageAccessToken, attached_media: JSON.stringify(attached_media) };
        const response = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: "POST",
          body: new URLSearchParams(feedData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Failed to create multi-image post.");
        return data;
      }
    }

    // Text-only Post
    const feedData = { message, access_token: pageAccessToken };
    const response = await fetchWithRetry(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: "POST",
      body: new URLSearchParams(feedData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Failed to create text-only post.");
    return data;

  } catch (error: any) {
    console.error("Facebook API Error:", error.message);
    throw new Error(error.message || "An internal server error occurred.");
  }
}

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function isValidImageUrl(urlString: string): boolean {
  if (!isValidUrl(urlString)) return false;
  // Basic check for common image extensions or patterns in URL
  return /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(urlString) || /image|thumb|preview/i.test(urlString);
}
