// Updated OAuth 1.0a request token API: /api/x/oauth1/request-token/route.ts
import { NextResponse } from "next/server";
import OAuth from "oauth-1.0a";
import { createHmac } from "crypto";

const consumer_key = process.env.X_API_KEY!;
const consumer_secret = process.env.X_API_KEY_SECRET!;

const oauth = new OAuth({
  consumer: {
    key: consumer_key,
    secret: consumer_secret,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return createHmac("sha1", key).update(base_string).digest("base64");
  },
});

export async function POST() {
  try {
    const callback_url = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection/x/oauth1`;
    
    const request_data = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
    };

    // Add callback URL to the request
    const authData = oauth.authorize(request_data, {
      key: '',
      secret: ''
    });
    
    // Add oauth_callback as a parameter to the request_data for signature
    const headers = oauth.toHeader(authData);
    headers.Authorization += `, oauth_callback="${encodeURIComponent(callback_url)}"`;

    const response = await fetch('https://api.twitter.com/oauth/request_token', {
      method: 'POST',
      headers: {
        Authorization: headers.Authorization,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Request token error:', errorText);
      throw new Error(`Failed to get request token: ${response.status}`);
    }

    const responseText = await response.text();
    const params = new URLSearchParams(responseText);
    
    const oauth_callback_confirmed = params.get('oauth_callback_confirmed');
    if (oauth_callback_confirmed !== 'true') {
      throw new Error('OAuth callback not confirmed');
    }
    
    return NextResponse.json({
      oauth_token: params.get('oauth_token'),
      oauth_token_secret: params.get('oauth_token_secret'),
      oauth_callback_confirmed,
    });
  } catch (error: any) {
    console.error('Error getting OAuth 1.0a request token:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
