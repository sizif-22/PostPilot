import { MediaItem } from "@/interfaces/Media";

export interface YouTubePostParams {
  accessToken: string;
  title: string;
  description: string;
  tags?: string[];
  privacy: "public" | "private" | "unlisted";
  madeForKids?: boolean;
  categoryId?: string;
  media: MediaItem[];
  scheduleTime?: string; // ISO 8601 format for scheduled publishing
}

export interface YouTubeResponse {
  id: string;
  status: string;
  uploadUrl?: string;
  error?: string;
}

/**
 * Posts a video to YouTube using the YouTube Data API v3
 * @param params YouTube post parameters including media files
 * @returns Promise that resolves to YouTube response
 */
export const PostOnYouTube = async (
  params: YouTubePostParams,
): Promise<YouTubeResponse> => {
  try {
    const {
      accessToken,
      title,
      description,
      tags,
      privacy,
      madeForKids,
      categoryId,
      media,
      scheduleTime,
    } = params;

    console.log("Starting YouTube upload with params:", {
      title,
      privacy,
      hasMedia: !!media,
      mediaCount: media?.length,
      scheduleTime,
    });

    // Validate access token
    if (!accessToken || accessToken.trim() === "") {
      throw new Error("YouTube access token is required");
    }

    // Find the first video in media array
    const video = media?.find(
      (item) => item.contentType?.startsWith("video/") || item.isVideo,
    );

    if (!video) {
      throw new Error(
        "No video file found in media. YouTube requires at least one video file.",
      );
    }

    // Validate video URL
    if (!video.url || video.url.trim() === "") {
      throw new Error("Video URL is required for YouTube upload");
    }

    console.log("Video found:", {
      url: video.url,
      contentType: video.contentType,
      isVideo: video.isVideo,
    });

    // Prepare video metadata
    const snippet = {
      title: title || "Untitled Video",
      description: description || "",
      tags: tags && tags.length > 0 ? tags : [],
      categoryId: categoryId || "22", // Default to People & Blogs if not specified
    };

    // Note: scheduleTime/publishAt is not used because scheduling is handled
    // by AWS Lambda which triggers the upload at the scheduled time
    const status = {
      privacyStatus: privacy || "public",
      selfDeclaredMadeForKids: madeForKids ?? false,
    };

    console.log("Initializing resumable upload session...");

    // Step 1: Initialize a resumable upload session
    const initUrl = `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`;

    // First, get the video file size and content type
    let videoContentType = video.contentType || "video/mp4";
    let videoSize: number | undefined = undefined;

    try {
      const headRes = await fetch(video.url, { method: "HEAD" });
      if (headRes.ok) {
        const contentLength = headRes.headers.get("content-length");
        const contentType = headRes.headers.get("content-type");

        if (contentLength) {
          videoSize = parseInt(contentLength, 10);
          console.log("Video size:", videoSize, "bytes");
        }

        if (contentType && contentType.startsWith("video/")) {
          videoContentType = contentType;
        }
      }
    } catch (err) {
      console.warn("Could not determine video metadata via HEAD request:", err);
    }

    // Prepare init headers
    const initHeaders: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": videoContentType,
    };

    // Add content length if available
    if (videoSize && videoSize > 0) {
      initHeaders["X-Upload-Content-Length"] = videoSize.toString();
    }

    const initResponse = await fetch(initUrl, {
      method: "POST",
      headers: initHeaders,
      body: JSON.stringify({
        snippet,
        status,
      }),
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      let errorMessage = `Failed to initialize YouTube upload: ${initResponse.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error?.errors?.[0]?.message) {
          errorMessage = errorData.error.errors[0].message;
        }
      } catch (e) {
        console.error("Could not parse error response:", errorText);
      }

      console.error("YouTube init error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Get the upload URL from the Location header
    const uploadUrl = initResponse.headers.get("Location");
    if (!uploadUrl) {
      throw new Error(
        "Failed to get resumable upload URL from YouTube. No Location header in response.",
      );
    }

    console.log("Upload session initialized. Upload URL obtained.");

    // Step 2: Fetch the video file
    console.log("Fetching video file from:", video.url);
    const videoResponse = await fetch(video.url);

    if (!videoResponse.ok) {
      throw new Error(
        `Failed to fetch video file: ${videoResponse.status} ${videoResponse.statusText}`,
      );
    }

    if (!videoResponse.body) {
      throw new Error("Video response has no body");
    }

    // Get actual content length from the video response
    const actualContentLength = videoResponse.headers.get("content-length");
    const actualContentType = videoResponse.headers.get("content-type") || videoContentType;

    console.log("Video fetched successfully:", {
      contentType: actualContentType,
      contentLength: actualContentLength,
    });

    // Step 3: Upload the video to YouTube
    console.log("Uploading video to YouTube...");

    const uploadHeaders: Record<string, string> = {
      "Content-Type": actualContentType,
    };

    if (actualContentLength) {
      uploadHeaders["Content-Length"] = actualContentLength;
    }

    // Create upload options with duplex for streaming
    const uploadOptions: any = {
      method: "PUT",
      headers: uploadHeaders,
      body: videoResponse.body,
      duplex: "half", // Required for streaming request bodies in Node.js fetch
    };

    const uploadResponse = await fetch(uploadUrl, uploadOptions);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      let errorMessage = `YouTube video upload failed: ${uploadResponse.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error?.errors?.[0]?.message) {
          errorMessage = errorData.error.errors[0].message;
        }
      } catch (e) {
        console.error("Could not parse upload error response:", errorText);
      }

      console.error("YouTube upload error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Parse the response
    const uploadedData = await uploadResponse.json();
    console.log("Video uploaded successfully:", uploadedData);

    // Step 4: Upload thumbnail if available
    if (video.thumbnailUrl && uploadedData.id) {
      try {
        console.log("Uploading custom thumbnail...");
        await uploadYouTubeThumbnail(
          accessToken,
          uploadedData.id,
          video.thumbnailUrl,
        );
        console.log("Thumbnail uploaded successfully");
      } catch (thumbnailError) {
        console.error("Failed to upload thumbnail:", thumbnailError);
        // Don't fail the entire upload if thumbnail fails
      }
    }

    return {
      id: uploadedData.id || "unknown",
      status: uploadedData.status?.uploadStatus || "uploaded",
      uploadUrl,
    };
  } catch (error) {
    console.error("Error posting to YouTube:", error);

    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`YouTube upload failed: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Uploads a custom thumbnail to a YouTube video
 * @param accessToken YouTube access token
 * @param videoId The ID of the uploaded video
 * @param thumbnailUrl URL of the thumbnail image
 */
async function uploadYouTubeThumbnail(
  accessToken: string,
  videoId: string,
  thumbnailUrl: string,
): Promise<void> {
  try {
    // Fetch the thumbnail image
    const thumbnailResponse = await fetch(thumbnailUrl);
    if (!thumbnailResponse.ok) {
      throw new Error(`Failed to fetch thumbnail: ${thumbnailResponse.status}`);
    }

    if (!thumbnailResponse.body) {
      throw new Error("Thumbnail response has no body");
    }

    // Get content type and length
    const contentType = thumbnailResponse.headers.get("content-type") || "image/jpeg";
    const contentLength = thumbnailResponse.headers.get("content-length");

    // Upload thumbnail to YouTube
    const thumbnailUploadUrl = `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": contentType,
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }

    const uploadOptions: any = {
      method: "POST",
      headers,
      body: thumbnailResponse.body,
      duplex: "half",
    };

    const response = await fetch(thumbnailUploadUrl, uploadOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Thumbnail upload error:", errorText);
      throw new Error(`Thumbnail upload failed: ${response.status}`);
    }

    console.log("Thumbnail uploaded successfully");
  } catch (error) {
    console.error("Error uploading YouTube thumbnail:", error);
    throw error;
  }
}
