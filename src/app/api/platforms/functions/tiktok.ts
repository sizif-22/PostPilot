
// tiktok.ts - Fixed version with proper chunking and thumbnail support
import { MediaItem } from "@/interfaces/Media";

export async function PostOnTiktok({
  accessToken,
  openId,
  message,
  media,
}: {
  accessToken: string;
  openId: string;
  message?: string;
  media: MediaItem[];
}) {
  try {
    if (!accessToken || !openId || !media) {
      throw new Error("Required parameters missing: accessToken, openId, or media");
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
      throw new Error(`Failed to download media: ${mediaResponse?.status} ${mediaResponse?.statusText}`);
    }

    const mediaBuffer = await mediaResponse.arrayBuffer();
    const size = mediaBuffer.byteLength;

    console.log(`Video size: ${size} bytes (${(size / 1024 / 1024).toFixed(2)} MB)`);

    // FIXED: Correct chunking logic per TikTok API requirements
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
      // TikTok requires: total_chunk_count = Math.floor(video_size / chunk_size)
      // The final chunk gets all remaining bytes (can be > chunk_size, up to 128MB)
      
      chunkSize = preferredChunkSize; // 10MB
      totalChunkCount = Math.floor(size / chunkSize);
      
      // Ensure we have at least 1 chunk
      if (totalChunkCount === 0) {
        totalChunkCount = 1;
        chunkSize = size;
      }
      
      // Check if final chunk would be too large (> 128MB limit for final chunk)
      const remainingBytes = size - (chunkSize * totalChunkCount);
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

    console.log(`Chunk size: ${chunkSize} bytes, Total chunks: ${totalChunkCount}`);

    // Download and prepare thumbnail if available
    let thumbnailBuffer: ArrayBuffer | null = null;
    if (thumbnailUrl) {
      try {
        const thumbnailResponse = await fetch(thumbnailUrl);
        if (thumbnailResponse.ok) {
          thumbnailBuffer = await thumbnailResponse.arrayBuffer();
          console.log(`Thumbnail downloaded: ${thumbnailBuffer.byteLength} bytes`);
        } else {
          console.warn("Failed to download thumbnail, proceeding without it");
        }
      } catch (error) {
        console.warn("Error downloading thumbnail:", error);
      }
    }

    // Prepare post info
    const postInfo: any = {
      title: message || "",
      privacy_level: "PUBLIC_TO_EVERYONE",
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      brand_content_toggle: false,
      brand_organic_toggle: false,
    };

    // Add cover image if thumbnail is available
    if (thumbnailBuffer) {
      // For TikTok API, we need to upload the thumbnail separately or use cover_image_url
      // If you have the thumbnail as a URL, use cover_image_url
      if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
        postInfo.cover_image_url = thumbnailUrl;
      }
    }

    // Step 1: Initialize inbox upload
    const initPayload = {
      source_info: {
        source: "FILE_UPLOAD",
        video_size: size,
        chunk_size: chunkSize,
        total_chunk_count: totalChunkCount,
      },
      post_info: postInfo,
    };

    console.log("Initializing TikTok upload with payload:", JSON.stringify(initPayload, null, 2));

    const initResponse = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initPayload),
      }
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
      throw new Error(errorData.error?.message || `HTTP ${initResponse.status}: ${initResponse.statusText}`);
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
      
      console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunkCount}: bytes ${start}-${end - 1}/${size} (${actualChunkSize} bytes)`);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4", // Use proper MIME type instead of application/octet-stream
          "Content-Range": `bytes ${start}-${end - 1}/${size}`,
          "Content-Length": actualChunkSize.toString(),
        },
        body: chunk,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text();
        console.error(`Chunk ${chunkIndex} upload failed:`, uploadError);
        throw new Error(`Failed to upload chunk ${chunkIndex + 1}: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
      console.log(`Chunk ${chunkIndex + 1} uploaded successfully (Status: ${uploadResponse.status})`);
    }

    // Step 3: If we have a thumbnail buffer, try to upload it (this is optional and depends on TikTok's API)
    // Note: TikTok's current API primarily uses cover_image_url for thumbnails
    // The thumbnail upload via buffer might require additional API endpoints

    console.log("All chunks uploaded successfully");

    return {
      success: true,
      publishId: publishId,
      uploadUrl: uploadUrl,
      status: "uploaded_to_inbox",
      message: "Video uploaded to TikTok inbox. User needs to complete posting in TikTok app.",
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