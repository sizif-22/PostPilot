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
  const urlParams = new URLSearchParams(window.location.search);
  const [popupOpen, setPopupOpen] = useState(true);
  const [selectedPage, setSelectedPage] = useState("");
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
    // Only proceed with token exchange if we have a valid ID
    if (!id) return;

    const getAccessToken = async () => {
      try {
        const code = urlParams.get("code");
        // Get the code from URL search params

        if (!code) {
          console.log("No authorization code found");
          return;
        }

        // Exchange code for access token
        const response = await fetch(
          "https://graph.facebook.com/v19.0/oauth/access_token",
          {
            method: "GET",
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

        const response2 = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?access_token=${data.access_token}`
        );

        const data2 = await response2.json();
        console.log(data2); // List of Pages
        setPages([...data2.data]);
        setPopupOpen(true);

        // Redirect back to dashboard
        // router.push(`/dashboard/${id}`);
      } catch (err) {
        console.error("Error getting access token:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getAccessToken();
  }, [id, router, urlParams]);

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
        onClose={() => {
          setPopupOpen(false);
          router.replace(`/dashboard/${id}`);
        }}
        setSelectedPage={setSelectedPage}
        selectedPage={selectedPage}
        pages={pages}
      />
    </div>
  );
};

const PopUp = ({ selectedPage, setSelectedPage, isOpen, onClose, pages }) => {
  const arr = [{ name: "page1" }, { name: "page2" }, { name: "page3" }];
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-10 flex items-center justify-center"
      // onClick={onClose}
    >
      <div
        className="z-20 w-[50vw] h-[70vh] relative p-10 rounded-xl bg-gradient-to-b from-[#212121] to-[#010101] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <p>Choose one Page:</p>
        {pages.map((value, index) => (
          <div
            key={index}
            className={`${
              selectedPage == value.name && "border"
            } p-5 my-2 transition-all rounded hover:shadow hover:shadow-white`}
            onClick={() => {
              setSelectedPage(value.name);
            }}
          >
            {value.name}
          </div>
        ))}
        {selectedPage && (
          <Button className="absolute bottom-10 right-10" onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default Connected;
