// Updated final callback page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import Loading from "@/components/ui/Loading";
import { encrypt } from "@/utils/encryption";

export default function XCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleFinalAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
      const channelId = Cookies.get("currentChannel");

      if (error || !code || !channelId) {
        setError(error ? `OAuth error: ${error}` : "Missing required parameters");
        setLoading(false);
        return;
      }

      try {
        // Get OAuth 2.0 tokens
        const oauth2Response = await fetch(`/api/x/connect?code=${code}&state=${state}`);
        const oauth2Data = await oauth2Response.json();

        if (!oauth2Response.ok) {
          throw new Error(oauth2Data.error || "Failed to get OAuth 2.0 tokens");
        }

        // Get stored OAuth 1.0a tokens
        const oauth1AccessToken = Cookies.get('oauth1_access_token');
        const oauth1AccessTokenSecret = Cookies.get('oauth1_access_token_secret');

        if (!oauth1AccessToken || !oauth1AccessTokenSecret) {
          throw new Error("Missing OAuth 1.0a tokens");
        }

        // Encrypt all tokens
        const encryptedOAuth2AccessToken = await encrypt(oauth2Data.access_token);
        const encryptedOAuth2RefreshToken = await encrypt(oauth2Data.refresh_token);
        const encryptedOAuth1AccessToken = await encrypt(oauth1AccessToken);
        const encryptedOAuth1AccessTokenSecret = await encrypt(oauth1AccessTokenSecret);

        const socialMediaX = {
          name: oauth2Data.user.name,
          username: oauth2Data.user.username,
          accessToken: encryptedOAuth2AccessToken,
          refreshToken: encryptedOAuth2RefreshToken,
          oauth1AccessToken: encryptedOAuth1AccessToken,
          oauth1AccessTokenSecret: encryptedOAuth1AccessTokenSecret,
          expiresIn: oauth2Data.expires_in,
          tokenExpiry: oauth2Data.expires_in
            ? new Date(Date.now() + oauth2Data.expires_in * 1000).toISOString()
            : null,
          userId: oauth2Data.user.id,
          isPersonal: true,
        };

        await updateDoc(doc(db, "Channels", channelId as string), {
          "socialMedia.x": socialMediaX,
        });

        // Clean up all cookies
        const cookiesToClear = [
          'oauth1_request_token',
          'oauth1_request_token_secret', 
          'oauth1_access_token',
          'oauth1_access_token_secret',
          'xState',
          'xCodeVerifier'
        ];
        
        cookiesToClear.forEach(cookie => Cookies.remove(cookie));

        router.push(`/collections/${channelId}`);
      } catch (error: any) {
        console.error("Final auth error:", error);
        setError(error.message || "Failed to complete connection");
      } finally {
        setLoading(false);
      }
    };

    handleFinalAuth();
  }, []);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center">
        <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/collections/${Cookies.get("currentChannel")}`)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg">
            Back to Channel
          </button>
        </div>
      </div>
    );
  }

  return null;
}
