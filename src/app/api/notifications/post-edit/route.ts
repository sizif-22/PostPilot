import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";

import { Channel } from "@/interfaces/Channel";
import { sendPostEditNotification } from "@/smtp/post-edit";

export async function POST(request: Request) {
    try {
        const { channelId, postId, postMessage, editorName } = await request.json();

        if (!channelId || !postId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const channelDoc = await fs.getDoc(fs.doc(db, "Channels", channelId));
        if (!channelDoc.exists()) {
            return NextResponse.json({ message: "Channel not found" }, { status: 404 });
        }

        const channel = channelDoc.data() as Channel;

        // Find owner or fallback to first member
        const owner = channel.TeamMembers.find(m => m.role === 'Owner') || channel.TeamMembers[0];

        if (!owner || !owner.email) {
            console.error("No owner email found for channel", channelId);
            return NextResponse.json({ message: "Owner not found" }, { status: 404 });
        }

        const emailBody = `
      <h2>Post Edited</h2>
      <p>A post has been edited in your channel <b>${channel.name}</b>.</p>
      <p><b>Editor:</b> ${editorName || 'Unknown'}</p>
      <p><b>Post ID:</b> ${postId}</p>
      <p><b>Content Preview:</b><br>${postMessage ? postMessage.substring(0, 100) + (postMessage.length > 100 ? '...' : '') : 'No textual content'}</p>
      <br>
      <p>Login to PostPilot to view the full details.</p>
    `;

        await sendPostEditNotification(owner.email, channelId, emailBody);

        console.log(`Edit notification email sent to ${owner.email} for post ${postId}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending edit notification:", error);
        return NextResponse.json({ message: "Internal Error", error: String(error) }, { status: 500 });
    }
}
