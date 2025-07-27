import { MediaItem } from "@/interfaces/Media";

export async function PostOnTiktok({
  accessToken,
  openId,
  message,
  imageUrls,
}: {
  accessToken: string;
  openId: string;
  message?: string;
  imageUrls: MediaItem[];
}) {
  try {
    if (!accessToken || !openId || !imageUrls)
      throw new Error("these are required accessToken || openId || imageUrls");

    if (imageUrls.length == 1 && imageUrls[0].isVideo) {
      const mediaUrl = imageUrls[0].url;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds

      let mediaResponse;
      try {
        mediaResponse = await fetch(mediaUrl, {
          signal: controller.signal,
        });
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
      const size = mediaBuffer.byteLength;

      // TikTok API chunk size requirements:
      // - For files with single chunk: chunk_size must equal video_size
      // - For multi-chunk files: chunks must be between 5MB and 64MB
      // - Last chunk can be smaller than others
      const minChunkSize = 5 * 1024 * 1024; // 5MB
      const maxChunkSize = 64 * 1024 * 1024; // 64MB

      let chunkSize;
      let numOfChunks;

      if (size <= minChunkSize) {
        // For small files (≤5MB), use single chunk equal to file size
        chunkSize = size;
        numOfChunks = 1;
      } else {
        // For larger files, use multiple chunks
        // Start with 10MB chunks as recommended
        chunkSize = Math.min(10 * 1024 * 1024, maxChunkSize);

        // Adjust chunk size if needed to avoid very small last chunk
        numOfChunks = Math.ceil(size / chunkSize);
        const lastChunkSize = size - chunkSize * (numOfChunks - 1);

        // If last chunk would be very small (< 1MB), redistribute
        if (lastChunkSize < 1024 * 1024 && numOfChunks > 1) {
          chunkSize = Math.ceil(size / numOfChunks);
          chunkSize = Math.max(chunkSize, minChunkSize);
          chunkSize = Math.min(chunkSize, maxChunkSize);
          numOfChunks = Math.ceil(size / chunkSize);
        }
      }

      console.log(`File size: ${size} bytes`);
      console.log(
        `Chunk size: ${chunkSize} bytes (${(chunkSize / 1024 / 1024).toFixed(
          2
        )} MB)`
      );
      console.log(`Number of chunks: ${numOfChunks}`);

      const response = await fetch(
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
            post_info: {
              title: message || "",
              privacy_level: "SELF_ONLY", // Use SELF_ONLY for unaudited apps
              brand_content_toggle: false,
              brand_organic_toggle: false,
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("TikTok API Error:", data);
        throw new Error(
          data.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const initData = await response.json();
      console.log("TikTok init response:", initData);

      // Upload video chunks
      const uploadUrl = initData.data.upload_url;
      if (!uploadUrl) {
        throw new Error("No upload URL received from TikTok API");
      }

      // Upload chunks
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
          console.error(`Failed to upload chunk ${chunkIndex}:`, uploadError);
          throw new Error(
            `Failed to upload chunk ${chunkIndex}: ${uploadResponse.status} ${uploadResponse.statusText}`
          );
        }

        console.log(`Uploaded chunk ${chunkIndex + 1}/${numOfChunks}`);
      }

      const publishData = await response.json();
      console.log("TikTok publish response:", publishData);

      return {
        success: true,
        publishId: initData.data?.publish_id,
        uploadUrl: initData.data?.upload_url,
        publishData,
      };
    }
  } catch (error) {
    console.error("PostOnTiktok error:", error);
    throw error; // Re-throw to handle upstream
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