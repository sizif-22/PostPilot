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
      console.error(`Access token validation failed: ${response.status} ${errorText}`);
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
      console.log(`Attempting to upload ${mediaToUpload.length} media items to X`);

      for (const media of mediaToUpload) {
        if (media.url) {
          console.log(`Uploading media: ${media.url}`);
          // Try to upload media - if this fails, throw error to stop the entire process
          const media_id = await uploadMediaToX(media.url, accessToken);
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
  accessToken: string
): Promise<string | null> {
  try {
    console.log(`Starting media upload for: ${mediaUrl}`);
    
    // Download the media
    const mediaResponse = await fetch(mediaUrl);
    if (!mediaResponse.ok) {
      console.error(`Failed to download media: ${mediaResponse.status} ${mediaResponse.statusText}`);
      return null;
    }

    const mediaBuffer = await mediaResponse.arrayBuffer();
    const mediaType = getMediaTypeFromURL(mediaUrl);
    
    console.log(`Media downloaded successfully. Type: ${mediaType}, Size: ${mediaBuffer.byteLength} bytes`);

    // Check if it's a video
    const isVideo = mediaType.startsWith("video/");

    if (isVideo) {
      console.log("Uploading as video using chunked upload");
      // For videos, use chunked upload
      return await uploadVideoChunked(mediaBuffer, mediaType, accessToken);
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
    // Validate access token
    if (!accessToken || accessToken.trim() === "") {
      console.error("Access token is missing or empty");
      return null;
    }

    // Convert ArrayBuffer to base64
    const base64Data = Buffer.from(mediaBuffer).toString("base64");
    
    console.log(`Uploading image - Type: ${mediaType}, Base64 length: ${base64Data.length}`);

    // Log the first part of the token for debugging (safely)
    const tokenPreview = accessToken.substring(0, 10) + "...";
    console.log(`Using access token: ${tokenPreview}`);

    // Validate media size (Twitter has limits)
    if (mediaBuffer.byteLength > 5 * 1024 * 1024) { // 5MB limit for images
      console.error("Image too large, must be under 5MB");
      return null;
    }

    const formData = new URLSearchParams({
      media_data: base64Data,
      media_category: "tweet_image",
    });

    const response = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    console.log(`Image upload response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Image upload failed: ${response.status} ${response.statusText}`);
      console.error("Error response body:", errorText);
      
      // Provide specific error messages for common issues
      if (response.status === 403) {
        console.error("403 Forbidden - This could be due to:");
        console.error("1. Invalid or expired access token");
        console.error("2. Insufficient permissions (need write access)");
        console.error("3. App not approved for media upload");
        console.error("4. Rate limiting");
      } else if (response.status === 401) {
        console.error("401 Unauthorized - Access token is invalid or expired");
      } else if (response.status === 413) {
        console.error("413 Payload Too Large - Image file is too large");
      }
      
      // Try to parse error response for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Parsed error:", errorJson);
        if (errorJson.errors && Array.isArray(errorJson.errors)) {
          for (const err of errorJson.errors) {
            console.error(`Error code ${err.code}: ${err.message}`);
          }
        }
      } catch (parseError) {
        console.error("Could not parse error response as JSON");
      }
      
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

// Chunked upload for videos
async function uploadVideoChunked(
  mediaBuffer: ArrayBuffer,
  mediaType: string,
  accessToken: string
): Promise<string | null> {
  try {
    const base64Data = Buffer.from(mediaBuffer).toString("base64");
    
    console.log(`Starting chunked video upload - Type: ${mediaType}, Size: ${mediaBuffer.byteLength} bytes`);

    // Step 1: Initialize upload
    const initResponse = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          command: "INIT",
          media_type: mediaType,
          media_category: "tweet_video",
          total_bytes: mediaBuffer.byteLength.toString(),
        }),
      }
    );

    console.log(`Video init response status: ${initResponse.status}`);

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error(`Video init failed: ${initResponse.status} ${errorText}`);
      return null;
    }

    const initData = await initResponse.json();
    const mediaId = initData.media_id_string;
    console.log(`Video init successful, media ID: ${mediaId}`);

    // Step 2: Upload the video data
    const uploadResponse = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          command: "APPEND",
          media_id: mediaId,
          media_data: base64Data,
          segment_index: "0",
        }),
      }
    );

    console.log(`Video upload response status: ${uploadResponse.status}`);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(
        `Video upload failed: ${uploadResponse.status} ${errorText}`
      );
      return null;
    }

    // Step 3: Finalize upload
    const finalizeResponse = await fetch(
      "https://upload.twitter.com/1.1/media/upload.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          command: "FINALIZE",
          media_id: mediaId,
        }),
      }
    );

    console.log(`Video finalize response status: ${finalizeResponse.status}`);

    if (!finalizeResponse.ok) {
      const errorText = await finalizeResponse.text();
      console.error(
        `Video finalize failed: ${finalizeResponse.status} ${errorText}`
      );
      return null;
    }

    const finalizeData = await finalizeResponse.json();
    console.log("Video finalize successful:", finalizeData);

    // Step 4: Check processing status (for videos)
    if (finalizeData.processing_info) {
      console.log("Video requires processing, waiting...");
      const processingResult = await waitForProcessing(mediaId, accessToken);
      if (!processingResult) {
        return null;
      }
    }

    return mediaId;
  } catch (error) {
    console.error("Error in video upload:", error);
    return null;
  }
}

// Wait for video processing to complete
async function waitForProcessing(
  mediaId: string,
  accessToken: string
): Promise<boolean> {
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    console.log(`Checking processing status (attempt ${attempts + 1}/${maxAttempts})`);
    
    const statusResponse = await fetch(
      `https://upload.twitter.com/1.1/media/upload.json?command=STATUS&media_id=${mediaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(
        `Status check failed: ${statusResponse.status} ${errorText}`
      );
      return false;
    }

    const statusData = await statusResponse.json();
    console.log("Processing status:", statusData);
    
    if (statusData.processing_info) {
      const state = statusData.processing_info.state;

      if (state === "succeeded") {
        console.log("Video processing completed successfully");
        return true;
      } else if (state === "failed") {
        console.error(
          "Video processing failed:",
          statusData.processing_info.error?.message
        );
        return false;
      }

      // Wait before checking again
      const checkAfterSecs = statusData.processing_info.check_after_secs || 5;
      console.log(`Waiting ${checkAfterSecs} seconds before next check...`);
      await new Promise((resolve) =>
        setTimeout(resolve, checkAfterSecs * 1000)
      );
    } else {
      // No processing info means it's ready
      console.log("No processing info, media is ready");
      return true;
    }

    attempts++;
  }

  console.error("Video processing timed out");
  return false;
}

// Helper to get media type from URL
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
      return "image/jpeg"; // Default fallback
  }
}