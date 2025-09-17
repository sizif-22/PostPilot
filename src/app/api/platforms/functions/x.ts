import { MediaItem } from "@/interfaces/Media";
import { createHmac } from "crypto";
import OAuth from "oauth-1.0a";

const consumer_key = process.env.X_API_KEY;
const consumer_secret = process.env.X_API_KEY_SECRET;
const access_token = process.env.X_ACCESS_TOKEN;
const token_secret = process.env.X_ACCESS_TOKEN_SECRET;

// OAuth 1.0a instance for media uploads
const oauth = new OAuth({
  consumer: {
    key: consumer_key || "",
    secret: consumer_secret || "",
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return createHmac("sha1", key).update(base_string).digest("base64");
  },
});

// Global token for v1.1 API (media uploads only)
const globalToken = {
  key: access_token || "",
  secret: token_secret || "",
};

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

// Create OAuth instance dynamically based on user's tokens
function createOAuthInstance(userAccessToken: string, userTokenSecret: string) {
  const consumer_key = process.env.X_API_KEY;
  const consumer_secret = process.env.X_API_KEY_SECRET;

  return new OAuth({
    consumer: {
      key: consumer_key || "",
      secret: consumer_secret || "",
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return createHmac("sha1", key).update(base_string).digest("base64");
    },
  });
}

export async function PostOnX({
  accessToken,
  pageId,
  message,
  media,
  refreshToken,
  tokenExpiry,
  xText,
  oauth1AccessToken,
  oauth1AccessTokenSecret,
}: {
  media?: MediaItem[];
  accessToken: string;
  pageId: string;
  message?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  xText?: string;
  oauth1AccessToken?: string;
  oauth1AccessTokenSecret?: string;
}) {
  try {
    let currentAccessToken = accessToken;

    // Validate the access token
    const isTokenValid = await testAccessToken(currentAccessToken);
    if (!isTokenValid) {
      throw new Error("Invalid or expired access token");
    }

    let media_ids: string[] = [];

    // 1. Upload media if present (using v1.1 API for all media)
    if (media && media.length > 0) {
      // Check if we have user's OAuth 1.0a tokens
      if (!oauth1AccessToken || !oauth1AccessTokenSecret) {
        throw new Error("OAuth 1.0a tokens required for media upload");
      }

      const userOAuth1Token = {
        key: oauth1AccessToken,
        secret: oauth1AccessTokenSecret,
      };

      const mediaToUpload = media.slice(0, 4);
      console.log(
        `Attempting to upload ${mediaToUpload.length} media items to X using user's tokens`
      );

      for (const mediaItem of mediaToUpload) {
        if (mediaItem.url) {
          console.log(`Uploading media: ${mediaItem.url}`);
          
          const media_id = await uploadMediaToXV1(
            mediaItem.url,
            mediaItem.isVideo || false,
            userOAuth1Token
          );
          
          if (!media_id) {
            throw new Error(`Failed to upload media: ${mediaItem.url}`);
          }
          
          media_ids.push(media_id);
          console.log(`Successfully uploaded media with ID: ${media_id}`);
        }
      }
    }

    // 2. Post the tweet using Twitter API v2
    const tweetBody: any = {
      text: xText || "",
    };

    if (media_ids.length > 0) {
      tweetBody.media = { media_ids };
    }

    console.log("Posting tweet with body:", JSON.stringify(tweetBody, null, 2));

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${currentAccessToken}`,
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

// Unified media upload function using v1.1 API for both images and videos
async function uploadMediaToXV1(
  mediaUrl: string,
  isVideo: boolean,
  userToken: { key: string; secret: string }
): Promise<string | null> {
  try {
    console.log(`Starting media upload for: ${mediaUrl}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

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

    if (mediaType === "application/octet-stream") {
      const contentType = mediaResponse.headers.get("content-type");
      if (contentType) {
        mediaType = contentType;
      }
    }

    console.log(
      `Media downloaded successfully. Type: ${mediaType}, Size: ${mediaBuffer.byteLength} bytes`
    );

    if (isVideo) {
      console.log("Uploading video using v1.1 API with chunked upload");
      return await uploadVideoV1(mediaBuffer, mediaType, userToken);
    } else {
      console.log("Uploading image using v1.1 API");
      return await uploadImageV1(mediaBuffer, mediaType, userToken);
    }
  } catch (error) {
    console.error("Error uploading media to X:", error);
    return null;
  }
}

// Upload images using v1.1 API (simpler method)
async function uploadImageV1(
  mediaBuffer: ArrayBuffer,
  mediaType: string,
  userToken: { key: string; secret: string }
): Promise<string | null> {
  try {
    if (mediaBuffer.byteLength > 5 * 1024 * 1024) {
      console.error("Image too large, must be under 5MB");
      return null;
    }

    const base64Data = Buffer.from(mediaBuffer).toString("base64");
    
    const formData = new FormData();
    formData.append("media_data", base64Data);
    formData.append("media_category", "tweet_image");

    const url = "https://upload.twitter.com/1.1/media/upload.json";
    const request_data = {
      url: url,
      method: "POST",
    };

    const headers = oauth.toHeader(oauth.authorize(request_data, userToken));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: headers.Authorization,
      },
      body: formData,
    });

    console.log(`Image upload response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Image upload failed: ${response.status} ${response.statusText}`);
      console.error("Error response body:", errorText);
      return null;
    }

    const data = await response.json();
    console.log("Image upload successful:", data);
    return data.media_id_string || null;
  } catch (error) {
    console.error("Error in image upload:", error);
    return null;
  }
}

