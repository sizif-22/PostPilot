
import { decrypt } from "@/utils/encryption";
import { PostOnLinkedInProps } from "./interfaces";
import { MediaItem } from "@/interfaces/Media";

export const PostOnLinkedIn = async ({
  accessToken,
  author,
  message,
  media,
}: PostOnLinkedInProps) => {
  try {
    const decryptedAccessToken = await decrypt(accessToken);

    if (!media || media.length === 0) {
      // Text-only post
      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedAccessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: `urn:li:person:${author}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: message,
              },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create text-only post");
      }
      return data;
    } else {
      const mediaAssets = [];
      for (const mediaItem of media) {
        const recipe = mediaItem.isVideo
          ? "urn:li:digitalmediaRecipe:feedshare-video"
          : "urn:li:digitalmediaRecipe:feedshare-image";

        const uploadUrlResponse = await fetch(
          `https://api.linkedin.com/v2/assets?action=registerUpload`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${decryptedAccessToken}`,
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify({
              registerUploadRequest: {
                recipes: [recipe],
                owner: `urn:li:person:${author}`,
                serviceRelationships: [
                  {
                    relationshipType: "OWNER",
                    identifier: "urn:li:userGeneratedContent",
                  },
                ],
              },
            }),
          }
        );

        const uploadUrlData = await uploadUrlResponse.json();
        if (!uploadUrlResponse.ok) {
          throw new Error(uploadUrlData.message || "Failed to register upload");
        }

        const uploadUrl =
          uploadUrlData.value.uploadMechanism[
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
          ].uploadUrl;
        const asset = uploadUrlData.value.asset;

        const mediaResponse = await fetch(mediaItem.url);
        const mediaBlob = await mediaResponse.blob();

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": mediaBlob.type,
            Authorization: `Bearer ${decryptedAccessToken}`,
          },
          body: mediaBlob,
        });

        if (uploadResponse.status !== 201) {
          throw new Error("Failed to upload media");
        }

        mediaAssets.push({
          status: "READY",
          description: {
            text: "Center stage!",
          },
          media: asset,
          title: {
            text: "LinkedIn Share",
          },
        });
      }

      const shareMediaCategory = media[0].isVideo ? "VIDEO" : "IMAGE";

      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedAccessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: `urn:li:person:${author}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: message,
              },
              shareMediaCategory,
              media: mediaAssets,
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create post with media");
      }
      return data;
    }
  } catch (error) {
    console.error("Error in PostOnLinkedIn:", error);
    throw error;
  }
};
