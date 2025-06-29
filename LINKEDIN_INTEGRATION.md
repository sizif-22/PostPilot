# LinkedIn Integration

## Overview

This LinkedIn integration system allows users to connect their LinkedIn organizations and publish posts to their company pages. The integration follows the OAuth 2.0 flow and uses LinkedIn's API v2.

## Features

### 1. OAuth Authentication

- Secure OAuth 2.0 flow with LinkedIn
- Requests necessary scopes for organization management and posting
- Handles authorization code exchange for access tokens

### 2. Organization Discovery

- Fetches all organizations where the user is an administrator
- Displays organization names and IDs for user selection
- Stores selected organization details for future posting

### 3. Post Publishing

- Publishes text posts to LinkedIn company pages
- Supports scheduled posting through the existing scheduling system
- Handles post status updates and error reporting

## Required Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

## LinkedIn App Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Configure OAuth 2.0 settings:
   - Redirect URLs: `https://postpilot-22.vercel.app/connection/linkedin`
   - Requested scopes: `openid w_organization_social rw_organization_admin r_organization_social`
4. Copy the Client ID and Client Secret to your environment variables

## API Endpoints

### `/api/linkedin/connect`

- **Method**: GET
- **Purpose**: Exchange authorization code for access token and fetch organizations
- **Parameters**: `code` (authorization code from LinkedIn)
- **Returns**: Access token and list of organizations

### `/api/linkedin/createpost`

- **Method**: POST
- **Purpose**: Publish posts to LinkedIn
- **Body**: `{ postId, channelId }`
- **Returns**: Success status and LinkedIn post ID

## Database Schema

The LinkedIn connection is stored in the channel document:

```typescript
socialMedia: {
  linkedin: {
    name: string; // Organization name
    urn: string; // LinkedIn URN (urn:li:organization:123456)
    accessToken: string; // OAuth access token
    organizationId: string; // LinkedIn organization ID
  }
}
```

## User Flow

1. **Connection**: User clicks "Connect to LinkedIn" in configuration
2. **OAuth**: User is redirected to LinkedIn for authorization
3. **Callback**: LinkedIn redirects back with authorization code
4. **Organization Selection**: User selects which organization to connect
5. **Storage**: Selected organization details are saved to database
6. **Posting**: User can now select LinkedIn when creating posts

## Implementation Details

### OAuth Flow

```typescript
// 1. Redirect to LinkedIn OAuth
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;

// 2. Exchange code for token
const tokenResponse = await fetch(
  "https://www.linkedin.com/oauth/v2/accessToken",
  {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    }),
  }
);

// 3. Fetch organizations
const orgsResponse = await fetch(
  "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": "202405",
    },
  }
);
```

### Post Publishing

```typescript
const linkedInPostData = {
  author: organizationUrn,
  lifecycleState: "PUBLISHED",
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: { text: postMessage },
      shareMediaCategory: "NONE",
    },
  },
  visibility: {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
  },
};

const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": "202405",
  },
  body: JSON.stringify(linkedInPostData),
});
```

## Error Handling

- OAuth errors are caught and displayed to the user
- API errors are logged and returned with appropriate status codes
- Network errors are handled gracefully with retry logic
- Invalid organization access is handled with clear error messages

## Security Considerations

- Access tokens are stored securely in the database
- OAuth flow uses secure redirect URIs
- API calls include proper authorization headers
- Error messages don't expose sensitive information

## Future Enhancements

- Support for media attachments (images, videos)
- Enhanced post analytics and insights
- Multi-organization posting capabilities
- Post scheduling with LinkedIn's native scheduling
- Engagement metrics and reporting

## Troubleshooting

### Common Issues

1. **"No organizations found"**

   - Ensure user is an administrator of at least one LinkedIn organization
   - Check that the app has the correct scopes

2. **"Failed to get access token"**

   - Verify client ID and secret are correct
   - Check that redirect URI matches exactly

3. **"Failed to fetch organizations"**
   - Ensure access token is valid and not expired
   - Check LinkedIn API status and rate limits

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will log detailed API requests and responses for troubleshooting.
