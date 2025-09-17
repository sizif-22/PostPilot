
import { TwitterApi } from 'twitter-api-v2';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_KEY = process.env.X_API_KEY!;
const API_SECRET = process.env.X_API_SECRET!;
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection/x/connect-v1`;

export async function GET(req: NextRequest) {
  try {
    const client = new TwitterApi({
      appKey: API_KEY,
      appSecret: API_SECRET,
    });

    const authLink = await client.generateAuthLink(CALLBACK_URL, {
      linkMode: 'authorize',
    });

    const cookieStore = await cookies();
    // Storing tokens in cookies
    cookieStore.set('x-oauth-token', authLink.oauth_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
    });
    cookieStore.set('x-oauth-token-secret', authLink.oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
    });

    return NextResponse.redirect(authLink.url);
  } catch (error) {
    console.error('Error generating X v1 auth link:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication link' },
      { status: 500 }
    );
  }
}
