import { MediaItem } from "@/interfaces/Media";

export interface YouTubePostParams {
  accessToken: string;
  title: string;
  description: string;
  tags?: string[];
  privacy: "public" | "private" | "unlisted";
  media: MediaItem[];
  scheduleTime?: string; // ISO 8601 format for scheduled publishing
}

export interface YouTubeResponse {
  id: string;
  status: string;
  uploadUrl?: string;
}

/**
 * Posts a video to YouTube
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
      media,
      scheduleTime,
    } = params;

    // Currently, we only handle the first video since YouTube allows one video per upload
    const video = media?.find(
      (item) => item.contentType?.startsWith("video/") || item.isVideo,
    );

    if (!video) {
      throw new Error("No video file found in media for YouTube upload");
    }

    // For scheduled posts, we'll need to set the publishAt time
    const snippet = {
      title,
      description,
      tags: tags || [],
      categoryId: "22", // People & Blogs category, can be configurable
    };

    const status = {
      privacyStatus: privacy,
      ...(scheduleTime && {
        publishAt: scheduleTime, // For scheduled publishing
      }),
    };

    // Note: Actual YouTube upload is complex and involves multiple steps
    // Using a library like googleapis would be better for production
    // For now, we'll simulate the process by making a request to YouTube Data API

    // First, initiate a resumable upload session with YouTube
    const initUrl = `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=${["snippet", "status"].join(",")}`;
    const initResponse = await fetch(initUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": video.contentType || "video/mp4",
        // X-Upload-Content-Length is optional; we'll try to include it below if possible
      },
      body: JSON.stringify({
        snippet,
        status,
      }),
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `Failed to initialize YouTube upload: ${initResponse.status}`,
      );
    }

    const uploadUrl = initResponse.headers.get("Location");
    if (!uploadUrl) {
      throw new Error("Failed to get YouTube resumable upload URL");
    }

    // Validate source video URL
    const sourceUrl = video.url;
    if (!sourceUrl) {
      throw new Error("Source video URL not provided for YouTube upload");
    }

    // Try to determine content length of the remote file (optional)
    let remoteContentLength: number | undefined = undefined;
    try {
      const headRes = await fetch(sourceUrl, { method: "HEAD" });
      if (headRes.ok) {
        const cl = headRes.headers.get("content-length");
        if (cl) {
          const parsed = parseInt(cl, 10);
          if (!isNaN(parsed) && parsed > 0) {
            remoteContentLength = parsed;
          }
        }
      }
    } catch (err) {
      // HEAD may fail on some hosts - that's OK, we can stream without a known length
      console.warn("Could not determine remote content-length for video:", err);
    }

    // Fetch the remote video as a stream
    const remoteRes = await fetch(sourceUrl);
    if (!remoteRes.ok || !remoteRes.body) {
      throw new Error(`Failed to fetch source video: ${remoteRes.status}`);
    }

    // Determine content type to use for upload
    const uploadContentType =
      video.contentType || remoteRes.headers.get("content-type") || "video/mp4";

    // Upload the video data to the resumable upload URL using the stream
    const uploadHeaders: Record<string, string> = {
      "Content-Type": uploadContentType,
    };
    if (remoteContentLength) {
      uploadHeaders["Content-Length"] = remoteContentLength.toString();
    }

    // Use an any-typed options object to include `duplex` for Node fetch streaming.
    // Typing the options as `any` avoids TypeScript's strict `RequestInit` check while
    // allowing us to pass the `duplex` field required by Node/undici for streaming bodies.
    const uploadOptions: any = {
      method: "PUT",
      headers: uploadHeaders,
      // Node / server fetch supports passing the ReadableStream from the response directly as the body
      body: remoteRes.body,
      // Required for streaming bodies in Node's fetch (undici)
      duplex: "half",
    };
    const uploadResponse = await fetch(uploadUrl, uploadOptions);

    if (!uploadResponse.ok) {
      // Try to parse error details
      const errorBody = await uploadResponse.text().catch(() => "");
      let parsedError: any = {};
      try {
        parsedError = JSON.parse(errorBody || "{}");
      } catch (e) {
        parsedError = {
          message: errorBody || `Status ${uploadResponse.status}`,
        };
      }
      throw new Error(
        parsedError.error?.message ||
          parsedError.message ||
          `YouTube upload failed: ${uploadResponse.status}`,
      );
    }

    // The upload response should contain the video resource JSON
    const uploadedData = await uploadResponse.json().catch(() => ({}));

    // Return meaningful response
    return {
      id: uploadedData.id || uploadedData.videoId || "unknown_video_id",
      status:
        uploadedData.status?.privacyStatus ||
        (scheduleTime ? "scheduled" : "uploaded"),
      uploadUrl,
    };
  } catch (error) {
    console.error("Error posting to YouTube:", error);
    throw error;
  }
};
