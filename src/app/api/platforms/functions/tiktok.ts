// tiktok.ts - Fixed version
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
    const thumbnailUrl = media[0].thumbnailUrl; // FIXED: Extract thumbnail properly

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

    // Calculate chunk size properly
    const minChunkSize = 5 * 1024 * 1024; // 5MB
    const maxChunkSize = 64 * 1024 * 1024; // 64MB

    let chunkSize, numOfChunks;

    if (size <= minChunkSize) {
      chunkSize = size;
      numOfChunks = 1;
    } else {
      chunkSize = Math.min(10 * 1024 * 1024, maxChunkSize);
      numOfChunks = Math.ceil(size / chunkSize);
      const lastChunkSize = size - chunkSize * (numOfChunks - 1);

      if (lastChunkSize < 1024 * 1024 && numOfChunks > 1) {
        chunkSize = Math.ceil(size / numOfChunks);
        chunkSize = Math.max(chunkSize, minChunkSize);
        chunkSize = Math.min(chunkSize, maxChunkSize);
        numOfChunks = Math.ceil(size / chunkSize);
      }
    }

    // FIXED: Proper post_info structure with thumbnail
    const postInfo: any = {
      title: message || "",
      privacy_level: "PUBLIC_TO_EVERYONE",
      brand_content_toggle: false,
      brand_organic_toggle: false,
    };

    // FIXED: Add thumbnail properly if available
    if (thumbnailUrl) {
      postInfo.cover_image_url = thumbnailUrl;
    }

    // Step 1: Initialize inbox upload
    const initResponse = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_info: {
            source: "FILE_UPLOAD",
            video_size: size,
            chunk_size: chunkSize,
            total_chunk_count: numOfChunks,
          },
          post_info: postInfo, // FIXED: Use properly structured post_info
        }),
      }
    );

    if (!initResponse.ok) {
      const data = await initResponse.json();
      console.error("TikTok API Error:", data);
      throw new Error(data.error?.message || `HTTP ${initResponse.status}: ${initResponse.statusText}`);
    }

    const initData = await initResponse.json();
    const uploadUrl = initData.data.upload_url;
    const publishId = initData.data.publish_id;

    if (!uploadUrl || !publishId) {
      throw new Error("Missing upload URL or publish ID from TikTok API");
    }

    // Step 2: Upload chunks
    for (let chunkIndex = 0; chunkIndex < numOfChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, size);
      const chunk = mediaBuffer.slice(start, end);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Range": `bytes ${start}-${end - 1}/${size}`,
        },
        body: chunk,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text();
        throw new Error(`Failed to upload chunk ${chunkIndex}: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
    }

    return {
      success: true,
      publishId: publishId,
      uploadUrl: uploadUrl,
      status: "uploaded_to_inbox",
      message: "Video uploaded to TikTok inbox. User needs to complete posting in TikTok app.",
    };
  } catch (error) {
    console.error("PostOnTiktok error:", error);
    throw error;
  }
}