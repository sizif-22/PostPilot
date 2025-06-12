import { NextResponse } from "next/server";
import { editPost } from "@/firebase/channel.firestore";

export async function PUT(request: Request) {
    const { postId, channelId, post } = await request.json();
    const response = await fetch(`https://graph.facebook.com/v18.0/${postId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`
        }
    });
    if (!response.ok) {
        return NextResponse.json({ error: "Failed to edit post" }, { status: 500 });
    }
    // Edit post in db
    await editPost(postId, channelId, post);
    return NextResponse.json({ message: "Post edited" }, { status: 200 });
}