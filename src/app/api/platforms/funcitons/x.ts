import { MediaItem } from "@/interfaces/Media";

// Helper to upload media to Twitter (X)
async function uploadMediaToX(
  mediaUrl: string,
  accessToken: string
): Promise<string> {
  // You must download the media, then upload it to Twitter's media endpoint.
  // Twitter's media upload is only available via v1.1 API.
  // This is a placeholder for the actual upload logic.
  // See: https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload

  // TODO: Download the file from mediaUrl, then upload to Twitter's media/upload endpoint.
  // Return the media_id string.
  throw new Error(
    "Media upload to X (Twitter) not implemented. Requires backend server and Twitter v1.1 API."
  );
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
  message: string;
}) {
  try {
    let media_ids: string[] = [];

    // 1. Upload media if present
    if (imageUrls && imageUrls.length > 0) {
      for (const media of imageUrls) {
        // Only images are supported in this placeholder
        if (media.url) {
          const media_id = await uploadMediaToX(media.url, accessToken);
          media_ids.push(media_id);
        }
      }
    }

    // 2. Post the tweet
    const tweetBody: any = {
      text: message,
    };
    if (media_ids.length > 0) {
      tweetBody.media = { media_ids };
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.title || "Failed to post on X");
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("X API Error:", error);
    throw new Error(error.message || "Internal server error");
  }
}
