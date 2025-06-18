// https://postpilot-22.vercel.app/instagram

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface InstagramPage {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramId: string;
  instagramUsername: string;
  instagramName: string;
  profilePictureUrl: string;
}

export default function InstagramCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instagramPages, setInstagramPages] = useState<InstagramPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<InstagramPage | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    const channelId = Cookies.get("currentChannel"); // Get channel ID from cookie

    if (!code) {
      setError("Authorization code not found.");
      setLoading(false);
      return;
    }

    if (!channelId) {
      setError("Channel ID is missing.");
      setLoading(false);
      return;
    }

    const exchangeTokenAndFetchPages = async () => {
      try {
        // First, exchange the code for access token
        const tokenResponse = await fetch(
          `/api/instagram/connect?code=${code}`
        );
        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          setError(tokenData.error || "Failed to exchange access token.");
          setLoading(false);
          return;
        }

        // Then, fetch Instagram pages using the access token
        const pagesResponse = await fetch(
          `/api/instagram/pages?access_token=${tokenData.access_token}`
        );
        const pagesData = await pagesResponse.json();

        if (!pagesResponse.ok) {
          setError(pagesData.error || "Failed to fetch Instagram pages.");
          setLoading(false);
          return;
        }

        if (pagesData.pages.length === 0) {
          setError(
            "No Instagram pages found. Please make sure you have Instagram Business accounts connected to your Facebook pages."
          );
          setLoading(false);
          return;
        }

        setInstagramPages(pagesData.pages);
        setLoading(false);
      } catch (err) {
        setError("An error occurred while connecting to Instagram.");
        setLoading(false);
      }
    };

    exchangeTokenAndFetchPages();
  }, []);

  const handlePageSelect = (page: InstagramPage) => {
    setSelectedPage(page);
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;

    const channelId = Cookies.get("currentChannel");
    if (!channelId) {
      setError("Channel ID is missing.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/instagram/save-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelId,
          instagramData: selectedPage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect back to the channel page
        router.push(`/channels/${channelId}`);
      } else {
        setError(data.error || "Failed to save Instagram page.");
      }
    } catch (err) {
      setError("An error occurred while saving the Instagram page.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white text-xl">
        Connecting to Instagram...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500 text-xl gap-4">
        <div>{error}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select Instagram Account
          </h1>
          <p className="text-gray-600">
            Choose which Instagram account you want to connect to this channel
          </p>
        </div>

        <div className="space-y-4">
          {instagramPages.map((page) => (
            <div
              key={page.instagramId}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPage?.instagramId === page.instagramId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handlePageSelect(page)}>
              <div className="flex items-center space-x-3">
                {page.profilePictureUrl && (
                  <img
                    src={page.profilePictureUrl}
                    alt={page.instagramName}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {page.instagramName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    @{page.instagramUsername}
                  </p>
                  <p className="text-xs text-gray-400">
                    Connected to: {page.pageName}
                  </p>
                </div>
                {selectedPage?.instagramId === page.instagramId && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSavePage}
            disabled={!selectedPage || saving}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {saving ? "Saving..." : "Connect Instagram Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
