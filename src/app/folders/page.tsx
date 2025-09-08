"use client";
import { Sidebar } from "@/components/ChannelComponents/Sidebar";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { getChannelBriefs } from "@/firebase/channel.firestore";
import { useState, useEffect, Suspense, useRef } from "react";
import { useUser } from "@/context/UserContext";
import Loading from "@/components/ui/Loading";
import { NewChannel } from "@/components/ChannelComponents/newChannel";
import { ChannelBrief } from "@/interfaces/Channel";
import { UserChannel } from "@/interfaces/User";
import { Button } from "@/components/ui/button";
import {
  rejectJoiningToAChannel,
  acceptJoiningToAChannel,
} from "@/firebase/user.firestore";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Notification as UserNotification } from "@/interfaces/User"; // Alias to avoid conflict
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@radix-ui/react-hover-card";
import router from "next/router";
import { logOut } from "../signin/action";

const ChannelsComponent = ({
  channels,
}: {
  channels: UserChannel[];
}): JSX.Element => {
  const [notificationBar, openNotificationBar] = useState<boolean>(false);
  const [channelBriefs, setChannelBriefs] = useState<ChannelBrief[]>([]);
  useEffect(() => {
    const fetchChannels = async () => {
      if (channels.length > 0) {
        const briefs = await getChannelBriefs(channels);
        const sortedBriefs = (Object.values(briefs) as ChannelBrief[]).sort(
          (a, b) => {
            const dateA = a.createdAt.toDate
              ? a.createdAt.toDate()
              : new Date(a.createdAt.seconds * 1000);
            const dateB = b.createdAt.toDate
              ? b.createdAt.toDate()
              : new Date(b.createdAt.seconds * 1000);
            return dateB.getTime() - dateA.getTime();
          }
        );
        setChannelBriefs(sortedBriefs);
      }
    };
    fetchChannels();
  }, [channels]);
  return (
    <>
      {channelBriefs.length > 0 ? (
        channelBriefs.map((channel: ChannelBrief) => (
          <div
            key={channel.name}
            className="group bg-white dark:bg-darkButtons grid grid-cols-1 justify-items-center hover:bg-stone-50 dark:hover:bg-darkBorder transition-colors rounded-lg p-4 my-4 border border-stone-200 dark:border-darkBorder hover:border-stone-300 dark:hover:border-stone-600">
            <div className="flex justify-between flex-col w-full items-start">
              <div className="space-y-2 w-full">
                <div className="flex items-center w-full gap-3 justify-between">
                  <Link href={`/folders/${channel.id}`}>
                    <h3 className="font-bold text-xl hover:text-violet-700 dark:text-white dark:hover:text-violet-400 transition-colors">
                      {channel.name}
                    </h3>
                  </Link>
                  <div className="text-sm bg-stone-100 dark:bg-darkBorder px-2 rounded-md dark:text-white flex items-center gap-1 cursor-default group-hover:bg-stone-200 dark:group-hover:bg-darkBorder dark:group-hover:shadow  transition-colors">
                    {channel.authority === "Owner" ? (
                      <span className="text-lg pb-1">👑</span>
                    ) : channel.authority === "Reviewer" ? (
                      <span className="text-lg pb-1">🔍</span>
                    ) : (
                      <span className="text-lg pb-1">✒️</span>
                    )}
                    {channel.authority}
                  </div>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {channel.description.substring(0, 250)}
                  {channel.description &&
                    channel.description.length > 250 &&
                    "..."}
                </p>
                <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-500">
                  <span>•</span>
                  <span>
                    CreatedAt: {channel.createdAt.toDate().toUTCString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-stone-500 dark:text-stone-400">
          <p>No Folders found</p>
        </div>
      )}
    </>
  );
};

const Page = () => {
  const { user } = useUser();
  const notificationRef = useRef<HTMLDivElement>(null);

  const [createNewChannel, setCreateNewChannel] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [notificationBar, openNotificationBar] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [lastNotifCount, setLastNotifCount] = useState<number>(
    user?.notifications?.length || 0
  );
  const [newNotif, setNewNotif] = useState<UserNotification | null>(null);
  const [showNewAlert, setShowNewAlert] = useState(false);

  useEffect(() => {
    if (user && user?.notifications != undefined)
      setNotifications(user?.notifications);
    const currentCount = user?.notifications?.length || 0;
    if (
      currentCount > lastNotifCount &&
      user?.notifications &&
      user.notifications.length > 0
    ) {
      setNewNotif(user.notifications[0]);
      setShowNewAlert(true);
      setTimeout(() => setShowNewAlert(false), 3000);
    }
    setLastNotifCount(currentCount);
  }, [user?.notifications, lastNotifCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        openNotificationBar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (user?.isVerified == false) {
      setNotifications([
        ...notifications,
        {
          channelName: "PostPilot Support",
          channelDescription:
            "You can find the verification link in your mail box.",
          owner: "Owner",
          channelId: "",
          Type: "Message",
        },
      ]);
    }
  }, [user]);
  if (!user) {
    return <Loading />;
  }
  return (
    <>
      {createNewChannel ? (
        <NewChannel setCreateNewChannel={setCreateNewChannel} />
      ) : (
        <>
          {/* Desktop View */}
          <main className="hidden lg:grid gap-4 p-4 grid-cols-[220px,_1fr] dark:bg-darkBackground">
            <Sidebar />
            <div className="bg-white dark:bg-secondDarkBackground border dark:border-darkBorder h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
              {/* Top Bar */}
              <div className="flex py-3 h-16 justify-between items-center sticky top-0 bg-white dark:bg-secondDarkBackground px-4 border-b border-stone-200 dark:border-darkBorder z-10">
                <h2 className="font-bold dark:text-white">Folders</h2>
                <button
                  onClick={() => setCreateNewChannel(true)}
                  className="flex text-sm items-center gap-2 bg-stone-100 dark:bg-darkButtons dark:text-white transition-colors hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900 dark:hover:text-violet-300 px-3 py-1.5 rounded">
                  <FiPlus className="text-violet-500" />
                  <span>New Folder</span>
                </button>
              </div>

              {/* Channels */}
              <div className="px-16 py-4">
                <Suspense fallback={<Loading />}>
                  <ChannelsComponent channels={user.channels} />
                </Suspense>
              </div>
            </div>
          </main>
          {/* Mobile & Tablet View */}
          <main className="h-screen dark:bg-darkBackground lg:hidden">
            {/* Header */}
            <div className="bg-white dark:bg-secondDarkBackground h-16 px-4 flex items-center justify-between shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 select-none tracking-wide cursor-pointer font-PlaywriteHU to-gray-600 dark:to-white/80 text-transparent bg-clip-text">
                PostPilot
              </h1>
              <div className="flex gap-2 justify-center items-center">
              
                <div className="relative">
                  <button
                    ref={buttonRef} // Add ref to button
                    onClick={() => {
                      openNotificationBar(!notificationBar);
                    }}
                    className="p-1 transition-all hover:bg-stone-200 dark:hover:bg-stone-900 rounded relative">
                    <IoIosNotificationsOutline className="w-6 h-auto dark:text-white" />
                    <div
                      className={`w-2 h-2 absolute top-1.5 rounded-full right-2 bg-red-600 ${
                        (notifications == undefined ||
                          notifications.length == 0) &&
                        "hidden"
                      }`}></div>
                  </button>
                  <div
                    ref={notificationRef}
                    className={`absolute -right-5 z-[51] w-80 bg-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl text-white transition-all duration-300 ${
                      !notificationBar && "hidden"
                    }`}>
                    {notifications == undefined || notifications.length == 0 ? (
                      <div className="flex justify-center items-center py-8 text-gray-400 text-sm">
                        No notifications at the moment
                      </div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-700/50">
                        {notifications.map(
                          (notification: UserNotification, index: number) => (
                            <div
                              key={index}
                              className="p-4 hover:bg-white/5 transition-all duration-200">
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-col  items-start gap-2 text-sm">
                                  {notification.Type == "Ask" && (
                                    <span className="font-semibold">
                                      {notification.owner}
                                    </span>
                                  )}
                                  <span className="text-gray-400">
                                    {notification.Type == "Ask" &&
                                      "invited you to join"}{" "}
                                    <span className="font-medium text-gray-200 text-sm">
                                      {notification.channelName}
                                    </span>
                                  </span>
                                </div>
                                <div className="pl-1">
                                  <p className="text-xs text-gray-400">
                                    {notification.channelDescription}
                                  </p>
                                </div>
                                {notification.Type === "Ask" && (
                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                      onClick={() =>
                                        rejectJoiningToAChannel(
                                          notification,
                                          user.email
                                        )
                                      }
                                      variant={"link"}
                                      className=" text-red-400 px-4 py-1.5 rounded-lg text-xs font-medium transition">
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        acceptJoiningToAChannel(
                                          notification,
                                          user
                                        )
                                      }
                                      variant={"secondary"}
                                      className=" text-black dark:text-white px-4 py-1.5 rounded-lg text-xs font-medium transition">
                                      Accept
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="rounded-full border border-violet-600 w-10 h-10 overflow-hidden p-0.5 flex items-center justify-center">
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className="size-8 rounded-full shrink-0 bg-violet-500 shadow"
                        />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-fit">
                      <div className="flex justify-between gap-3">
                        <Avatar>
                          <AvatarImage
                            src={user.avatar}
                            className="bg-violet-500"
                          />
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-semibold">{user.name}</h4>
                          <p className="text-sm dark:text-white/60 text-black/60">
                            {user.email}
                          </p>
                          <p className="text-sm dark:text-white/60 text-black/60">
                            {user.channels.length > 0
                              ? `You have: ${user.channels.length} folder`
                              : "You have no folders yet."}
                          </p>
                          {user?.isVerified == true && (
                            <Button
                              onClick={() => {
                                router.push("/folders");
                              }}
                              variant={"default"}
                              className="mt-3">
                              Folders
                            </Button>
                          )}
                          <Button
                            onClick={async () => {
                              await logOut();
                              window.location.reload();
                            }}
                            variant={"outline"}
                            className="mt-3 text-red-700 hover:text-red-700">
                            Log out
                          </Button>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
              </div>
            </div>
            <div className="overflow-y-auto relative">
              {/* Channels */}
              <div className="p-4">
                <Suspense fallback={<Loading />}>
                  <ChannelsComponent channels={user.channels} />
                </Suspense>
              </div>
            </div>
            
            <div></div>
          </main>
        </>
      )}
    </>
  );
};

export default Page;
