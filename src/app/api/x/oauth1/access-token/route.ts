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

export async function POST(request: Request) {
  try {
    const { oauth_token, oauth_token_secret } = await request.json();

    const request_data = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
    };

    const headers = oauth.toHeader(oauth.authorize(request_data, {
      key: oauth_token,
      secret: oauth_token_secret
    }));

    const response = await fetch('https://api.twitter.com/oauth/access_token', {
      method: 'POST',
      headers: {
        Authorization: headers.Authorization,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const responseText = await response.text();
    const params = new URLSearchParams(responseText);
    
    return NextResponse.json({
      oauth_token: params.get('oauth_token'),
      oauth_token_secret: params.get('oauth_token_secret'),
      user_id: params.get('user_id'),
      screen_name: params.get('screen_name'),
    });
  } catch (error: any) {
    console.error('Error getting OAuth 1.0a access token:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
