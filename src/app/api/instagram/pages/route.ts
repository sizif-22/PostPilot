import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("access_token");

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 400 }
    );
  }

  try {
    // First, get the user's pages that have Instagram accounts connected
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}&fields=id,name,access_token,instagram_business_account`
    );

    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      throw new Error(pagesData.error?.message || "Failed to fetch pages");
    }

    // Filter pages that have Instagram business accounts
    const instagramPages = [];

    for (const page of pagesData.data) {
      if (page.instagram_business_account) {
        // Get Instagram account details
        const instagramResponse = await fetch(
          `https://graph.facebook.com/v19.0/${page.instagram_business_account.id}?access_token=${page.access_token}&fields=id,username,name,profile_picture_url`
        );

        const instagramData = await instagramResponse.json();

        if (instagramResponse.ok) {
          instagramPages.push({
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
            instagramId: instagramData.id,
            instagramUsername: instagramData.username,
            instagramName: instagramData.name,
            profilePictureUrl: instagramData.profile_picture_url,
          });
        }
      }
    }

    return NextResponse.json({ pages: instagramPages });
  } catch (error: unknown) {
    console.error("Error fetching Instagram pages:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
