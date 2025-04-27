// app/api/facebook/pages/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("access_token");

  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token provided" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch pages");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
