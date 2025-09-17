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
    const handleXAuth = async () => {
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
        const response = await fetch(
          `/api/x/connect?code=${code}&state=${state}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to connect to X");
        }

        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setExpiresIn(data.expires_in);
        setUserProfile(data.user || null);

        if (!data.user) {
          setError("No user profile found. Please try again.");
        }
      } catch (error: any) {
        console.error("X auth error:", error);
        setError(error.message || "Failed to connect to X");
      } finally {
        setLoading(false);
      }
    };

    handleXAuth();
  }, []);

  const handleConnect = async () => {
    if (
      !userProfile ||
      !accessToken ||
      !refreshToken ||
      !Cookies.get("currentChannel")
    ) {
      return;
    }

    try {
      setLoading(true);
      const channelId = Cookies.get("currentChannel");
      const encryptedAccessToken: string = await encrypt(accessToken);
      const encryptedRefreshToken: string = await encrypt(refreshToken);
        const socialMediaX = {
        name: userProfile.name,
        username: userProfile.username,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresIn: expiresIn,
        tokenExpiry: expiresIn
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
            : null,
        userId: userProfile.id,
          isPersonal: true,
        };

        await updateDoc(doc(db, "Channels", channelId as string), {
          "socialMedia.x": socialMediaX,
        });
      await refreshXFunc(channelId as string);
        router.push(`/collections/${channelId}`);
      } catch (error: any) {
      console.error("Error saving X profile:", error);
      setError("Failed to save profile selection");
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
