interface LinkedInOrganization {
  id: string;
  name: string;
  urn: string;
  type: 'organization';
  vanityName?: string;
  profileUrl?: string;
}

interface LinkedInPersonalAccount {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  type: 'personal';
  vanityName?: string;
  profileUrl?: string;
  profilePicture?: string;
  headline?: string;
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

export async function getOrganizations(code: string): Promise<LinkedInResponse> {
  if (!code) {
    throw { error: 'Missing authorization code' };
  }

  try {
    // Step 1: Exchange authorization code for access token
    console.log('Exchanging code for access token...');
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection/linkedin`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('LinkedIn token error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    const accessToken = tokenData.access_token;
    console.log('Access token obtained successfully');

    // Debug info
    const debugInfo: { [key: string]: string } = {};

    // Step 2: Get personal profile using multiple approaches
    let personalAccount: LinkedInPersonalAccount | null = null;

    console.log('Attempting to fetch personal profile...');

    // Try OpenID userinfo endpoint first (most reliable)
    try {
      console.log('Trying OpenID userinfo endpoint...');
      const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(`Userinfo response status: ${userinfoResponse.status}`);

      if (userinfoResponse.ok) {
        const userinfoData = await userinfoResponse.json();
        console.log('Userinfo response data:', userinfoData);

        personalAccount = {
          id: userinfoData.sub,
          firstName: userinfoData.given_name || 'LinkedIn',
          lastName: userinfoData.family_name || 'User',
          name: userinfoData.name || 'LinkedIn User',
          type: 'personal',
          profilePicture: userinfoData.picture,
        };

        console.log('Personal profile fetched successfully via userinfo');
      } else {
        const errorData = await userinfoResponse.json();
        console.log('Userinfo failed with error:', errorData);
        debugInfo.userinfo_error = `${userinfoResponse.status} - ${JSON.stringify(errorData)}`;
      }
    } catch (userinfoError) {
      console.log('Userinfo endpoint failed:', userinfoError);
      debugInfo.userinfo_error = `Exception: ${userinfoError}`;
    }

    // Try basic profile endpoint if userinfo didn't work or for additional data
    if (!personalAccount) {
      try {
        console.log('Trying basic profile endpoint...');
        const profileResponse = await fetch(
          'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline)',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0',
            },
          },
        );

        console.log(`Basic profile response status: ${profileResponse.status}`);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('Basic profile response data:', profileData);

          // Extract profile picture URL if available
          let profilePicture = null;
          if (profileData.profilePicture?.displayImage?.elements?.length > 0) {
            const imageElement = profileData.profilePicture.displayImage.elements[0];
            if (imageElement.identifiers?.length > 0) {
              profilePicture = imageElement.identifiers[0].identifier;
            }
          }

          personalAccount = {
            id: profileData.id,
            firstName: profileData.firstName?.localized?.en_US || 'LinkedIn',
            lastName: profileData.lastName?.localized?.en_US || 'User',
            name: `${profileData.firstName?.localized?.en_US || 'LinkedIn'} ${profileData.lastName?.localized?.en_US || 'User'}`,
            type: 'personal',
            profilePicture,
            headline: profileData.headline?.localized?.en_US,
          };

          console.log('Personal profile fetched successfully via basic profile');
        } else {
          const errorData = await profileResponse.json();
          console.log('Basic profile failed:', errorData);
          debugInfo.basic_profile_error = `${profileResponse.status} - ${JSON.stringify(errorData)}`;
        }
      } catch (profileError) {
        console.log('Basic profile fetch failed:', profileError);
        debugInfo.basic_profile_error = `Exception: ${profileError}`;
      }
    }

    // Try to get vanity name and profile URL if we have personal account
    if (personalAccount) {
      try {
        console.log('Fetching vanity name for personal account...');
        // Use the correct endpoint for current LinkedIn API
        const vanityResponse = await fetch(
          `https://api.linkedin.com/v2/people/(id:${personalAccount.id})?projection=(vanityName,publicProfileUrl)`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'LinkedIn-Version': '202405',
            },
          },
        );

        if (vanityResponse.ok) {
          const vanityData = await vanityResponse.json();
          console.log('Vanity name response:', vanityData);

          if (vanityData.vanityName) {
            personalAccount.vanityName = vanityData.vanityName;
            personalAccount.profileUrl = `https://www.linkedin.com/in/${vanityData.vanityName}/`;
          } else if (vanityData.publicProfileUrl) {
            personalAccount.profileUrl = vanityData.publicProfileUrl;
          }

          console.log('Vanity name/URL fetched successfully');
        } else {
          const errorData = await vanityResponse.json();
          console.log('Vanity name fetch failed:', errorData);
          debugInfo.vanity_error = `${vanityResponse.status} - ${JSON.stringify(errorData)}`;

          // Fallback: try the basic profile endpoint which might have vanity name
          try {
            console.log('Trying fallback vanity name fetch...');
            const fallbackResponse = await fetch(
              `https://api.linkedin.com/v2/people/(id:${personalAccount.id})?projection=(vanityName)`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'LinkedIn-Version': '202405',
                },
              },
            );

            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.vanityName) {
                personalAccount.vanityName = fallbackData.vanityName;
                personalAccount.profileUrl = `https://www.linkedin.com/in/${fallbackData.vanityName}/`;
                console.log('Vanity name fetched via fallback');
              }
            }
          } catch (fallbackError) {
            console.log('Fallback vanity name fetch also failed:', fallbackError);
          }
        }
      } catch (vanityError) {
        console.log('Vanity name fetch exception:', vanityError);
        debugInfo.vanity_error = `Exception: ${vanityError}`;
      }
    }

    // Step 3: Get organizations
    console.log('Fetching organizations...');
    const organizations: LinkedInOrganization[] = [];

    try {
      const organizationsResponse = await fetch(
        'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'LinkedIn-Version': '202405',
          },
        },
      );

      console.log(`Organizations response status: ${organizationsResponse.status}`);

      if (organizationsResponse.ok) {
        const organizationsData = await organizationsResponse.json();
        console.log('Organizations response data:', organizationsData);

        if (organizationsData.elements && organizationsData.elements.length > 0) {
          console.log(`Found ${organizationsData.elements.length} organization(s)`);

          for (const element of organizationsData.elements) {
            if (element.organizationalTarget) {
              const orgUrn = element.organizationalTarget;
              const orgId = orgUrn.split(':').pop();

              try {
                // Fetch organization details with more fields
                const orgDetailsResponse = await fetch(
                  `https://api.linkedin.com/v2/organizations/${orgId}?projection=(id,name,vanityName,logoV2(cropped~:playableStreams))`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'LinkedIn-Version': '202405',
                    },
                  },
                );

                if (orgDetailsResponse.ok) {
                  const orgDetails = await orgDetailsResponse.json();
                  console.log('Organization details:', orgDetails);

                  // Handle localized organization name
                  let organizationName = 'Unknown Organization';
                  if (typeof orgDetails.name === 'string') {
                    organizationName = orgDetails.name;
                  } else if (orgDetails.name?.localized) {
                    organizationName =
                      orgDetails.name.localized.en_US ||
                      orgDetails.name.localized[Object.keys(orgDetails.name.localized)[0]] ||
                      'Unknown Organization';
                  }

                  const organization: LinkedInOrganization = {
                    id: orgDetails.id.toString(),
                    name: organizationName,
                    urn: orgUrn,
                    type: 'organization',
                    vanityName: orgDetails.vanityName,
                  };

                  // Construct profile URL if vanity name exists
                  if (orgDetails.vanityName) {
                    organization.profileUrl = `https://www.linkedin.com/company/${orgDetails.vanityName}/`;
                  }

                  organizations.push(organization);
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
          console.log('No organizations found in response');
        }
      } else {
        const errorData = await organizationsResponse.json();
        console.log('Organizations request failed:', errorData);
        debugInfo.organizations_error = `${organizationsResponse.status} - ${JSON.stringify(errorData)}`;
      }
    } catch (orgsError) {
      console.warn('Organizations fetch failed:', orgsError);
      debugInfo.organizations_error = `Exception: ${orgsError}`;
    }

    // Check if we have at least one account option
    if (!personalAccount && organizations.length === 0) {
      throw {
        error: 'No LinkedIn accounts available. Please ensure you have the correct permissions and try again.',
        debug_info: debugInfo,
      };
    }

    const response: LinkedInResponse = {
      access_token: accessToken,
      personal_account: personalAccount,
      organizations: organizations,
      debug_info: debugInfo,
    };

    console.log(`Returning ${personalAccount ? 'personal account + ' : ''}${organizations.length} organization(s)`);
    console.log('Debug info:', debugInfo);
    return response;
  } catch (error: unknown) {
    console.error('Error in LinkedIn connect:', error);
    if (error instanceof Error) {
      throw { error: error.message };
    }
    throw { error: 'An unknown error occurred' };
  }
}
