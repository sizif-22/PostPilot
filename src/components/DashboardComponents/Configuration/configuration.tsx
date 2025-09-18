import { useState } from "react";
import { FiAlertCircle, FiCheck } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useChannel } from "@/context/ChannelContext";
import {
  deleteChannel,
  updateChanneDescription,
  updateChanneName,
} from "@/firebase/channel.firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { deleteMediaFolder } from "@/firebase/storage";
import { useNotification } from "@/context/NotificationContext";
export const Configuration = () => {
  const router = useRouter();
  const { id } = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { channel } = useChannel();
  const isFacebookConnected = channel?.socialMedia?.facebook;
  const isTikTokConnected = channel?.socialMedia?.tiktok;
  const isLinkedInConnected = channel?.socialMedia?.linkedin;
  const isXConnected = channel?.socialMedia?.x;
  const [nameInput, setNameInput] = useState<string | undefined>(channel?.name);
  const { addNotification } = useNotification();
  const [descInput, setDescInput] = useState<string | undefined>(
    channel?.description
  );
  // const isInstagramConnected = channel?.socialMedia?.instagram;

  // Helper functions for PKCE
  function base64URLEncode(array: Uint8Array): string {
    // Fix for Type 'Uint8Array<ArrayBufferLike>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
    // Use Array.prototype.map and String.fromCharCode.apply for compatibility
    let binary = "";
    for (let i = 0; i < array.length; i++) {
      binary += String.fromCharCode(array[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
  }

  async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return base64URLEncode(new Uint8Array(hash));
  }

  const handleFacebookConnect = () => {
    Cookies.set("currentChannel", id as string);
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection`;
    const SCOPE =
      "pages_manage_posts,pages_read_engagement,pages_show_list,business_management,instagram_basic,instagram_content_publish";
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=code`;
    window.location.href = authUrl;
  };
  const handleTikTokConnect = () => {
    const csrfState = `${new Date().getTime()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    Cookies.set("csrfState", csrfState, { expires: 6000 / 86400 });
    Cookies.set("currentChannel", id as string);
    const TIKTOK_CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI}/connection/tiktok`;
    const scope =
      "user.info.basic,video.publish,video.upload,user.info.profile";
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=${encodeURIComponent(
      scope
    )}&response_type=code&redirect_uri=${REDIRECT_URI}&state=${csrfState}`;
    console.log("client id:", authUrl);
    window.location.href = authUrl;
  };
  // Update only the handleLinkedInConnect function in configuration.tsx

  const handleLinkedInConnect = () => {
    Cookies.set("currentChannel", id as string);
    const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection/linkedin`;
    // Comprehensive scope for both personal and organization access
    const SCOPE =
      "openid profile email w_member_social rw_organization_admin w_organization_social r_organization_social r_basicprofile";
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(SCOPE)}`;
    window.location.href = authUrl;
  };

  const handleXConnect = async () => {
    const state = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    Cookies.set("currentChannel", id as string);
    Cookies.set("xState", state, { expires: 1 / 24 });
    Cookies.set("xCodeVerifier", codeVerifier, { expires: 1 / 24 });

    const X_CLIENT_ID = process.env.NEXT_PUBLIC_X_CLIENT_ID!;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_REDIRECT_URI}/connection/x`;

    // Updated scopes - removed media.write as it may not be available for your app type
    // The upload functionality should work with just tweet.write scope
    const SCOPE = [
      "tweet.read",
      "tweet.write", // This should include media upload permissions
      "users.read",
      "media.write",
      "offline.access", // Required for refresh tokens
    ].join(" ");

    console.log("[X Connect] Using scopes:", SCOPE);

    const authUrl = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(
      X_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(
      SCOPE
    )}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    window.location.href = authUrl;
  };

  const confirmDelete = async () => {
    if (channel?.TeamMembers && channel.id) {
      addNotification({
        messageOnProgress: "Deleting collection",
        successMessage: "Collection deleted successfully",
        failMessage: "Failed deleting collection",
        func: [
          new Promise(async (resolve, reject) => {
            try {
              let ruleNames: string[] = [];
              Object.values(channel.posts).forEach((post) => {
                if (post.ruleName) {
                  ruleNames.push(post.ruleName);
                }
              });
              const res = await fetch("/api/lambda", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ruleNames }),
              });

              await deleteChannel(channel?.TeamMembers, channel?.id);
              resolve(true);
            } catch {
              reject(false);
            }
          }),
          new Promise((resolve, reject) => {
            try {
              deleteMediaFolder(channel.id);
              resolve(true);
            } catch {
              reject(false);
            }
          }),
        ],
      });
    }
    setShowDeleteConfirm(false);
    router.replace("/collections");
  };
  const socialMedia = [
    {
      name: "Facebook (&Instagram)",
      html: (
        <span>
          Facebook <span className="text-sm">( &Instagram )</span>
        </span>
      ),
      description: "Connect your Facebook account to enable posting",
      connect: handleFacebookConnect,
      isConnected: isFacebookConnected,
      connectedInfo: isFacebookConnected
        ? `Connected to: ${isFacebookConnected.name}`
        : null,
    },
    {
      name: "TikTok",
      html: <span>TikTok</span>,
      description: "Connect your TikTok account to enable posting",
      connect: handleTikTokConnect,
      isConnected: isTikTokConnected,
      connectedInfo: isTikTokConnected
        ? `Connected to: ${isTikTokConnected?.name}`
        : null,
    },
    {
      name: "LinkedIn",
      html: <span>LinkedIn</span>,
      description: "Connect your LinkedIn organization to enable posting",
      connect: handleLinkedInConnect,
      isConnected: isLinkedInConnected,
      connectedInfo: isLinkedInConnected
        ? `Connected to: ${isLinkedInConnected?.name}`
        : null,
    },
    {
      name: "X",
      html: <span>X</span>,
      description: "Connect your X account to enable posting",
      connect: handleXConnect,
      isConnected: isXConnected,
      connectedInfo: isXConnected
        ? `Connected to: ${isXConnected?.name}`
        : null,
    },
  ];

  return (
    <div className="bg-white dark:bg-secondDarkBackground h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg pb-4 shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] border border-stone-200 dark:border-darkBorder transition-colors duration-300">
      <div className="border-b px-4 py-3 h-16 mb-4  border-stone-200 dark:border-darkBorder sticky top-0 z-50 bg-white dark:bg-secondDarkBackground flex items-center ">
        <h2 className="font-bold text-xl dark:text-white ">Configuration</h2>
      </div>
      <div className="px-8 md:px-16">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl border-b border-stone-200 dark:border-darkBorder pb-4 mb-2 font-semibold dark:text-white">
              General
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Manage your channel's basic information and settings
            </p>
            <div className="flex flex-col gap-2 mt-4 justify-start dark:text-white">
              <h3>Update Name:</h3>
              <div className="flex gap-2">
                <Input
                  className="w-60"
                  onChange={(e) => setNameInput(e.target.value)}
                  value={nameInput}
                />
                <Button
                  disabled={
                    nameInput == "" ||
                    nameInput == undefined ||
                    nameInput == channel?.name
                  }
                  onClick={() => {
                    if (channel && channel.id && nameInput) {
                      updateChanneName(channel?.id, nameInput);
                    }
                  }}>
                  Update
                </Button>
              </div>
              <div className="flex flex-col gap-2 mt-4 justify-start dark:text-white">
                <h3>Update Description:</h3>
                <Textarea
                  value={descInput}
                  rows={4}
                  className="w-full resize-none"
                  onChange={(e) => setDescInput(e.target.value)}
                />
                <div className="flex w-full justify-end">
                  <Button
                    disabled={
                      descInput == "" ||
                      descInput == undefined ||
                      descInput == channel?.description
                    }
                    onClick={() => {
                      if (channel && channel.id && descInput) {
                        updateChanneDescription(channel?.id, descInput);
                      }
                    }}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="pb-4">
            <h2 className="text-xl border-b border-stone-200 dark:border-darkBorder pb-4 mb-2 font-semibold dark:text-white">
              Social Media Connections
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Connect your social media accounts to enable posting
            </p>
            <div className="flex flex-col gap-2 w-full border-2 border-stone-200 dark:border-darkBorder rounded-lg px-4 py-2 mt-4">
              {socialMedia.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between flex-col gap-4 md:flex-row py-2 items-center w-full md:gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium dark:text-white">
                          Connect to {item.html}
                        </h2>
                        {item.isConnected && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <FiCheck className="w-4 h-4" />
                            <span>Connected</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm text-stone-500 dark:text-stone-400">
                        {item.isConnected
                          ? item.connectedInfo
                          : item.description}
                      </h3>
                    </div>
                    <button
                      onClick={item.connect}
                      className={`text-sm font-bold duration-300 transition-colors rounded-lg border px-4 py-2 ${
                        item.isConnected
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900"
                          : "bg-white hover:text-black text-black/70 border-stone-200 hover:bg-stone-200 dark:bg-stone-900 dark:text-white dark:border-darkBorder dark:hover:bg-stone-800"
                      }`}>
                      {item.isConnected ? "Reconnect" : "Connect"}
                    </button>
                  </div>
                  {index != socialMedia.length - 1 && (
                    <hr className="w-full border-stone-200 dark:border-darkBorder" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-12 pt-6 border-t dark:border-darkBorder">
            <h3 className="text-lg font-medium text-red-600 mb-4">
              Danger Zone
            </h3>
            <div className="border-2 border-red-500/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex justify-between flex-col gap-4 md:flex-row items-center w-full md:gap-2">
                  <div>
                    <h2 className="text-lg font-medium dark:text-white">
                      Delete Collection
                    </h2>
                    <h3 className="text-sm text-stone-500 dark:text-stone-400">
                      Once you delete a collection, there is no going back.
                      Please be certain.
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 min-w-36 text-sm bg font-bold hover:bg-red-700 duration-300 hover:text-white transition-colors rounded-lg border bg-stone-100 border-red-200/50 py-2 dark:bg-red-950 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900">
                    Delete Collection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-stone-950/50 dark:bg-black/70 flex items-center justify-center">
            <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-6 max-w-md w-full mx-4 shadow-xl dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
              <div className="flex items-start gap-4">
                <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2 dark:text-white">
                    Delete Collection
                  </h3>
                  <p className="text-stone-600 dark:text-gray-400 mb-4">
                    Are you sure you want to delete this collection? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-darkBorder rounded">
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded`}>
                      Delete Collection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
