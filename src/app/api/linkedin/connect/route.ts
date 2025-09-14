import { NextResponse } from "next/server";

interface LinkedInOrganization {
  id: string;
  name: string;
  urn: string;
  type: 'organization';
}

interface LinkedInPersonalAccount {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  type: 'personal';
}

interface LinkedInResponse {
  access_token: string;
  personal_account: LinkedInPersonalAccount | null;
  organizations: LinkedInOrganization[];
  debug_info?: {
    personal_account_error?: string;
    organizations_error?: string;
  };
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
    console.log("Exchanging code for access token...");
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
    console.log("Access token obtained successfully");

    // Debug info
    const debugInfo: any = {};

    // Step 2: Try to get personal profile
    let personalAccount: LinkedInPersonalAccount | null = null;
    
    console.log("Attempting to fetch personal profile...");
    try {
      // Try userinfo endpoint first (requires 'openid' scope)
      console.log("Trying userinfo endpoint...");
      const profileResponse = await fetch(
        "https://api.linkedin.com/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(`Userinfo response status: ${profileResponse.status}`);
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log("Userinfo response data:", profileData);
        personalAccount = {
          id: profileData.sub,
          firstName: profileData.given_name || 'LinkedIn',
          lastName: profileData.family_name || 'User',
          name: profileData.name || 'LinkedIn User',
          type: 'personal'
        };
        console.log("Personal profile fetched successfully via userinfo");
      } else {
        const errorData = await profileResponse.json();
        console.log("Userinfo failed with error:", errorData);
        debugInfo.personal_account_error = `Userinfo failed: ${profileResponse.status} - ${JSON.stringify(errorData)}`;
        
        // Try basic profile endpoint as fallback (requires 'profile' scope)
        console.log("Userinfo failed, trying basic profile endpoint...");
        const basicProfileResponse = await fetch(
          "https://api.linkedin.com/v2/people/~:(id,firstName,lastName)",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log(`Basic profile response status: ${basicProfileResponse.status}`);

        if (basicProfileResponse.ok) {
          const basicData = await basicProfileResponse.json();
          console.log("Basic profile response data:", basicData);
          personalAccount = {
            id: basicData.id,
            firstName: basicData.firstName?.localized?.en_US || 'LinkedIn',
            lastName: basicData.lastName?.localized?.en_US || 'User',
            name: `${basicData.firstName?.localized?.en_US || 'LinkedIn'} ${basicData.lastName?.localized?.en_US || 'User'}`,
            type: 'personal'
          };
          console.log("Personal profile fetched successfully via basic profile");
        } else {
          const basicErrorData = await basicProfileResponse.json();
          console.log("Basic profile also failed:", basicErrorData);
          debugInfo.personal_account_error += ` | Basic profile failed: ${basicProfileResponse.status} - ${JSON.stringify(basicErrorData)}`;
        }
      }
    } catch (profileError) {
      console.log("Personal profile fetch failed with exception:", profileError);
      debugInfo.personal_account_error = `Exception: ${profileError}`;
    }

    // Step 3: Get organizations
    console.log("Fetching organizations...");
    const organizations: LinkedInOrganization[] = [];
    
    try {
      const organizationsResponse = await fetch(
        "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "LinkedIn-Version": "202405",
          },
        }
      );

      console.log(`Organizations response status: ${organizationsResponse.status}`);

      if (organizationsResponse.ok) {
        const organizationsData = await organizationsResponse.json();
        console.log("Organizations response data:", organizationsData);

        if (organizationsData.elements && organizationsData.elements.length > 0) {
          console.log(`Found ${organizationsData.elements.length} organization(s)`);
          
          for (const element of organizationsData.elements) {
            if (element.organizationalTarget) {
              const orgUrn = element.organizationalTarget;
              const orgId = orgUrn.split(":").pop();

              try {
                const orgDetailsResponse = await fetch(
                  `https://api.linkedin.com/v2/organizations/${orgId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      "LinkedIn-Version": "202405",
                    },
                  }
                );

                if (orgDetailsResponse.ok) {
                  const orgDetails = await orgDetailsResponse.json();
                  console.log("Organization details:", orgDetails);
                  
                  // Handle localized organization name
                  let organizationName = 'Unknown Organization';
                  if (typeof orgDetails.name === 'string') {
                    organizationName = orgDetails.name;
                  } else if (orgDetails.name?.localized) {
                    // Try different locales, fallback to first available
                    organizationName = orgDetails.name.localized.en_US || 
                                    orgDetails.name.localized[Object.keys(orgDetails.name.localized)[0]] ||
                                    'Unknown Organization';
                  }
                  
                  organizations.push({
                    id: orgDetails.id,
                    name: organizationName,
                    urn: orgUrn,
                    type: 'organization'
                  });
                  console.log(`Added organization: ${organizationName}`);
                } else {
                  const orgErrorData = await orgDetailsResponse.json();
                  console.warn(`Failed to fetch details for organization ${orgId}:`, orgErrorData);
                }
              } catch (orgError) {
                console.warn(`Exception fetching details for organization ${orgId}:`, orgError);
              }
            }
          }
        } else {
          console.log("No organizations found in response");
        }
      } else {
        const errorData = await organizationsResponse.json();
        console.log("Organizations request failed:", errorData);
        debugInfo.organizations_error = `Organizations failed: ${organizationsResponse.status} - ${JSON.stringify(errorData)}`;
      }
    } catch (orgsError) {
      console.warn("Organizations fetch failed with exception:", orgsError);
      debugInfo.organizations_error = `Exception: ${orgsError}`;
    }

    // Check if we have at least one account option
    if (!personalAccount && organizations.length === 0) {
      return NextResponse.json(
        { 
          error: "No LinkedIn accounts available. Please make sure you have the correct scopes (openid, profile) and are an administrator of at least one LinkedIn organization.",
          debug_info: debugInfo
        },
        { status: 400 }
      );
    }

    const response: LinkedInResponse = {
      access_token: accessToken,
      personal_account: personalAccount,
      organizations: organizations,
      debug_info: debugInfo
    };

    console.log(`Returning ${personalAccount ? 'personal account + ' : ''}${organizations.length} organization(s)`);
    console.log("Debug info:", debugInfo);
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