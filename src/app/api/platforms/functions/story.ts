// story.ts - Stories publishing functions for Facebook and Instagram
import { MediaItem } from "@/interfaces/Media";

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 3,
    delayMs: number = 2000
): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fetch(url, options);
        } catch (error: any) {
            if (error.cause?.code === "ETIMEDOUT" && i < maxRetries - 1) {
                console.warn(`Fetch timed out. Retrying in ${delayMs}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            } else {
                throw error;
            }
        }
    }
    throw new Error("Max retries reached");
}

/**
 * Publishes an Instagram Story
 * Stories require exactly 1 media item (image or video)
 */
export async function PostInstagramStory({
    accessToken,
    pageId,
    media,
}: {
    accessToken: string;
    pageId: string; // Instagram Business Account ID
    media: MediaItem[];
}): Promise<any> {
    if (!accessToken || !pageId) {
        throw new Error("Instagram access token and page ID are required");
    }

    if (!media || media.length === 0) {
        throw new Error("Stories require at least one media item");
    }

    if (media.length > 1) {
        throw new Error("Stories can only contain a single image or video");
    }

    const mediaItem = media[0];
    console.log("Publishing Instagram Story...", {
        isVideo: mediaItem.isVideo,
        hasUrl: !!mediaItem.url,
    });

    // Create the story media container
    const mediaData: Record<string, string> = {
        media_type: "STORIES",
        access_token: accessToken,
    };

    if (mediaItem.isVideo) {
        mediaData.video_url = mediaItem.url;
    } else {
        mediaData.image_url = mediaItem.url;
    }

    // Step 1: Create the story container
    const createResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${pageId}/media`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(mediaData),
        }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok) {
        console.error("Instagram Story container creation failed:", createData);
        throw new Error(
            createData.error?.message || "Failed to create Instagram Story container"
        );
    }

    console.log("Instagram Story container created:", createData);

    // For video stories, wait for processing
    if (mediaItem.isVideo && createData.id) {
        console.log("Waiting for video story processing...");
        await waitForContainerReady(createData.id, accessToken);
    }

    // Step 2: Publish the story
    const publishResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${pageId}/media_publish`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                creation_id: createData.id,
                access_token: accessToken,
            }),
        }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
        console.error("Instagram Story publish failed:", publishData);
        throw new Error(
            publishData.error?.message || "Failed to publish Instagram Story"
        );
    }

    console.log("Instagram Story published successfully:", publishData);
    return publishData;
}

/**
 * Publishes a Facebook Page Story
 * Stories require exactly 1 media item (image or video)
 */
export async function PostFacebookStory({
    accessToken,
    pageId,
    media,
}: {
    accessToken: string;
    pageId: string;
    media: MediaItem[];
}): Promise<any> {
    if (!accessToken || !pageId) {
        throw new Error("Facebook access token and page ID are required");
    }

    if (!media || media.length === 0) {
        throw new Error("Stories require at least one media item");
    }

    if (media.length > 1) {
        throw new Error("Stories can only contain a single image or video");
    }

    // Get page access token
    const pageAccessToken = await getPageAccessToken(pageId, accessToken);
    const mediaItem = media[0];

    console.log("Publishing Facebook Page Story...", {
        isVideo: mediaItem.isVideo,
        hasUrl: !!mediaItem.url,
    });

    if (mediaItem.isVideo) {
        // Video Story - use video_stories endpoint
        return await uploadFacebookVideoStory(pageId, pageAccessToken, mediaItem);
    } else {
        // Photo Story - use photo_stories endpoint
        return await uploadFacebookPhotoStory(pageId, pageAccessToken, mediaItem);
    }
}

async function getPageAccessToken(
    pageId: string,
    userAccessToken: string
): Promise<string> {
    if (!pageId || pageId === "0") {
        console.log("Using provided token as page token");
        return userAccessToken;
    }

    try {
        const response = await fetchWithRetry(
            `https://graph.facebook.com/v19.0/${pageId}?fields=access_token,name&access_token=${userAccessToken}`,
            { method: "GET" }
        );
        const data = await response.json();
        if (data.access_token) {
            console.log("Using page access token for:", data.name);
            return data.access_token;
        } else {
            console.warn("Could not retrieve page-specific access token, using user token");
            return userAccessToken;
        }
    } catch (error) {
        console.error("Error fetching page access token:", error);
        return userAccessToken;
    }
}

