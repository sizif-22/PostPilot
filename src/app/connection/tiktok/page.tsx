"use client";
import { useEffect } from "react";
import Loading from "@/components/ui/Loading";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const TiktokPage = () => {
  const router = useRouter();

  useEffect(() => {
    const doTikTokAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code")?.split("&")[0];
      const state = urlParams.get("state");
      const id = Cookies.get("currentChannel");
      const storedState = Cookies.get("csrfState");

      if (!code) {
        console.log("No authorization code found");
        router.push("/folders/" + id);
        return;
      }

      // Verify state parameter to prevent CSRF attacks
      if (!state || state !== storedState) {
        console.error("State parameter mismatch - possible CSRF attack");
        router.push("/folders/" + id);
        return;
      }

      try {
        // Step 1: Exchange authorization code for access token
        const tokenResponse = await fetch(
          "https://open.tiktokapis.com/v2/oauth/token/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY!,
              client_secret: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_SECRET!,
              code,
              redirect_uri: "https://postpilot-22.vercel.app/connection/tiktok",
              grant_type: "authorization_code",
            }).toString(),
          }
        );

        if (!tokenResponse.ok) {
          const errorBody = await tokenResponse.text();
          console.error("Token exchange failed:", errorBody);
          throw new Error(`Failed to get access token: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        console.log("Token response:", tokenData);

        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const openId = tokenData.open_id;
        const scope = tokenData.scope;

        console.log("Granted scopes:", scope);

        // Step 2: Get user information using the access token
        // Try the basic user info endpoint first
        const userInfoResponse = await fetch(
          "https://open.tiktokapis.com/v2/user/info/?fields=display_name,username",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!userInfoResponse.ok) {
          const errorBody = await userInfoResponse.text();
          console.error("User info error:", errorBody);
          
          // If user info fails, still save the connection with available data
          await updateDoc(doc(db, "Channels", id as string), {
            "socialMedia.tiktok": {
              name: "TikTok User", // Fallback name
              accessToken: accessToken,
              refreshToken: refreshToken,
              openId: openId,
              username: "tiktok_user", // Fallback username
              connectedAt: new Date().toISOString(),
              scope: scope,
            },
          });
          
          console.log("TikTok connected successfully (without user info)");
          return;
        }

        const userData = await userInfoResponse.json();
        console.log("User data:", userData);

        const user = userData.data?.user;
        const name = user?.display_name || "TikTok User";
        const username = user?.username || "tiktok_user";
        const avatarUrl = user?.avatar_url || "";

        // Step 3: Save to Firestore
        await updateDoc(doc(db, "Channels", id as string), {
          "socialMedia.tiktok": {
            name,
            username,
            avatarUrl,
            accessToken: accessToken,
            refreshToken: refreshToken,
            openId: openId,
            connectedAt: new Date().toISOString(),
            scope: scope,
          },
        });

        console.log("TikTok connected successfully");

        // Clean up cookies
        Cookies.remove("csrfState");

      } catch (error: any) {
        console.error("TikTok authentication error:", error);
        // Even on error, redirect back to channels page
      } finally {
        router.push("/folders/" + id);
      }
    };

    doTikTokAuth();
  }, [router]);

  return <Loading />;
};

export default TiktokPage;