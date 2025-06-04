"use client";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useState } from "react";
import { Team } from "@/components/Team/Team";
import { Configuration } from "@/components/Configuration/configuration";
import { Calendar } from "@/components/Calendar/Calendar";
import { Media } from "@/components/Media/Media";
import { ChannelContextProvider } from "@/context/ChannelContext";
import { useUser } from "@/context/UserContext";
export default function Home({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const { id } = params;
  const { user } = useUser();
  const userChannel = user?.channels.find((channel) => channel.id === id);
  const [route, setRoute] = useState("Dashboard");
  const Navigation = (route: string) => {
    setRoute(route);
  };
  interface ScheduledPost {
    id: string;
    title: string;
    start: Date;
    end: Date;
    platforms: string[];
    content: string;
    imageUrl?: string[];
  }

  const dummyScheduledPosts: ScheduledPost[] = [
    {
      id: "1",
      title: "Post 1",
      start: new Date(2025, 4, 15, 14, 0, 0),
      end: new Date(2025, 4, 15, 15, 0, 0),
      platforms: ["instagram"],
      content: `Check out our latest updates!
  #latestupdates #newproducts #exclusiveoffer
  https://www.example.com/latest-updates`,
      imageUrl: [
        "https://d11p0alxbet5ud.cloudfront.net/Pictures/1024x536/4/8/2/1417482_img_243663.jpg",
      ],
    },
    {
      id: "2",
      title: "LoL",
      start: new Date(2025, 4, 15, 11, 0, 0),
      end: new Date(2025, 4, 15, 11, 0, 0),
      platforms: ["facebook", "instagram"],
      content: "Check out our latest updates!",
      imageUrl: [
        "https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FcnW2SrwMlL?alt=media&token=7bb4222f-16a8-4822-82d3-761ae6d29bb8",
        "https://d11p0alxbet5ud.cloudfront.net/Pictures/1024x536/4/8/2/1417482_img_243663.jpg",
        "https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FcnW2SrwMlL?alt=media&token=7bb4222f-16a8-4822-82d3-761ae6d29bb8",
        "https://firebasestorage.googleapis.com/v0/b/eventy-22.appspot.com/o/Se7jYhf6ITwaXMbIO7pG%2FcnW2SrwMlL?alt=media&token=7bb4222f-16a8-4822-82d3-761ae6d29bb8",
      ],
    },
    {
      id: "3",
      title: "Facebook & Instagram Post",
      start: new Date(2025, 4, 29),
      end: new Date(2025, 4, 29),
      platforms: ["facebook"],
      content: "Check out our latest updates!",
    },
    // Add more dummy posts as needed
  ];

  return (
    <>
      {userChannel !== undefined ? (
        <ChannelContextProvider userChannel={userChannel}>
          <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
            <Sidebar Callbackfunc={Navigation} route={route} />
            {route == "Dashboard" ? (
              <Dashboard dummyScheduledPosts={dummyScheduledPosts} />
            ) : route == "Team" ? (
              <Team />
            ) : route == "Calendar" ? (
              <Calendar dummyScheduledPosts={dummyScheduledPosts} />
            ) : route == "Media" ? (
              <Media />
            ) : (
              <Configuration />
            )}
          </main>
        </ChannelContextProvider>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-2xl font-bold">Channel not found</h1>
        </div>
      )}
    </>
  );
}
