"use client";
import { Dashboard } from "@/components/DashboardComponents/Dashboard/Dashboard";
import { Sidebar } from "@/components/DashboardComponents/Sidebar/Sidebar";
import { useCallback, useEffect, useState } from "react";
import { Team } from "@/components/DashboardComponents/Team/Team";
import { Configuration } from "@/components/DashboardComponents/Configuration/configuration";
import { Calendar } from "@/components/DashboardComponents/Calendar/Calendar";
import { Media } from "@/components/DashboardComponents/Media/Media";
import { Analysis } from "@/components/DashboardComponents/Analysis/Analysis";
import { ChannelContextProvider } from "@/context/ChannelContext";
import { useUser } from "@/context/UserContext";
import { MediaItem } from "@/interfaces/Media";
import { UserChannel } from "@/interfaces/User";
import Loading from "@/components/ui/Loading";
import { Issues } from "../Issues/Issues";
import { useRouter } from "next/navigation";
import NotificationSection from "../Sidebar/notification";
import NavBar from "./NavBar";
export default function ChannelDashboard({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [route, setRoute] = useState<string | null>(null);
  useEffect(() => {
    const path = window.location.hash.slice(1);
    if (!path) setRoute("Dashboard");
    else setRoute(path);
  }, []);

  const userChannel = user?.channels.find(
    (channel: UserChannel) => channel.id === id
  );

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  const Navigation = (route: string) => {
    router.push(`#${route}`);
    setRoute(route);
  };

  const calculateStorageUsed = useCallback(async (items: any) => {
    try {
      const { ref, getMetadata } = await import("firebase/storage");
      const { storage } = await import("@/firebase/config");

      let totalSize = 0;
      const metadataPromises = items.map(async (imageRef: any) => {
        try {
          const metadata = await getMetadata(imageRef);
          return metadata.size;
        } catch (err) {
          console.error(
            `Error getting metadata for ${imageRef.fullPath}:`,
            err
          );
          return 0;
        }
      });

      const sizes = await Promise.all(metadataPromises);
      totalSize = sizes.reduce((acc, size) => acc + size, 0);

      const sizeInMB = totalSize / (1024 * 1024);
      setStorageUsed(parseFloat(sizeInMB.toFixed(1)));
    } catch (error) {
      console.error("Error calculating storage:", error);
    }
  }, []);

  const fetchImgs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { ref, listAll, getDownloadURL, getMetadata } = await import(
        "firebase/storage"
      );
      const { storage } = await import("@/firebase/config");

      const storageRef = ref(storage, id.toString());
      const result = await listAll(storageRef);

      calculateStorageUsed(result.items);

      const urlPromises = result.items.map(async (itemRef) => {
        try {
          const [url, metadata] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef),
          ]);

          const isVideo = metadata.contentType
            ? metadata.contentType.startsWith("video/")
            : false;

          return {
            url,
            path: itemRef.fullPath,
            name: itemRef.name,
            contentType: metadata.contentType,
            isVideo,
            size: metadata.size,
            timeCreated: metadata.timeCreated,
          };
        } catch (err) {
          console.error(
            `Error getting URL or metadata for ${itemRef.fullPath}:`,
            err
          );
          return null;
        }
      });

      const urlObjects = await Promise.all(urlPromises);
      const validUrlObjects = urlObjects.filter((obj) => obj !== null);
      setMedia(validUrlObjects as any);
    } catch (error) {
      console.error("Error fetching images:", error);
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [id, calculateStorageUsed]);

  useEffect(() => {
    if (id) {
      fetchImgs();
    }
  }, [id, fetchImgs]);

  if (isLoading || !route || user == null) {
    return <Loading />;
  }

  return (
    <>
      {userChannel !== undefined ? (
        <ChannelContextProvider userChannel={userChannel}>
          <main className="dark:bg-darkBackground">
            <div className="lg:hidden sticky top-0 z-[100]">
              <NavBar user={user} Callbackfunc={Navigation} route={route} />
            </div>
            <div className="lg:grid gap-4 lg:p-4 lg:grid-cols-[220px,_1fr]">
              <div className="hidden lg:block">
                <Sidebar Callbackfunc={Navigation} route={route} />
              </div>
              {route === "Dashboard" ? (
                // <Dashboard
                //   storageLimit={500}
                //   media={media}
                //   storageUsed={storageUsed}
                //   filesCount={media.length}
                // />
                <div></div>
              ) : route === "Analysis" ? (
                <Analysis />
              ) : route === "Team" ? (
                <Team />
              ) : route === "Calendar" ? (
                <Calendar media={media} />
              ) : route === "Media" ? (
                <Media
                  media={media}
                  onRefresh={fetchImgs}
                  storageUsed={storageUsed}
                  isLoading={isLoading}
                />
              ) : route === "Issues" ? (
                <Issues media={media} />
              ) : (
                <Configuration />
              )}
            </div>
          </main>
        </ChannelContextProvider>
      ) : (
        <div className="flex justify-center items-center h-screen dark:bg-black">
          <h1 className="text-2xl font-bold dark:text-white">
            Channel not found
          </h1>
        </div>
      )}
    </>
  );
}
