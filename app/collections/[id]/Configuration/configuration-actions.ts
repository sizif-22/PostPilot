import Cookies from 'js-cookie';

export function base64URLEncode(array: Uint8Array): string {
  // Fix for Type 'Uint8Array<ArrayBufferLike>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
  // Use Array.prototype.map and String.fromCharCode.apply for compatibility
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

export const handleFacebookConnect = (id: string) => {
  Cookies.set('currentChannel', id as string);
  const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection`;
  const SCOPE =
    'pages_manage_posts,pages_read_engagement,pages_show_list,business_management,instagram_basic,instagram_content_publish';
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=code`;
  window.location.href = authUrl;
};

export const handleTikTokConnect = (id: string) => {
  const csrfState = `${new Date().getTime()}-${Math.random().toString(36).substring(2, 9)}`;
  Cookies.set('csrfState', csrfState, { expires: 6000 / 86400 });
  Cookies.set('currentChannel', id as string);
  const TIKTOK_CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI}/connection/tiktok`;
  const scope = 'user.info.basic,video.publish,video.upload,user.info.profile';
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=${encodeURIComponent(
    scope,
  )}&response_type=code&redirect_uri=${REDIRECT_URI}&state=${csrfState}`;
  console.log('client id:', authUrl);
  window.location.href = authUrl;
};

export const handleLinkedInConnect = (id: string) => {
  Cookies.set('currentChannel', id as string);
  const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection/linkedin`;
  // Comprehensive scope for both personal and organization access
  const SCOPE =
    'openid profile email w_member_social rw_organization_admin w_organization_social r_organization_social r_basicprofile';
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI,
  )}&scope=${encodeURIComponent(SCOPE)}`;
  window.location.href = authUrl;
};

export const handleXConnect = async (id: string) => {
  const state = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  Cookies.set('currentChannel', id as string);
  Cookies.set('xState', state, { expires: 1 / 24 });
  Cookies.set('xCodeVerifier', codeVerifier, { expires: 1 / 24 });

  const X_CLIENT_ID = process.env.NEXT_PUBLIC_X_CLIENT_ID!;
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection/x`;

  // Updated scopes - removed media.write as it may not be available for your app type
  // The upload functionality should work with just tweet.write scope
  const SCOPE = [
    'tweet.read',
    'tweet.write', // This should include media upload permissions
    'users.read',
    'media.write',
    'offline.access', // Required for refresh tokens
  ].join(' ');

  console.log('[X Connect] Using scopes:', SCOPE);

  const authUrl = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(
    X_CLIENT_ID,
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(
    SCOPE,
  )}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  window.location.href = authUrl;
};

export const handleYouTubeConnect = (id: string) => {
  Cookies.set('currentChannel', id as string);
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL;
  // Required scopes for YouTube upload and management
  const SCOPE = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtubepartner',
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI!,
  )}&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;

  window.location.href = authUrl;
};
