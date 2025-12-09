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
    if (!accessToken || !openId || !media || media.length === 0) {
      throw new Error(
        "Required parameters missing: accessToken, openId, or media"
      );
    }

    const isVideo = media[0].isVideo;

    // Validate media mixing
    if (media.some((m) => m.isVideo !== isVideo)) {
      throw new Error("Cannot mix video and images in the same post");
    }

    if (isVideo && media.length !== 1) {
      throw new Error("TikTok only supports single video uploads");
    }

    // Prepare common post info
    const caption = [title, description || message].filter(Boolean).join("\n\n");

    // Privacy Logic
    const privacyLevel = privacy_level === "private"
      ? "SELF_ONLY"
      : privacy_level === "friends"
        ? "MUTUAL_FOLLOW_FRIENDS"
        : "PUBLIC_TO_EVERYONE";

    const commonPostInfo = {
      privacy_level: privacyLevel,
      disable_duet: disable_duet || false,
      disable_comment: disable_comment || false,
      disable_stitch: disable_stitch || false,
      brand_content_toggle: brand_content_toggle || false,
      brand_organic_toggle: brand_organic_toggle || false,
      branded_content_toggle: branded_content_toggle || false,
    };

    if (isVideo) {
      // --- VIDEO UPLOAD LOGIC ---
      const postInfo: any = {
        ...commonPostInfo,
        title: caption.substring(0, 2200), // Video caption is 'title'
      };

      const mediaUrl = media[0].url;
      const thumbnailUrl = media[0].thumbnailUrl;

      // Add cover image URL if thumbnail is available
      if (thumbnailUrl && thumbnailUrl.startsWith("http")) {
        postInfo.cover_image_url = thumbnailUrl;
      }

      // Download video
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
          `Failed to download media: ${mediaResponse?.status} ${mediaResponse?.statusText}`
        );
      }

      const mediaBuffer = await mediaResponse.arrayBuffer();
      const size = mediaBuffer.byteLength;

      console.log(
        `Video size: ${size} bytes (${(size / 1024 / 1024).toFixed(2)} MB)`
      );

      // Chunking logic
      const minChunkSize = 5 * 1024 * 1024;
      const maxChunkSize = 64 * 1024 * 1024;
      const preferredChunkSize = 10 * 1024 * 1024;

      let chunkSize: number;
      let totalChunkCount: number;

      if (size < minChunkSize) {
        chunkSize = size;
        totalChunkCount = 1;
      } else if (size <= maxChunkSize) {
        chunkSize = size;
        totalChunkCount = 1;
      } else {
        chunkSize = preferredChunkSize;
        totalChunkCount = Math.floor(size / chunkSize);
        if (totalChunkCount === 0) {
          totalChunkCount = 1;
          chunkSize = size;
        }
        const remainingBytes = size - chunkSize * totalChunkCount;
        const finalChunkSize = chunkSize + remainingBytes;
        const maxFinalChunkSize = 128 * 1024 * 1024;

        if (finalChunkSize > maxFinalChunkSize) {
          const targetChunks = Math.ceil(size / (maxChunkSize * 0.8));
          chunkSize = Math.floor(size / targetChunks);
          chunkSize = Math.max(chunkSize, minChunkSize);
          chunkSize = Math.min(chunkSize, maxChunkSize);
          totalChunkCount = Math.floor(size / chunkSize);
        }
      }

      const initPayload = {
        source_info: {
          source: "FILE_UPLOAD",
          video_size: size,
          chunk_size: chunkSize,
          total_chunk_count: totalChunkCount,
        },
        post_info: postInfo,
      };

      const initResponse = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/video/init/",
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
        console.error("TikTok Init Error:", errorText);
        throw new Error(`TikTok ID Error: ${errorText}`);
      }

      const initData = await initResponse.json();
      const uploadUrl = initData.data.upload_url;
      const publishId = initData.data.publish_id;

      if (!uploadUrl || !publishId) {
        throw new Error("Missing upload URL or publish ID");
      }

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunkCount; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        let end = chunkIndex === totalChunkCount - 1 ? size : start + chunkSize;
        const chunk = mediaBuffer.slice(start, end);
        const actualChunkSize = end - start;

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
          throw new Error(`Failed to upload chunk ${chunkIndex}`);
        }
      }

      // Status check (simplified reuse)
      return {
        success: true,
        publishId,
        status: "published",
        message: "Video posted successfully",
      };

    } else {
      // --- PHOTO UPLOAD LOGIC ---
      console.log("Starting TikTok Photo Upload...");

      // For Photo Mode, caption goes into 'description', title can be short title (or omitted)
      const postInfo: any = {
        ...commonPostInfo,
        title: title ? title.substring(0, 150) : undefined,
        description: caption.substring(0, 2200),
      };

      // Download all images
      const imageBuffers = await Promise.all(
        media.map(async (item) => {
          const res = await fetch(item.url);
          if (!res.ok) throw new Error(`Failed to fetch image: ${item.url}`);
          const buffer = await res.arrayBuffer();
          return { buffer, size: buffer.byteLength };
        })
      );

      const initPayload = {
        post_info: postInfo,
        source_info: {
          source: "FILE_UPLOAD",
          photo_cover_index: 1,
          photo_images: imageBuffers.map((img) => ({
            image_size: img.size,
          })),
        },
        post_mode: "DIRECT_POST",
        media_type: "PHOTO",
      };

      console.log("TikTok Photo Init Payload:", JSON.stringify(initPayload, null, 2));

      const initResponse = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/content/init/",
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
        const text = await initResponse.text();
        console.error("TikTok Photo Init Error:", text);
        try {
          const errJson = JSON.parse(text);
          throw new Error(`TikTok Photo Init Failed: ${JSON.stringify(errJson)}`);
        } catch {
          throw new Error(`TikTok Photo Init Failed: ${text}`);
        }
      }

      const initData = await initResponse.json();
      console.log("TikTok Init Response:", initData);

      const publishId = initData.data.publish_id;
      const photoImages = initData.data.photo_images;

      if (!publishId || !photoImages || !Array.isArray(photoImages)) {
        throw new Error("Invalid response from TikTok Photo Init");
      }

      // Upload images
      for (let i = 0; i < imageBuffers.length; i++) {
        const uploadUrl = photoImages[i].upload_url;
        if (!uploadUrl) {
          throw new Error(`Missing upload_url for image ${i}`);
        }

        console.log(`Uploading image ${i + 1}/${imageBuffers.length}...`);

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/jpeg", // Assuming JPEG or generic image type. TikTok detects?
            // "Content-Length": imageBuffers[i].size.toString()
          },
          body: imageBuffers[i].buffer,
        });

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text();
          throw new Error(`Failed to upload image ${i}: ${errText}`);
        }
      }

      console.log("All images uploaded successfully");

      return {
        success: true,
        publishId,
        status: "published",
        message: "Photos posted successfully",
      };
    }

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
