// tiktok.ts - Direct post version with proper chunking and thumbnail support
import { MediaItem } from "@/interfaces/Media";

export async function PostOnTiktok({
  accessToken,
  openId,
  message,
  media,
  title,
  description,
  privacy_level,
  disable_duet,
  disable_comment,
  disable_stitch,
  brand_content_toggle,
  brand_organic_toggle,
  branded_content_toggle,
}: {
  accessToken: string;
  openId: string;
  message?: string;
  media: MediaItem[];
  title?: string;
  description?: string;
  privacy_level?: string;
  disable_duet?: boolean;
  disable_comment?: boolean;
  disable_stitch?: boolean;
  brand_content_toggle?: boolean;
  brand_organic_toggle?: boolean;
  branded_content_toggle?: boolean;
}) {
  try {
    if (!accessToken || !openId || !media) {
      throw new Error(
        "Required parameters missing: accessToken, openId, or media",
      );
    }

    if (media.length !== 1 || !media[0].isVideo) {
      throw new Error("TikTok only supports single video uploads");
    }

    const mediaUrl = media[0].url;
    const thumbnailUrl = media[0].thumbnailUrl;

    // Download video
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let mediaResponse;
    try {
      mediaResponse = await fetch(mediaUrl, { signal: controller.signal });
    } catch (err) {
      console.error("Failed to fetch media from URL:", err);
      throw new Error("Failed to download video file");
    } finally {
      clearTimeout(timeout);
    }

    if (!mediaResponse || !mediaResponse.ok) {
      throw new Error(
        `Failed to download media: ${mediaResponse?.status} ${mediaResponse?.statusText}`,
      );
    }

    const mediaBuffer = await mediaResponse.arrayBuffer();
    const size = mediaBuffer.byteLength;

    console.log(
      `Video size: ${size} bytes (${(size / 1024 / 1024).toFixed(2)} MB)`,
    );

    // Correct chunking logic per TikTok API requirements
    const minChunkSize = 5 * 1024 * 1024; // 5MB minimum
    const maxChunkSize = 64 * 1024 * 1024; // 64MB maximum
    const preferredChunkSize = 10 * 1024 * 1024; // 10MB preferred

    let chunkSize: number;
    let totalChunkCount: number;

    if (size < minChunkSize) {
      // For small files (< 5MB), send in one chunk with chunk_size = video_size
      chunkSize = size;
      totalChunkCount = 1;
    } else if (size <= maxChunkSize) {
      // For files <= 64MB, can be sent as single chunk
      chunkSize = size;
      totalChunkCount = 1;
    } else {
      // For larger files, use chunking
      chunkSize = preferredChunkSize; // 10MB
      totalChunkCount = Math.floor(size / chunkSize);

      // Ensure we have at least 1 chunk
      if (totalChunkCount === 0) {
        totalChunkCount = 1;
        chunkSize = size;
      }

      // Check if final chunk would be too large (> 128MB limit for final chunk)
      const remainingBytes = size - chunkSize * totalChunkCount;
      const finalChunkSize = chunkSize + remainingBytes;
      const maxFinalChunkSize = 128 * 1024 * 1024; // 128MB limit for final chunk

      if (finalChunkSize > maxFinalChunkSize) {
        // Need to recalculate with smaller chunk size or more chunks
        const targetChunks = Math.ceil(size / (maxChunkSize * 0.8)); // Use 80% of max to be safe
        chunkSize = Math.floor(size / targetChunks);
        chunkSize = Math.max(chunkSize, minChunkSize);
        chunkSize = Math.min(chunkSize, maxChunkSize);
        totalChunkCount = Math.floor(size / chunkSize);
      }
    }

    console.log(
      `Chunk size: ${chunkSize} bytes, Total chunks: ${totalChunkCount}`,
    );

    // Prepare post info for direct publishing
    const postInfo: any = {
      title: description || title || message || "", // Use description first, then title, then message
      privacy_level: privacy_level || "PUBLIC_TO_EVERYONE",
      disable_duet: disable_duet || false,
      disable_comment: disable_comment || false,
      disable_stitch: disable_stitch || false,
      brand_content_toggle: brand_content_toggle || false,
      brand_organic_toggle: brand_organic_toggle || false,
    };

    // Add cover image URL if thumbnail is available
    if (thumbnailUrl && thumbnailUrl.startsWith("http")) {
      postInfo.cover_image_url = thumbnailUrl;
      console.log(`Using thumbnail: ${thumbnailUrl}`);
    }

    // Step 1: Initialize direct video upload (not inbox)
    const initPayload = {
      source_info: {
        source: "FILE_UPLOAD",
        video_size: size,
        chunk_size: chunkSize,
        total_chunk_count: totalChunkCount,
      },
      post_info: postInfo,
    };

    console.log(
      "Initializing TikTok direct upload with payload:",
      JSON.stringify(initPayload, null, 2),
    );

    // Use the direct publish endpoint instead of inbox
    const initResponse = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initPayload),
      },
    );

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error("TikTok API Error Response:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }

      console.error("TikTok API Error:", errorData);
      throw new Error(
        errorData.error?.message ||
        `HTTP ${initResponse.status}: ${initResponse.statusText}`,
      );
    }

    const initData = await initResponse.json();
    console.log("Init response:", initData);

    const uploadUrl = initData.data.upload_url;
    const publishId = initData.data.publish_id;

    if (!uploadUrl || !publishId) {
      throw new Error("Missing upload URL or publish ID from TikTok API");
    }

    // Step 2: Upload chunks
    console.log(`Starting upload of ${totalChunkCount} chunks`);

    for (let chunkIndex = 0; chunkIndex < totalChunkCount; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      let end: number;

      if (chunkIndex === totalChunkCount - 1) {
        // Final chunk gets all remaining bytes (can exceed chunkSize up to 128MB)
        end = size;
      } else {
        end = start + chunkSize;
      }

      const chunk = mediaBuffer.slice(start, end);
      const actualChunkSize = end - start;

      console.log(
        `Uploading chunk ${chunkIndex + 1}/${totalChunkCount}: bytes ${start}-${end - 1}/${size} (${actualChunkSize} bytes)`,
      );

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4",
          "Content-Range": `bytes ${start}-${end - 1}/${size}`,
          "Content-Length": actualChunkSize.toString(),
        },
        body: chunk,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text();
        console.error(`Chunk ${chunkIndex} upload failed:`, uploadError);
        throw new Error(
          `Failed to upload chunk ${chunkIndex + 1}: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }

      console.log(
        `Chunk ${chunkIndex + 1} uploaded successfully (Status: ${uploadResponse.status})`,
      );
    }

    console.log("All chunks uploaded successfully");

    // Step 3: Check publishing status
    console.log("Checking publishing status...");

    const statusResponse = await fetch(
      `https://open.tiktokapis.com/v2/post/publish/status/${publishId}/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!statusResponse.ok) {
      console.warn("Failed to check status, but upload completed");
    } else {
      const statusData = await statusResponse.json();
      console.log("Publishing status:", statusData);
    }

    return {
      success: true,
      publishId: publishId,
      uploadUrl: uploadUrl,
      status: "published",
      message: "Video successfully posted to TikTok!",
      chunkInfo: {
        totalSize: size,
        chunkSize: chunkSize,
        totalChunks: totalChunkCount,
      },
    };
  } catch (error) {
    console.error("PostOnTiktok error:", error);
    throw error;
  }
}

export async function getCreatorInfo(accessToken: string) {
  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch creator info: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching creator info:", error);
    throw error;
  }
}
