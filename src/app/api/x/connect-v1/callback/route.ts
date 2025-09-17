
import { TwitterApi } from 'twitter-api-v2';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_KEY = process.env.X_API_KEY!;
const API_SECRET = process.env.X_API_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { oauth_token, oauth_verifier } = await req.json();
    const cookieStore = await cookies();
    const oauthTokenSecret = cookieStore.get('x-oauth-token-secret')?.value;

    if (!oauth_token || !oauth_verifier || !oauthTokenSecret) {
      return NextResponse.json(
        { error: 'Invalid request: missing oauth tokens or verifier' },
        { status: 400 }
      );
    }

    const client = new TwitterApi({
      appKey: API_KEY,
      appSecret: API_SECRET,
      accessToken: oauth_token,
      accessSecret: oauthTokenSecret,
    });

    const { accessToken, accessSecret } = await client.login(oauth_verifier);

    // Clear the temporary cookies
    cookieStore.delete('x-oauth-token');
    cookieStore.delete('x-oauth-token-secret');

    return NextResponse.json({
      v1aAccessToken: accessToken,
      v1aAccessSecret: accessSecret,
    });
  } catch (error) {
    console.error('Error in X v1 callback:', error);
    return NextResponse.json(
      { error: 'Failed to get v1 access tokens' },
      { status: 500 }
    );
  }
}
