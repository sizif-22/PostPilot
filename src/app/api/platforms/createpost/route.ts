import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { Channel, Post } from "@/interfaces/Channel";
export async function POST(request: Request) {
  const { channelId, postId }: { channelId: string; postId: string } =
    await request.json();
  const channel: Channel | undefined = (
    await fs.getDoc(fs.doc(db, "Channels", channelId))
  ).data() as Channel;

  if (!channel) {
    return NextResponse.json({ message: "Channel not found" }, { status: 400 });
  }
  const post: Post = channel.posts.find((p) => p.id === postId) as Post;

  if (!post) {
    return NextResponse.json(
      { message: "Post Not found or has been deleted" },
      { status: 400 }
    );
  }
  post.platforms?.forEach(async (platform) => {
    switch (platform) {
      case "facebook": {
      }
      case "instagram": {
        const response = await fetch("/api/instagram/createpost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: channel.socialMedia?.instagram.pageAccessToken,
            pageId: channel.socialMedia?.instagram.instagramId,
            message: post.message || post.content,
            imageUrls: post.imageUrls,
          }),
        });
        console.log(
          response.ok
            ? "Post Published successfully on Instagram."
            : "Post didn't get published on Instagram"
        );
      }
    }
  });
  return NextResponse.json(
    { message: "Post published successfully." },
    { status: 200 }
  );
}
