import { NextResponse } from "next/server";

interface LinkedInOrganization {
  id: string;
  name: string;
  urn: string;
}

interface LinkedInResponse {
  access_token: string;
  organizations: LinkedInOrganization[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
          redirect_uri: `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection/linkedin`,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("LinkedIn token error:", tokenData);
      throw new Error(
        tokenData.error_description || "Failed to get access token"
      );
    }

    const accessToken = tokenData.access_token;

    // Step 2: Get user's organizations (companies they are admin of)
    const organizationsResponse = await fetch(
      "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202405",
        },
      }
    );

    const organizationsData = await organizationsResponse.json();

    if (!organizationsResponse.ok) {
      console.error("LinkedIn organizations error:", organizationsData);
      throw new Error("Failed to fetch organizations");
    }

    // Step 3: Extract organization URNs and fetch their details
    const organizations: LinkedInOrganization[] = [];

    if (organizationsData.elements && organizationsData.elements.length > 0) {
      for (const element of organizationsData.elements) {
        if (element.organizationalTarget) {
          const orgUrn = element.organizationalTarget;

          // Fetch organization details
          const orgDetailsResponse = await fetch(
            `https://api.linkedin.com/v2/organizations/${orgUrn
              .split(":")
              .pop()}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "LinkedIn-Version": "202405",
              },
            }
          );

          if (orgDetailsResponse.ok) {
            const orgDetails = await orgDetailsResponse.json();
            organizations.push({
              id: orgDetails.id,
              name: orgDetails.name,
              urn: orgUrn,
            });
          }
        }
      }
    }

    const response: LinkedInResponse = {
      access_token: accessToken,
      organizations: organizations,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in LinkedIn connect:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
