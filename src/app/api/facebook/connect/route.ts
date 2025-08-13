import { NextResponse } from "next/server";

interface BusinessAccount {
  id: string;
  name: string;
  pages: Page[];
}

interface Page {
  id: string;
  name: string;
  access_token: string;
  instagram_id?: string;
}

interface EnhancedResponse {
  access_token: string;
  business_accounts: BusinessAccount[];
  standalone_pages: Page[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // Step 1: Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&client_secret=${process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error?.message || "Failed to get access token");
    }

    const accessToken = tokenData.access_token;

    // Step 2: Get Business Accounts
    const businessAccountsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/businesses?access_token=${accessToken}&fields=id,name`
    );
    const businessAccountsData = await businessAccountsResponse.json();

    const businessAccounts: BusinessAccount[] = [];

    if (businessAccountsResponse.ok && businessAccountsData.data) {
      // For each business account, get its pages
      for (const business of businessAccountsData.data) {
        const businessPagesResponse = await fetch(
          `https://graph.facebook.com/v19.0/${business.id}/owned_pages?access_token=${accessToken}&fields=id,name,instagram_business_account,access_token`
        );
        const businessPagesData = await businessPagesResponse.json();

        const pages: Page[] = [];
        if (businessPagesResponse.ok && businessPagesData.data) {
          for (const page of businessPagesData.data) {
            pages.push({
              id: page.id,
              name: page.name,
              access_token: page.access_token,
              instagram_id: page.instagram_business_account?.id || undefined,
            });
          }
        }

        businessAccounts.push({
          id: business.id,
          name: business.name,
          pages: pages,
        });
      }
    } else if (businessAccountsData.error) {
      console.log(
        "Business accounts not accessible:",
        businessAccountsData.error.message
      );
      // This is not a critical error - user might not have business management permissions
    }

    // Step 3: Get standalone pages (pages the user has direct access to)
    const standalonePagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}&fields=id,name,instagram_business_account,access_token`
    );
    const standalonePagesData = await standalonePagesResponse.json();

    const standalonePages: Page[] = [];
    if (standalonePagesResponse.ok && standalonePagesData.data) {
      for (const page of standalonePagesData.data) {
        standalonePages.push({
          id: page.id,
          name: page.name,
          access_token: page.access_token,
          instagram_id: page.instagram_business_account?.id || undefined,
        });
      }
    }

    // Step 4: Return the enhanced response
    const enhancedResponse: EnhancedResponse = {
      access_token: accessToken,
      business_accounts: businessAccounts,
      standalone_pages: standalonePages,
    };

    return NextResponse.json(enhancedResponse);
  } catch (error: unknown) {
    console.error("Error in Facebook connect:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
