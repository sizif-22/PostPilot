import { NextRequest, NextResponse } from "next/server";
import { sendInvitation } from "@/smtp/invitation";
export async function POST(req: NextRequest) {
  const {
    sender,
    receiver,
    channelId,
  }: { sender: string; receiver: string; channelId: string } = await req.json();
  try {
    const result = await sendInvitation(sender, receiver, channelId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed", error }, { status: 401 });
  }
}
