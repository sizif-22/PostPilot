"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/Firebase/firebase.config";
import Cookies from "js-cookie";
import Loading from "@/app/loading";

const Connected = ({ params }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const id = useSelector((state) => state.user.currentChannelId);
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const id = Cookies.get("currentChannelId");
  // Effect to check if we have a valid ID
  useEffect(() => {
    if (!id) {
      setError(
        "No valid channel ID found. Please go back to dashboard and try again."
      );
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Only proceed with token exchange if we have a valid ID
    if (!id) return;

    const getAccessToken = async () => {
      try {
        // Get the code from URL search params

        if (!code) {
          throw new Error("No authorization code found");
        }

        // Exchange code for access token
        const response = await fetch(
          "https://graph.facebook.com/v19.0/oauth/access_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
              client_secret: process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET,
              redirect_uri:
                "https://postpilot-22.vercel.app/dashboard/connected",
              code: code.split("&")[0],
            }).toString(),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to get access token: ${
              errorData.error?.message || response.statusText
            }`
          );
        }

        const data = await response.json();

        // Update the project document with the access token
        // Make sure path follows collection/document pattern
        const projectRef = doc(db, "project", id);
        await updateDoc(projectRef, {
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
    return <Loading />;
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
