import { NextResponse } from "next/server";
import { deletePost } from "@/firebase/channel.firestore";

export async function DELETE(request: Request) {
    const { postId, channelId } = await request.json();

    // Delete post from facebook
    const response = await fetch(`https://graph.facebook.com/v18.0/${postId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`
        }
    });
    if (!response.ok) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
    // Delete post from db
    await deletePost(postId, channelId);
    return NextResponse.json({ message: "Post deleted" }, { status: 200 });
}