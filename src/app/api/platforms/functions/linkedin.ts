import { decrypt, isValidEncryptedFormat } from "@/utils/encryption";
import { PostOnLinkedInProps } from "./interfaces";
import { MediaItem } from "@/interfaces/Media";

// ... your existing fetch function stays the same ...

export const PostOnLinkedIn = async ({
  accessToken,
  author,
  message,
  media,
  accountType,
  urn,
}: {
  accessToken: string;
  author: string;
  message: string;
  media: MediaItem[];
  accountType: string;
  urn: string;
}) => {
  try {
    // Validate required parameters
    let authorUrn: string;

    if (accountType === "organization") {
      // For organizations: urn:li:organization:10334549
      authorUrn = urn || `urn:li:organization:${author}`;
    } else {
      // For personal accounts: urn:li:person:PERSON_ID
      authorUrn = `urn:li:person:${author}`;
    }
    if (!accessToken) throw new Error("LinkedIn access token is required");
    if (!author) throw new Error("LinkedIn author/person ID is required");
    if (!message?.trim())
      throw new Error("Message content is required for LinkedIn posts");

    let decryptedAccessToken: string;

    // Check if the token is in the expected encrypted format
    if (isValidEncryptedFormat(accessToken)) {
      // Token is properly encrypted, decrypt it
      console.log("LinkedIn token is in encrypted format, decrypting...");
      decryptedAccessToken = await decrypt(accessToken);
    } else {
      // Token is not in the expected format - treat as plain token
      console.log(
        "LinkedIn token is not in expected encrypted format, treating as plain token"
      );

      // Check if it looks like a valid LinkedIn access token
      if (accessToken.length > 50 && /^[A-Za-z0-9+/=_-]+$/.test(accessToken)) {
        decryptedAccessToken = accessToken;
        console.log(
          "Using LinkedIn token as-is (appears to be plain access token)"
        );
      } else {
        throw new Error("LinkedIn access token format is not recognized");
      }
    }

    // Validate media if present
    if (
      media &&
      (!Array.isArray(media) || media.some((item) => !item || !item.url))
    ) {
      throw new Error("Invalid media items provided");
    }

    const hasMedia = media && media.length > 0;
    const hasVideo = hasMedia && media.some((item) => item.isVideo);
    const hasImage = hasMedia && media.some((item) => !item.isVideo);

    // LinkedIn doesn't support mixing videos and images
    if (hasVideo && hasImage) {
      throw new Error(
        "LinkedIn does not support mixing videos and images in the same post"
      );
    }

    // LinkedIn supports only one video per post
    if (hasVideo && media.filter((item) => item.isVideo).length > 1) {
      throw new Error("LinkedIn supports only one video per post");
    }

    if (!hasMedia) {
      // Text-only post
      console.log("Publishing text-only post to LinkedIn...");
      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedAccessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: authorUrn,
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
        console.error("LinkedIn text-only post error:", data);
        throw new Error(
          data.message ||
            data.error?.message ||
            "Failed to create text-only post on LinkedIn"
        );
      }
      console.log("Text-only post published successfully on LinkedIn:", data);
      return data;
    } else {
      // Post with media
      console.log(
        `Publishing post with ${media.length} media item(s) to LinkedIn...`
      );
      const mediaAssets = [];

      for (let i = 0; i < media.length; i++) {
        const mediaItem = media[i];
        console.log(`Processing media item ${i + 1}/${media.length}:`, {
          url: mediaItem.url,
          isVideo: mediaItem.isVideo,
        });

        const recipe = mediaItem.isVideo
          ? "urn:li:digitalmediaRecipe:feedshare-video"
          : "urn:li:digitalmediaRecipe:feedshare-image";

        // Step 1: Register upload
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
                owner: authorUrn, // Use the correct authorUrn here
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
          console.error("LinkedIn register upload error:", uploadUrlData);
          throw new Error(
            uploadUrlData.message ||
              uploadUrlData.error?.message ||
              "Failed to register upload for LinkedIn"
          );
        }

        const uploadUrl =
          uploadUrlData.value.uploadMechanism[
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
          ].uploadUrl;
        const asset = uploadUrlData.value.asset;

        // Step 2: Fetch and upload media
        console.log("Fetching media from URL:", mediaItem.url);
        const mediaResponse = await fetch(mediaItem.url, { method: "GET" });
        if (!mediaResponse.ok) {
          throw new Error(`Failed to fetch media from URL: ${mediaItem.url}`);
        }
        const mediaBlob = await mediaResponse.blob();

        console.log("Uploading media to LinkedIn...");
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": mediaBlob.type,
            Authorization: `Bearer ${decryptedAccessToken}`,
          },
          body: mediaBlob,
        });

        if (uploadResponse.status !== 201) {
          const errorText = await uploadResponse.text();
          console.error("LinkedIn media upload failed:", errorText);
          throw new Error(`Failed to upload media to LinkedIn: ${errorText}`);
        }

        console.log(`Media item ${i + 1} uploaded successfully`);
        mediaAssets.push({
          status: "READY",
          description: {
            text: "Shared via PostPilot",
          },
          media: asset,
          title: {
            text: "PostPilot Share",
          },
        });
      }

      // Step 3: Create the post
      const shareMediaCategory = media[0].isVideo ? "VIDEO" : "IMAGE";
      console.log(
        `Creating LinkedIn post with ${shareMediaCategory.toLowerCase()}...`
      );

      // Fix: Use the correct author URN format for media posts
      let postAuthorUrn: string;
      if (accountType === "organization") {
        // For organizations, use urn:li:organization format
        postAuthorUrn = urn || `urn:li:organization:${author}`;
      } else {
        // For personal accounts, use urn:li:person format (not urn:li:member)
        postAuthorUrn = `urn:li:person:${author}`;
      }

      console.log("Using author URN for post creation:", postAuthorUrn);

      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedAccessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: postAuthorUrn, // Use the corrected author URN
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
        console.error("LinkedIn post with media error:", data);
        throw new Error(
          data.message ||
            data.error?.message ||
            "Failed to create post with media on LinkedIn"
        );
      }
      console.log("Post with media published successfully on LinkedIn:", data);
      return data;
    }
  } catch (error) {
    console.error("Error in PostOnLinkedIn:", error);
    // Re-throw with more context if it's a generic error
    if (error instanceof Error) {
      throw new Error(`LinkedIn posting failed: ${error.message}`);
    }
    throw new Error("LinkedIn posting failed: Unknown error occurred");
  }
};