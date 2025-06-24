import Loading from "@/components/ui/Loading";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";
export const page = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code")?.split("&")[0];
  const id = Cookies.get("currentChannel");
  if (!code) {
    console.log("No authorization code found");
    return;
  }
  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY,
          client_secret: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_SECRET,
          code,
          redirect_uri: "https://postpilot-22.vercel.app/connection/tiktok",
          grant_type: "authorization_code",
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to get the access token");
    }
    const data = await response.json();
    const shortAccessToken = data.access_token;
    const openId = data.open_id;
    const tokenType = data.token_type;

    const response2 = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify({
          client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY,
          client_secret: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: shortAccessToken,
        }),
      }
    );
    if (!response2.ok) {
      throw new Error("Failed to get the long access token");
    }
    const longAccessToken = (await response2.json()).access_token;

    const response3 = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name",
      {
        method: "GET",
        headers: {
          Authorization: `${tokenType} ${longAccessToken}`,
        },
      }
    );
    if (!response3.ok) {
      throw new Error("Failed to get the user data");
    }
    const data3 = await response3.json();
    const name = data3.user.display_name;

    await updateDoc(doc(db, "Channels", id as string), {
      "socialMedia.tiktok": {
        name,
        accessToken: longAccessToken,
        openId,
      },
    });
  } catch (error: any) {
    console.log("error: " + error);
  } finally {
    redirect(("/channels" + id) as string);
  }
  return <Loading />;
};
