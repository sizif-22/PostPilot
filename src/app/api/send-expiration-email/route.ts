import { NextRequest, NextResponse } from "next/server";
import { sendExpirationEmail } from "@/smtp/send-expiration-email";

export async function POST(req: NextRequest) {
  const { userEmail, platformName } = await req.json();

  try {
    const result = await sendExpirationEmail(userEmail, platformName);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error sending expiration email:", error);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}
