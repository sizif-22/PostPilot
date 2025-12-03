import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { decrypt } from "@/utils/encryption";
import { getCreatorInfo } from "../../platforms/functions/tiktok";

export async function POST(request: Request) {
    try {
        const { channelId } = await request.json();

        if (!channelId) {
            return NextResponse.json(
                { message: "Channel ID is required" },
                { status: 400 },
            );
        }

        const channelDoc = await fs.getDoc(fs.doc(db, "Channels", channelId));
        const channel = channelDoc.data();

        if (!channel) {
            return NextResponse.json(
                { message: "Channel not found" },
                { status: 404 },
            );
        }

        if (!channel.socialMedia?.tiktok?.accessToken) {
            return NextResponse.json(
                { message: "TikTok access token not found" },
                { status: 400 },
            );
        }

        const accessToken = await decrypt(channel.socialMedia.tiktok.accessToken);
        const creatorInfo = await getCreatorInfo(accessToken);

        return NextResponse.json({ data: creatorInfo }, { status: 200 });
    } catch (error) {
        console.error("Error fetching creator info:", error);
        return NextResponse.json(
            {
                message: "Error fetching creator info",
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}