async function uploadFacebookPhotoStory(
    pageId: string,
    pageAccessToken: string,
    mediaItem: MediaItem
): Promise<any> {
    console.log("Uploading Facebook Photo Story...");

    // Step 1: Upload the photo first (unpublished)
    const uploadResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${pageId}/photos`,
        {
            method: "POST",
            body: new URLSearchParams({
                url: mediaItem.url,
                published: "false",
                access_token: pageAccessToken,
            }),
        }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
        console.error("Facebook photo upload failed:", uploadData);
        throw new Error(uploadData.error?.message || "Failed to upload photo for story");
    }

    console.log("Photo uploaded, creating story with photo_id:", uploadData.id);

    // Step 2: Create the photo story
    const storyResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${pageId}/photo_stories`,
        {
            method: "POST",
            body: new URLSearchParams({
                photo_id: uploadData.id,
                access_token: pageAccessToken,
            }),
        }
    );

    const storyData = await storyResponse.json();

    if (!storyResponse.ok) {
        console.error("Facebook Photo Story creation failed:", storyData);
        throw new Error(storyData.error?.message || "Failed to create Facebook Photo Story");
    }

    console.log("Facebook Photo Story published successfully:", storyData);
    return storyData;
}

async function uploadFacebookVideoStory(
    pageId: string,
    pageAccessToken: string,
    mediaItem: MediaItem
): Promise<any> {
    console.log("Uploading Facebook Video Story...");

    // Step 1: Initialize the video upload session
    const initResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${pageId}/video_stories`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                upload_phase: "start",
                access_token: pageAccessToken,
            }),
        }
    );

    const initData = await initResponse.json();

    if (!initResponse.ok) {
        console.error("Facebook video story init failed:", initData);
        throw new Error(initData.error?.message || "Failed to initialize video story upload");
    }

    const { video_id, upload_url } = initData;
    console.log("Video story upload session created:", { video_id });

    // Step 2: Upload the video file using file_url
    const uploadResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${video_id}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                access_token: pageAccessToken,
                file_url: mediaItem.url,
            }),
        }
    );

    if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("Facebook video story upload failed:", errorData);
        throw new Error(errorData.error?.message || "Failed to upload video for story");
    }

    console.log("Video uploaded successfully");

    // Step 3: Finish the upload and publish
    const finishResponse = await fetchWithRetry(
        `https://graph.facebook.com/v19.0/${pageId}/video_stories`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                video_id: video_id,
                upload_phase: "finish",
                access_token: pageAccessToken,
            }),
        }
    );

    const finishData = await finishResponse.json();

    if (!finishResponse.ok) {
        console.error("Facebook video story finish failed:", finishData);
        throw new Error(finishData.error?.message || "Failed to publish Facebook Video Story");
    }

    console.log("Facebook Video Story published successfully:", finishData);
    return finishData;
}

async function waitForContainerReady(
    containerId: string,
    accessToken: string,
    maxAttempts: number = 30,
    delayMs: number = 3000
): Promise<boolean> {
    console.log(`Checking container status for ID: ${containerId}`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const statusResponse = await fetchWithRetry(
                `https://graph.facebook.com/v19.0/${containerId}?fields=status_code,status&access_token=${accessToken}`,
                { method: "GET" }
            );
            const statusData = await statusResponse.json();

            if (!statusResponse.ok) {
                console.warn(`Status check attempt ${attempt} failed:`, statusData);
                if (attempt === maxAttempts) {
                    throw new Error(statusData.error?.message || "Failed to check container status");
                }
                continue;
            }

            console.log(
                `Container status (attempt ${attempt}):`,
                statusData.status_code || statusData.status
            );

            if (statusData.status_code === "FINISHED" || statusData.status === "FINISHED") {
                console.log("Container is ready!");
                return true;
            } else if (statusData.status_code === "ERROR" || statusData.status === "ERROR") {
                throw new Error(
                    `Container processing failed: ${JSON.stringify(statusData)}`
                );
            }

            if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        } catch (error) {
            console.warn(`Error checking container status (attempt ${attempt}):`, error);
            if (attempt === maxAttempts) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    console.warn("Container did not become ready within expected time, proceeding anyway...");
    return false;
}
