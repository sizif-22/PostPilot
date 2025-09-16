// // 3. Updated page.tsx - callback handler
// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Cookies from "js-cookie";
// import { db } from "@/firebase/config";
// import { doc, updateDoc } from "firebase/firestore";
// import Loading from "@/components/ui/Loading";
// import { FiCheck, FiAlertCircle } from "react-icons/fi";
// import { FaTwitter } from "react-icons/fa";
// import { encrypt } from "@/utils/encryption";
// import axios from "axios";
// import { refreshXFunc } from "./server-action";

// interface XUserProfile {
//   id: string;
//   name: string;
//   username: string;
// }

// export default function XCallbackPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userProfile, setUserProfile] = useState<XUserProfile | null>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [refreshToken, setRefreshToken] = useState<string | null>(null);
//   const [expiresIn, setExpiresIn] = useState<number | null>(null);

//   useEffect(() => {
//     const handleXAuth = async () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const code = urlParams.get("code");
//       const state = urlParams.get("state");
//       const error = urlParams.get("error");
//       const channelId = Cookies.get("currentChannel");

//       // Check for OAuth errors
//       if (error) {
//         setError(`OAuth error: ${error}`);
//         setLoading(false);
//         return;
//       }

//       if (!code) {
//         setError("No authorization code found");
//         setLoading(false);
//         return;
//       }

//       if (!channelId) {
//         setError("No channel ID found");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch(
//           `/api/x/connect?code=${code}&state=${state}`
//         );
//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || "Failed to connect to X");
//         }

//         setAccessToken(data.access_token);
//         setRefreshToken(data.refresh_token);
//         setExpiresIn(data.expires_in);
//         setUserProfile(data.user || null);

//         if (!data.user) {
//           setError("No user profile found. Please try again.");
//         }
//       } catch (error: any) {
//         console.error("X auth error:", error);
//         setError(error.message || "Failed to connect to X");
//       } finally {
//         setLoading(false);
//       }
//     };

//     handleXAuth();
//   }, []);

//   const handleConnect = async () => {
//     if (
//       !userProfile ||
//       !accessToken ||
//       !refreshToken ||
//       !Cookies.get("currentChannel")
//     ) {
//       return;
//     }

//     try {
//       setLoading(true);
//       const channelId = Cookies.get("currentChannel");
//       const encryptedAccessToken: string = await encrypt(accessToken);
//       const encryptedRefreshToken: string = await encrypt(refreshToken);
//       const socialMediaX = {
//         name: userProfile.name,
//         username: userProfile.username,
//         accessToken: encryptedAccessToken,
//         refreshToken: encryptedRefreshToken,
//         expiresIn: expiresIn,
//         tokenExpiry: expiresIn
//           ? new Date(Date.now() + expiresIn * 1000).toISOString()
//           : null,
//         userId: userProfile.id,
//         isPersonal: true,
//       };

//       await updateDoc(doc(db, "Channels", channelId as string), {
//         "socialMedia.x": socialMediaX,
//       });
//       await refreshXFunc(channelId as string);
//       router.push(`/collections/${channelId}`);
//     } catch (error: any) {
//       console.error("Error saving X profile:", error);
//       setError("Failed to save profile selection");
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <Loading />;
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center">
//         <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-md w-full mx-4 shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
//           <div className="flex items-center gap-3 mb-4">
//             <FiAlertCircle className="text-red-500 text-2xl" />
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//               Connection Error
//             </h2>
//           </div>
//           <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
//           <button
//             onClick={() =>
//               router.push(`/collections/${Cookies.get("currentChannel")}`)
//             }
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
//             Back to Channel
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center p-4">
//       <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-2xl w-full shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
//         <div className="flex items-center gap-3 mb-6">
//           <FaTwitter className="text-blue-600 text-3xl" />
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Connect X Account
//           </h1>
//         </div>

//         <p className="text-gray-600 dark:text-gray-400 mb-6">
//           Confirm your X account connection to PostPilot.
//         </p>

//         {userProfile && (
//           <div className="p-4 border border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
//                 <FaTwitter className="text-blue-600 dark:text-blue-400" />
//               </div>
//               <div>
//                 <h3 className="font-medium text-gray-900 dark:text-white">
//                   {userProfile.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   @{userProfile.username}
//                 </p>
//               </div>
//               <FiCheck className="text-blue-500 text-2xl ml-auto" />
//             </div>
//           </div>
//         )}

