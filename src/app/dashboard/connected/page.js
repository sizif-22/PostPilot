"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/Firebase/firebase.config";
import Cookies from "js-cookie";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";

const Connected = ({ params }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupOpen, setPopupOpen] = useState(true);
  const [selectedPage, setSelectedPage] = useState({ name: "", id: "" });
  const [pages, setPages] = useState([]);

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
    // Only proceed with token exchange if we have a valid ID and we're in the browser
    if (!id || typeof window === 'undefined') return;

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

        // Construct the URL with query parameters
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&client_secret=${process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET}&redirect_uri=https://postpilot-22.vercel.app/dashboard/connected&code=${code.split("&")[0]}`;

        // Exchange code for access token using GET request
        const response = await fetch(tokenUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

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
        const projectRef = doc(db, "project", id);
        await updateDoc(projectRef, {
          FacebookConnected: true,
          facebookAccessToken: data.access_token,
        });

        // Fetch user pages with the access token
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?access_token=${data.access_token}`
        );

        if (!pagesResponse.ok) {
          throw new Error("Failed to fetch user pages");
        }

        const pagesData = await pagesResponse.json();
        console.log(pagesData); // List of Pages
        
        if (pagesData.data && Array.isArray(pagesData.data)) {
          setPages(pagesData.data);
          setPopupOpen(true);
        } else {
          throw new Error("Invalid page data received");
        }
      } catch (err) {
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
      setPopupOpen(false);
      const projectRef = doc(db, "project", id);
      await updateDoc(projectRef, {
        pageName: selectedPage.name,
        pageId: selectedPage.id,
      });
      router.replace(`/dashboard/${id}`);
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-[#212121] to-black text-white">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-[#212121] to-black text-white">
      <div>Connecting to Facebook...</div>
      <PopUp
        isOpen={popupOpen}
        onClose={handlePageSelection}
        setSelectedPage={setSelectedPage}
        selectedPage={selectedPage}
        pages={pages}
      />
    </div>
  );
};

const PopUp = ({ selectedPage, setSelectedPage, isOpen, onClose, pages }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-10 flex items-center justify-center">
      <div
        className="z-20 w-1/2 h-2/3 relative p-10 rounded-xl bg-gradient-to-b from-[#212121] to-[#010101] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xl mb-4">Choose one Page:</p>
        <div className="max-h-[60%] overflow-y-auto">
          {pages.map((value, index) => (
            <div
              key={index}
              className={`${
                selectedPage.id === value.id ? "border border-white" : ""
              } p-5 my-2 transition-all rounded hover:shadow hover:shadow-white cursor-pointer`}
              onClick={() => {
                setSelectedPage({ name: value.name, id: value.id });
              }}
            >
              <h1 className="text-3xl">{value.name}</h1>
              <p className="text-xl text-gray-400">{value.id}</p>
            </div>
          ))}
        </div>
        {selectedPage.id && (
          <Button className="absolute bottom-10 right-10" onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default Connected;