// Video upload using Twitter API v1.1 with OAuth 1.0a (chunked upload)
async function uploadVideoV1(
  mediaBuffer: ArrayBuffer,
  mediaType: string,
  userToken: { key: string; secret: string }
): Promise<string | null> {
  try {
    if (mediaBuffer.byteLength > 512 * 1024 * 1024) {
      console.error("Video too large, must be under 512MB");
      return null;
    }

    console.log(
      `Starting v1.1 video upload. Size: ${mediaBuffer.byteLength} bytes, Type: ${mediaType}`
    );

    const url = "https://upload.twitter.com/1.1/media/upload.json";
    
    // Step 1: INIT
    const params = {
      command: "INIT",
      total_bytes: mediaBuffer.byteLength.toString(),
      media_type: "video/mp4",
      media_category: "tweet_video",
    };

    const request_data = {
      url: url + "?" + new URLSearchParams(params).toString(),
      method: "POST",
    };
    
    const headers = oauth.toHeader(oauth.authorize(request_data, userToken));

    const initResponse = await fetch(request_data.url, {
      method: "POST",
      headers: {
        Authorization: headers.Authorization,
      },
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error(`INIT failed: ${initResponse.status} ${errorText}`);
      return null;
    }

    const initData = await initResponse.json();
    const mediaId = initData.media_id_string;
    console.log(`INIT successful. Media ID: ${mediaId}`);

    // Step 2: APPEND (chunked upload)
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(mediaBuffer.byteLength / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, mediaBuffer.byteLength);
      const chunk = mediaBuffer.slice(start, end);

      const formData = new FormData();
      formData.append("command", "APPEND");
      formData.append("media_id", mediaId);
      formData.append("segment_index", i.toString());
      formData.append("media", new Blob([chunk], { type: mediaType }));

      const appendRequestData = {
        url: "https://upload.twitter.com/1.1/media/upload.json",
        method: "POST",
      };

      const oauthHeaders = oauth.toHeader(oauth.authorize(appendRequestData, userToken));

      const appendResponse = await fetch(
        "https://upload.twitter.com/1.1/media/upload.json",
        {
          method: "POST",
          headers: {
            Authorization: oauthHeaders.Authorization,
          },
          body: formData,
        }
      );

      if (!appendResponse.ok) {
        const errorText = await appendResponse.text();
        console.error(
          `APPEND failed for chunk ${i}: ${appendResponse.status} ${errorText}`
        );
        return null;
      }

      console.log(`Chunk ${i + 1}/${totalChunks} uploaded successfully`);
    }

    // Step 3: FINALIZE
    const finalizeRequestData = {
      url: "https://upload.twitter.com/1.1/media/upload.json",
      method: "POST",
    };

    const finalFormData = new FormData();
    finalFormData.set("command", "FINALIZE");
    finalFormData.set("media_id", mediaId);

    const finalizeOauthHeaders = oauth.toHeader(
      oauth.authorize(finalizeRequestData, userToken)
    );

    const finalizeResponse = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: finalizeOauthHeaders.Authorization,
        },
        body: finalFormData,
      }
    );

    if (!finalizeResponse.ok) {
      const errorText = await finalizeResponse.text();
      console.error(`FINALIZE failed: ${finalizeResponse.status} ${errorText}`);
      return null;
    }

    const finalizeData = await finalizeResponse.json();
    console.log("Video upload finalized:", finalizeData);

    // Step 4: Check processing status (for videos)
    if (finalizeData.processing_info) {
      console.log("Video is being processed...");
      const processedMediaId = await waitForProcessing(mediaId, userToken);
      return processedMediaId;
    }

    return mediaId;
  } catch (error) {
    console.error("Error in v1.1 video upload:", error);
    return null;
  }
}

// Wait for video processing to complete
async function waitForProcessing(
  mediaId: string,
  userToken: { key: string; secret: string },
  maxAttempts: number = 15 // Increased from 10
): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const statusUrl = `https://upload.twitter.com/1.1/media/upload.json?command=STATUS&media_id=${mediaId}`;
      const statusRequestData = {
        url: statusUrl,
        method: "GET",
      };
      const statusOauthHeaders = oauth.toHeader(
        oauth.authorize(statusRequestData, userToken)
      );

      const statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          Authorization: statusOauthHeaders.Authorization,
        },
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(
          `STATUS check failed: ${statusResponse.status} ${errorText}`
        );
        return null;
      }

      const statusData = await statusResponse.json();
      console.log(
        `Processing status (attempt ${attempt + 1}):`,
        statusData.processing_info
      );

      if (statusData.processing_info) {
        const state = statusData.processing_info.state;

        if (state === "succeeded") {
          console.log("Video processing completed successfully");
          return mediaId;
        } else if (state === "failed") {
          console.error(
            "Video processing failed:",
            statusData.processing_info.error
          );
          return null;
        } else if (state === "in_progress" || state === "pending") {
          const checkAfterSecs =
            statusData.processing_info.check_after_secs || 5;
          console.log(`Waiting ${checkAfterSecs} seconds before next check...`);
          await new Promise((resolve) =>
            setTimeout(resolve, checkAfterSecs * 1000)
          );
        }
      } else {
        // No processing info means it's ready
        return mediaId;
      }
    } catch (error) {
      console.error(
        `Error checking processing status (attempt ${attempt + 1}):`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.error("Max attempts reached waiting for video processing");
  return null;
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