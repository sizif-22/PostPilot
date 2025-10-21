"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import Cookies from "js-cookie";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { youtubeChannel } from "@/interfaces/Channel";
import { encrypt } from "@/utils/encryption";

const YouTubeConnection = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<any>(null);

  const id = Cookies.get("currentChannel");

  useEffect(() => {
    if (!id) {
      setError(
        "No valid channel ID found. Please go back to dashboard and try again."
      );
      setLoading(false);
      return;
    }
  }, [id]);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    const getAccessToken = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          console.log("No authorization code found");
          setError("No authorization code found in URL");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/youtube/connect?code=${code.split("&")[0]}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get access token");
        }

        setChannelData(data.channel);
        // Store the YouTube channel data
        await saveYouTubeChannel(data);
      } catch (err: any) {
        console.error("Error getting YouTube access token:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getAccessToken();
  }, [id]);

  const saveYouTubeChannel = async (data: any) => {
    try {
      if (!id) return;
      
      const projectRef = doc(db, "Channels", id as string);
      const encryptedAccessToken: string = await encrypt(data.accessToken);
      const encryptedRefreshToken: string | undefined = data.refreshToken ? await encrypt(data.refreshToken) : undefined;
      
      const youtubeData: youtubeChannel = {
        name: data.channel.name,
        id: data.channel.id,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: data.tokenExpiry,
        username: data.channel.name, // Using channel name as username for now
        channelUrl: `https://www.youtube.com/channel/${data.channel.id}`,
        remainingTime: 3600, // 1 hour in seconds
      };

      // Update the channel document with YouTube data
      await updateDoc(projectRef, {
        "socialMedia.youtube": youtubeData,
      });

      router.replace(`/collections/${id}`);
    } catch (err) {
      console.error("Error saving YouTube channel:", err);
      setError("Failed to save YouTube channel data");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h1>Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg w-[90vw] md:w-[60vw] lg:w-[50vw] p-6 pb-20 relative">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            YouTube Channel Connected!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Successfully connected to your YouTube channel
          </p>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-800">Channel Info:</h2>
            <div className="mt-2 text-gray-700">
              <p><span className="font-medium">Name:</span> {channelData?.name}</p>
              <p><span className="font-medium">ID:</span> {channelData?.id}</p>
              <p><span className="font-medium">Subscribers:</span> {channelData?.subscriberCount}</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Your YouTube account is now connected to PostPilot. You can now schedule and publish videos directly from the platform.</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => router.replace(`/collections/${id}`)}
            className="w-40 bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default YouTubeConnection;