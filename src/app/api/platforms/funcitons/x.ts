
import { MediaItem } from "@/interfaces/Media";

export async function PostOnX({
  accessToken,
  pageId,
  message,
  imageUrls,
}: {
  imageUrls?: MediaItem[];
  accessToken: any;
  pageId: any;
  message: any;
}) {
  try {
    console.log("Posting on X");
    // Mocking the post on X
    return { success: true, message: "Posted on X successfully" };
  } catch (error: any) {
    console.error("X API Error:", error);
    throw new Error(error.message || "Internal server error");
  }
}
