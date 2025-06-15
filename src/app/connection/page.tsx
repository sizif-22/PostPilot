"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import Cookies from "js-cookie";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { facebookChannel, Page } from "@/interfaces/Channel";

const Connection = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  const id = Cookies.get("currentChannel");

  useEffect(() => {
    if (!id) {
      setError(
        "No valid channel ID found. Please go back to dashboard and try again."
      );
      setLoading(false);
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
          `/api/facebook/connect?code=${code.split("&")[0]}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get access token");
        }

        const projectRef = doc(db, "Channels", id as string);
        await updateDoc(projectRef, {
          FacebookConnected: true,
          facebookAccessToken: data.access_token,
        });

        const pagesResponse = await fetch(
          `/api/facebook/pages?access_token=${data.access_token}`
        );

        if (!pagesResponse.ok) {
          throw new Error("Failed to fetch user pages");
        }

        const pagesData = await pagesResponse.json();

        if (pagesData.data && Array.isArray(pagesData.data)) {
          setPages(pagesData.data);
        } else {
          throw new Error("Invalid page data received");
        }
      } catch (err: any) {
        console.error("Error getting access token:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getAccessToken();
  }, [id, router]);

  const handlePageSelection = async () => {
    try {
      if (!selectedPage) {
        setError("Please select a page");
        return;
      }
      const projectRef = doc(db, "Channels", id as string);
      const { access_token, ...rest } = selectedPage;
      await updateDoc(projectRef, {
        "socialMedia.facebook": {
          accessToken: access_token,
          ...rest,
        } as facebookChannel,
      });
      router.replace(`/channels/${id}`);
    } catch (err) {
      console.error("Error updating page selection:", err);
      setError("Failed to save page selection");
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
            Choose a Facebook Page
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Select the page you want to connect to your account
          </p>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto min-h-[50vh] max-h-[70vh] pr-2">
          {pages.length > 0 ? (
            pages.map((page) => (
              <div
                onClick={() => setSelectedPage(page)}
                key={page.id}
                className={`flex items-center justify-between group cursor-pointer transition-all duration-200 border hover:border-violet-400 ${
                  selectedPage?.id === page.id
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:bg-gray-50"
                } p-4 rounded-lg`}
              >
                <div className="flex flex-col gap-1">
                  <h2
                    className={`font-medium ${
                      selectedPage?.id === page.id
                        ? "text-violet-700"
                        : "text-gray-900"
                    } group-hover:text-violet-700`}
                  >
                    {page.name}
                  </h2>
                  <p className="text-sm text-gray-500">ID: {page.id}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPage?.id === page.id
                      ? "border-violet-500 bg-violet-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPage?.id === page.id && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mb-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-medium">No pages found</p>
              <p className="text-sm text-gray-400 mt-1">
                Please make sure you have admin access to at least one Facebook
                page
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={handlePageSelection}
          className={`absolute bottom-6 right-6 transition-all duration-200 ${
            !selectedPage
              ? "bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed"
              : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
          disabled={!selectedPage}
        >
          Connect Page
        </Button>
      </div>
    </div>
  );
};
export default Connection;
