import { MediaItem } from "@/interfaces/Media";

// Test function to validate access token
async function testAccessToken(accessToken: string): Promise<boolean> {
  try {
    console.log("Testing access token validity...");

    const response = await fetch("https://api.twitter.com/2/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Access token is valid. User:", data.data?.username);
      return true;
    } else {
      const errorText = await response.text();
      console.error(
        `Access token validation failed: ${response.status} ${errorText}`
      );
      return false;
    }
  } catch (error) {
    console.error("Error testing access token:", error);
    return false;
  }
}

export async function PostOnX({
  accessToken,
  pageId, // Not used for X, but kept for interface compatibility
  message,
  imageUrls,
}: {
  imageUrls?: MediaItem[];
  accessToken: string;
  pageId: string;
  message?: string;
}) {
  try {
    // First, validate the access token
    const isTokenValid = await testAccessToken(accessToken);
    if (!isTokenValid) {
      throw new Error("Invalid or expired access token");
    }

    let media_ids: string[] = [];

    // 1. Upload media if present - if this fails, the entire post should fail
    if (imageUrls && imageUrls.length > 0) {
      // X allows up to 4 images or 1 video per tweet
      const mediaToUpload = imageUrls.slice(0, 4);
      console.log(
        `Attempting to upload ${mediaToUpload.length} media items to X`
      );

      for (const media of mediaToUpload) {
        if (media.url) {
          console.log(`Uploading media: ${media.url}`);
          // Try to upload media - if this fails, throw error to stop the entire process
          const media_id = await uploadMediaToX(
            media.url,
            media.isVideo,
            accessToken
          );
          if (!media_id) {
            throw new Error(`Failed to upload media: ${media.url}`);
          }
          media_ids.push(media_id);
          console.log(`Successfully uploaded media with ID: ${media_id}`);
        }
      }
    }

    // 2. Post the tweet using Twitter API v2 (OAuth 2.0)
    const tweetBody: any = {
      text: message || "",
    };

    if (media_ids.length > 0) {
      tweetBody.media = { media_ids };
    }

    console.log("Posting tweet with body:", JSON.stringify(tweetBody, null, 2));

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("X tweet response:", response.status, errorText);
      throw new Error(`Failed to post tweet: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Tweet posted successfully:", data);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("X API Error:", error);
    throw new Error(error.message || "Internal server error");
  }
}

// Media upload using the user's access token
async function uploadMediaToX(
  mediaUrl: string,
  isVideo: boolean,
  accessToken: string
): Promise<string | null> {
  try {
    console.log(`Starting media upload for: ${mediaUrl}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds

    let mediaResponse;
    try {
      mediaResponse = await fetch(mediaUrl, { signal: controller.signal });
    } catch (err) {
      console.error("Failed to fetch media from URL:", err);
      return null;
    } finally {
      clearTimeout(timeout);
    }
    if (!mediaResponse || !mediaResponse.ok) {
      console.error(
        `Failed to download media: ${mediaResponse?.status} ${mediaResponse?.statusText}`
      );
      return null;
    }

    const mediaBuffer = await mediaResponse.arrayBuffer();
    let mediaType = getMediaTypeFromURL(mediaUrl);

    // Try to get the type from the response header if the fallback is used
    if (mediaType === "application/octet-stream") {
      const contentType = mediaResponse.headers.get("content-type");
      if (contentType) {
        mediaType = contentType;
      }
    }

    console.log(
      `Media downloaded successfully. Type: ${mediaType}, Size: ${mediaBuffer.byteLength} bytes`
    );

    // Check if it's a video
    // const isVideo = mediaType.startsWith("video/");

    if (isVideo) {
      console.log("Uploading as video using simple upload");
      return await uploadVideoSimple(mediaBuffer, mediaType, accessToken);
    } else {
      console.log("Uploading as image using simple upload");
      // For images, use simple upload
      return await uploadImageSimple(mediaBuffer, mediaType, accessToken);
    }
  } catch (error) {
    console.error("Error uploading media to X:", error);
    return null;
  }
}

// Simple upload for images
async function uploadImageSimple(
  mediaBuffer: ArrayBuffer,
  mediaType: string,
  accessToken: string
): Promise<string | null> {
  try {
    if (!accessToken || accessToken.trim() === "") {
      console.error("Access token is missing or empty");
      return null;
    }

    if (mediaBuffer.byteLength > 5 * 1024 * 1024) {
      console.error("Image too large, must be under 5MB");
      return null;
    }

    // Twitter v2 /media/upload expects a JSON body with base64-encoded media in 'media'
    const base64Data = Buffer.from(mediaBuffer).toString("base64");
    const body = JSON.stringify({
      media: base64Data,
      media_category: "tweet_image",
      media_type: mediaType,
    });

    const response = await fetch("https://api.twitter.com/2/media/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body,
    });

    console.log(`Image upload response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Image upload failed: ${response.status} ${response.statusText}`
      );
      console.error("Error response body:", errorText);
      return null;
    }

    const data = await response.json();
    console.log("Image upload successful:", data);
    return data.data?.id || null;
  } catch (error) {
    console.error("Error in image upload:", error);
    return null;
  }
}

// Simple upload for videos
async function uploadVideoSimple(
  mediaBuffer: ArrayBuffer,
  mediaType: string,
  accessToken: string
): Promise<string | null> {
  try {
    if (!accessToken || accessToken.trim() === "") {
      console.error("Access token is missing or empty");
      return null;
    }

    // Twitter's docs: 512MB max for videos, but you may want to check your app's limits
    if (mediaBuffer.byteLength > 512 * 1024 * 1024) {
      console.error("Video too large, must be under 512MB");
      return null;
    }

    const base64Data = Buffer.from(mediaBuffer).toString("base64");
    const body = JSON.stringify({
      media: base64Data,
      media_category: "tweet_video",
      media_type: mediaType,
    });

    const response = await fetch("https://api.twitter.com/2/media/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body,
    });

    console.log(`Video upload response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Video upload failed: ${response.status} ${response.statusText}`
      );
      console.error("Error response body:", errorText);
      return null;
    }

    const data = await response.json();
    console.log("Video upload successful:", data);
    return data.data?.id || null;
  } catch (error) {
    console.error("Error in video upload:", error);
    return null;
  }
}

function getMediaTypeFromURL(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "avi":
      return "video/x-msvideo";
    default:
      return "application/octet-stream";
  }
}
