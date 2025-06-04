import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
     const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&client_secret=${process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET}&redirect_uri=https://postpilot-22.vercel.app/connection&code=${code}`;
 
     const response = await fetch(tokenUrl);
     const data = await response.json();
 
     if (!response.ok) {
       throw new Error(data.error?.message || "Failed to get access token");
     }
 
     return NextResponse.json(data);
   } catch (error: unknown) {
     console.error("Error getting access token:", error);
     if (error instanceof Error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }
     return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
   }
}
