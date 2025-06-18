import React, { useState, useEffect } from "react";
import {
  FiFacebook,
  FiInstagram,
  FiTrash2,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Channel } from "@/interfaces/Channel";

export const Configuration = () => {
  const { id } = useParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannel = async () => {
      if (!id) return;

      try {
        const channelDoc = await getDoc(doc(db, "channels", id as string));
        if (channelDoc.exists()) {
          setChannel({ id: channelDoc.id, ...channelDoc.data() } as Channel);
        }
      } catch (error) {
        console.error("Error fetching channel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [id]);

  const handleFacebookConnect = () => {
    Cookies.set("currentChannel", id as string);
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const REDIRECT_URI = "https://postpilot-22.vercel.app/connection";
    const SCOPE =
      "pages_manage_posts,pages_read_engagement,pages_manage_metadata,pages_manage_engagement,pages_show_list,business_management,instagram_basic,instagram_content_publish";

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=code`;

    window.location.href = authUrl;
  };

  const handleInstagramConnect = () => {
    Cookies.set("currentChannel", id as string);
    const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    const REDIRECT_URI = "https://postpilot-22.vercel.app/instagram";
    const SCOPE =
      "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts";

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=code`;

    window.location.href = authUrl;
  };

  const handleDeleteChannel = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    console.log("Deleting channel...");
    setShowDeleteConfirm(false);
  };

  const isFacebookConnected = channel?.socialMedia?.facebook;
  const isInstagramConnected = channel?.socialMedia?.instagram;

  const socialMedia = [
    {
      name: "Facebook",
      icon: FiFacebook,
      connect: handleFacebookConnect,
      isConnected: isFacebookConnected,
      connectedInfo: isFacebookConnected
        ? `Connected to: ${isFacebookConnected.name}`
        : null,
    },
    {
      name: "Instagram",
      icon: FiInstagram,
      connect: handleInstagramConnect,
      isConnected: isInstagramConnected,
      connectedInfo: isInstagramConnected
        ? `Connected to: @${isInstagramConnected.instagramUsername}`
        : null,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg pb-4 shadow">
        <div className="flex p-3 h-16 justify-between items-center px-4 border-b border-stone-200">
          <h2 className="font-bold text-xl">Configuration</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-stone-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white  h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg pb-4 shadow">
      <div className="flex p-3 h-16 justify-between items-center px-4 border-b border-stone-200">
        <h2 className="font-bold text-xl">Configuration</h2>
      </div>
      <div className="px-8 md:px-16">
        <div className="p-6 space-y-6">
          {/* Section Title */}
          <div className="pb-4">
            <h2 className="text-xl border-b border-stone-200 pb-4 mb-2 font-semibold">
              Social Media Connections
            </h2>
            <p className="text-sm text-stone-500">
              Connect your social media accounts to enable posting
            </p>
            <div className="flex flex-col gap-2 w-full border-2 border-stone-200 rounded-lg px-4 py-2 mt-4">
              {socialMedia.map((item, index) => (
                <>
                  <div className="flex justify-between flex-col gap-4 md:flex-row py-2 items-center w-full md:gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium">
                          Connect to {item.name}
                        </h2>
                        {item.isConnected && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <FiCheck className="w-4 h-4" />
                            <span>Connected</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm text-stone-500">
                        {item.isConnected
                          ? item.connectedInfo
                          : `Connect your ${item.name} account to enable posting`}
                      </h3>
                    </div>
                    <button
                      onClick={item.connect}
                      className={`text-sm font-bold duration-300 transition-colors rounded-lg border px-4 py-2 ${
                        item.isConnected
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-white hover:text-black text-black/70 border-stone-200 hover:bg-stone-200"
                      }`}>
                      {item.isConnected ? "Reconnect" : "Connect"}
                    </button>
                  </div>
                  {index != socialMedia.length - 1 && (
                    <hr className="w-full border-stone-200" />
                  )}
                </>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-12 pt-6 border-t">
            <h3 className="text-lg font-medium text-red-600 mb-4">
              Danger Zone
            </h3>
            <div className="border-2 border-red-500/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex justify-between flex-col gap-4 md:flex-row items-center w-full md:gap-2">
                  <div>
                    <h2 className="text-lg font-medium">Delete Channel</h2>
                    <h3 className="text-sm text-stone-500">
                      Once you delete a channel, there is no going back. Please
                      be certain.
                    </h3>
                  </div>
                  <button
                    onClick={handleDeleteChannel}
                    className="text-red-600 min-w-36 text-sm bg font-bold hover:bg-red-700 duration-300 hover:text-white transition-colors rounded-lg border bg-stone-100 border-red-200/50 py-2">
                    Delete Channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-stone-950/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-start gap-4">
                <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Delete Channel</h3>
                  <p className="text-stone-600 mb-4">
                    Are you sure you want to delete this channel? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded">
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded">
                      Delete Channel
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
