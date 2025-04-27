"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/Firebase/firebase.config";
import { useSelector } from "react-redux";
const Connected = ({ params }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [id , setId] = useState(null);
  const id = useSelector((state) => state.user.currentChannelId);

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        // Get the code from URL search params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("No authorization code found");
        }

        // Exchange code for access token
        const response = await fetch(
          "https://graph.facebook.com/v19.0/oauth/access_token",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            params: new URLSearchParams({
              client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
              client_secret: process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET,
              redirect_uri: `https://postpilot-22.vercel.app/dashboard/connected`,
              code: code,
            }).toString(),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get access token");
        }

        const data = await response.json();

        // Update the project document with the access token
        await updateDoc(doc(db, "project", id), {
          FacebookConnected: true,
          facebookAccessToken: data.access_token,
        });

        // Redirect back to dashboard
        router.push(`/dashboard/${id}`);
      } catch (err) {
        console.error("Error getting access token:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getAccessToken();
  }, [id, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-[#212121] to-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-[#212121] to-black text-white">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-[#212121] to-black text-white">
      <div>Connecting to Facebook...</div>
    </div>
  );
};

export default Connected;