//         <div className="flex gap-3">
//           <button
//             onClick={() =>
//               router.push(`/collections/${Cookies.get("currentChannel")}`)
//             }
//             className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder rounded-lg transition-colors">
//             Cancel
//           </button>
//           <button
//             onClick={handleConnect}
//             disabled={!userProfile}
//             className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed">
//             Connect Account
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// Updated callback page - page.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import Loading from "@/components/ui/Loading";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import { FaTwitter } from "react-icons/fa";
import { encrypt } from "@/utils/encryption";

interface XUserProfile {
  id: string;
  name: string;
  username: string;
}

interface XTokens {
  oauth2AccessToken: string;
  oauth2RefreshToken: string;
  oauth1AccessToken: string;
  oauth1AccessTokenSecret: string;
  expiresIn: number;
}

export default function XCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<XUserProfile | null>(null);
  const [tokens, setTokens] = useState<XTokens | null>(null);

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
        // Step 1: Get OAuth 2.0 tokens
        const oauth2Response = await fetch(`/api/x/connect?code=${code}&state=${state}`);
        const oauth2Data = await oauth2Response.json();

        if (!oauth2Response.ok) {
          throw new Error(oauth2Data.error || "Failed to connect to X");
        }

        // Step 2: Exchange OAuth 1.0a request token for access token
        const oauth1Token = Cookies.get('oauth1_token');
        const oauth1TokenSecret = Cookies.get('oauth1_token_secret');

        if (!oauth1Token || !oauth1TokenSecret) {
          throw new Error("Missing OAuth 1.0a tokens");
        }

        const oauth1Response = await fetch('/api/x/oauth1/access-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oauth_token: oauth1Token,
            oauth_token_secret: oauth1TokenSecret,
          }),
        });

        const oauth1Data = await oauth1Response.json();

        if (!oauth1Response.ok) {
          throw new Error(oauth1Data.error || "Failed to get OAuth 1.0a access token");
        }

        setTokens({
          oauth2AccessToken: oauth2Data.access_token,
          oauth2RefreshToken: oauth2Data.refresh_token,
          oauth1AccessToken: oauth1Data.oauth_token,
          oauth1AccessTokenSecret: oauth1Data.oauth_token_secret,
          expiresIn: oauth2Data.expires_in,
        });

        setUserProfile(oauth2Data.user || null);
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
    if (!userProfile || !tokens || !Cookies.get("currentChannel")) {
      return;
    }

    try {
      setLoading(true);
      const channelId = Cookies.get("currentChannel");
      
      // Encrypt all tokens
      const encryptedOAuth2AccessToken = await encrypt(tokens.oauth2AccessToken);
      const encryptedOAuth2RefreshToken = await encrypt(tokens.oauth2RefreshToken);
      const encryptedOAuth1AccessToken = await encrypt(tokens.oauth1AccessToken);
      const encryptedOAuth1AccessTokenSecret = await encrypt(tokens.oauth1AccessTokenSecret);

      const socialMediaX = {
        name: userProfile.name,
        username: userProfile.username,
        // OAuth 2.0 tokens for posting
        accessToken: encryptedOAuth2AccessToken,
        refreshToken: encryptedOAuth2RefreshToken,
        // OAuth 1.0a tokens for media upload
        oauth1AccessToken: encryptedOAuth1AccessToken,
        oauth1AccessTokenSecret: encryptedOAuth1AccessTokenSecret,
        expiresIn: tokens.expiresIn,
        tokenExpiry: tokens.expiresIn
          ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
          : null,
        userId: userProfile.id,
        isPersonal: true,
      };

      await updateDoc(doc(db, "Channels", channelId as string), {
        "socialMedia.x": socialMediaX,
      });

      // Clean up cookies
      Cookies.remove('oauth1_token');
      Cookies.remove('oauth1_token_secret');

      router.push(`/collections/${channelId}`);
    } catch (error: any) {
      console.error("Error saving X profile:", error);
      setError("Failed to save profile selection");
      setLoading(false);
    }
  };

  // ... rest of component remains the same
    if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center">
        <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-md w-full mx-4 shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="text-red-500 text-2xl" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connection Error
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() =>
              router.push(`/collections/${Cookies.get("currentChannel")}`)
            }
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Back to Channel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center p-4">
      <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-2xl w-full shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 mb-6">
          <FaTwitter className="text-blue-600 text-3xl" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connect X Account
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Confirm your X account connection to PostPilot.
        </p>

        {userProfile && (
          <div className="p-4 border border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FaTwitter className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {userProfile.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{userProfile.username}
                </p>
              </div>
              <FiCheck className="text-blue-500 text-2xl ml-auto" />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() =>
              router.push(`/collections/${Cookies.get("currentChannel")}`)
            }
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!userProfile}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed">
            Connect Account
          </button>
        </div>
      </div>
    </div>
  );
}