# Enhanced Facebook Integration

## Overview

This enhanced Facebook integration system fetches Business Accounts and Pages after OAuth authentication, providing a comprehensive view of all Facebook assets the user has access to.

## Features

### 1. Business Account Discovery

- Fetches all Business Accounts (business portfolios) the user has access to
- For each Business Account, retrieves all owned pages
- Includes Instagram Business Account connections where available

### 2. Standalone Page Discovery

- Fetches all standalone Facebook Pages the user has direct access to
- Includes Instagram Business Account connections where available

### 3. Enhanced Permissions

The system requests the following Facebook permissions:

- `pages_show_list` - List user's pages
- `pages_read_engagement` - Read page engagement data
- `business_management` - Access business accounts
- `instagram_basic` - Basic Instagram access
- `instagram_content_publish` - Publish to Instagram

## API Response Structure

```json
{
  "access_token": "USER_ACCESS_TOKEN",
  "business_accounts": [
    {
      "id": "BUSINESS_ID",
      "name": "BUSINESS_NAME",
      "pages": [
        {
          "id": "PAGE_ID",
          "name": "PAGE_NAME",
          "access_token": "PAGE_ACCESS_TOKEN",
          "instagram_id": "INSTAGRAM_ID (if connected)"
        }
      ]
    }
  ],
  "standalone_pages": [
    {
      "id": "PAGE_ID",
      "name": "PAGE_NAME",
      "access_token": "PAGE_ACCESS_TOKEN",
      "instagram_id": "INSTAGRAM_ID (if connected)"
    }
  ]
}
```

## Implementation Details

### API Route: `/api/facebook/connect`

1. **OAuth Token Exchange**: Exchanges authorization code for access token
2. **Business Account Fetching**: Gets all business accounts using `/me/businesses`
3. **Business Page Fetching**: For each business, gets owned pages using `/owned_pages`
4. **Standalone Page Fetching**: Gets direct pages using `/me/accounts`
5. **Instagram Integration**: Includes Instagram Business Account IDs where connected

### Frontend: `/connection/page.tsx`

- Displays all pages in a unified interface
- Shows business account affiliation for each page
- Indicates Instagram connection status
- Allows selection of any page for connection

## Error Handling

- Graceful handling of missing business management permissions
- Proper error messages for OAuth failures
- Fallback behavior when business accounts are not accessible

## Usage

1. User clicks "Connect Facebook" in configuration
2. OAuth flow requests enhanced permissions
3. Callback processes the authorization code
4. System fetches business accounts and standalone pages
5. User selects desired page from unified list
6. Selected page data is saved to database

## Database Storage

The selected page is stored in the channel document:

```typescript
socialMedia: {
  facebook: {
    id: "PAGE_ID",
    name: "PAGE_NAME",
    accessToken: "PAGE_ACCESS_TOKEN"
  }
}
```

## Benefits

- **Comprehensive Access**: Shows all Facebook assets in one place
- **Business Integration**: Supports business account workflows
- **Instagram Ready**: Identifies Instagram-connected pages
- **Flexible Selection**: Users can choose from business or standalone pages
- **Enhanced Permissions**: Ready for advanced Facebook/Instagram features
