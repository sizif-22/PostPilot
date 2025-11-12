"use client";
import { Sidebar } from "@/components/ChannelComponents/Sidebar";
import Link from "next/link";
import { getChannelBriefs } from "@/firebase/channel.firestore";
import { useState, useEffect, Suspense, useRef } from "react";
import { useUser } from "@/context/UserContext";
import Loading from "@/components/ui/Loading";
import { ChannelBrief } from "@/interfaces/Channel";
import { UserChannel } from "@/interfaces/User";
import { Button } from "@/components/ui/button";
import {
  rejectJoiningToAChannel,
  acceptJoiningToAChannel,
} from "@/firebase/user.firestore";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Notification as UserNotification } from "@/interfaces/User";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import router from "next/router";
import { logOut } from "../signin/action";
import { NewFolderResponsive } from "@/components/ChannelComponents/NewFolderResponsive";
import {
  FiPlus,
  FiUser,
  FiFolder,
  FiMoon,
  FiSun,
  FiLogOut,
} from "react-icons/fi";
import { useTheme } from "next-themes";

const ChannelsComponent = ({
  channels,
}: {
  channels: UserChannel[];
}): JSX.Element => {
  const [channelBriefs, setChannelBriefs] = useState<ChannelBrief[]>([]);
  useEffect(() => {
    const fetchChannels = async () => {
      if (channels) {
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
          },
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
            className="group bg-white dark:bg-darkButtons grid grid-cols-1 justify-items-center hover:bg-stone-50 dark:hover:bg-darkBorder transition-colors rounded-xl p-4 my-3 border border-stone-200 dark:border-darkBorder hover:border-stone-300 dark:hover:border-stone-600 shadow-sm hover:shadow-md dark:shadow-lg"
          >
            <div className="flex justify-between flex-col w-full items-start">
              <div className="space-y-3 w-full">
                <div className="flex items-start w-full gap-3 justify-between flex-wrap">
                  <Link
                    href={`/collections/${channel.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="font-bold text-lg lg:text-xl hover:text-violet-700 dark:text-white dark:hover:text-violet-400 transition-colors truncate">
                      {channel.name}
                    </h3>
                  </Link>
                  <div className="text-xs lg:text-sm bg-stone-100 dark:bg-darkBorder px-2.5 py-1 rounded-lg dark:text-white flex items-center gap-1.5 cursor-default group-hover:bg-stone-200 dark:group-hover:bg-darkBorder dark:group-hover:shadow transition-colors shrink-0">
                    {channel.authority === "Owner" ? (
                      <span className="text-sm">👑</span>
                    ) : channel.authority === "Reviewer" ? (
                      <span className="text-sm">📋</span>
                    ) : (
                      <span className="text-sm">✏️</span>
                    )}
                    <span className="font-medium">{channel.authority}</span>
                  </div>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3">
                  {channel.description.substring(0, 180)}
                  {channel.description &&
                    channel.description.length > 180 &&
                    "..."}
                </p>
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-500">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                  <span className="truncate">
                    Created:{" "}
                    {new Date(channel.createdAt.toDate()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-stone-500 dark:text-stone-400 py-12">
          <div className="bg-stone-100 dark:bg-darkButtons rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FiFolder className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium mb-2">No Collections found</p>
          <p className="text-sm">Create your first collection to get started</p>
        </div>
      )}
    </>
  );
};

const Page = () => {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const notificationRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [notificationBar, openNotificationBar] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [lastNotifCount, setLastNotifCount] = useState<number>(
    user?.notifications?.length || 0,
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
      <NewFolderResponsive open={open} setOpen={setOpen} />
      {/* Desktop View */}
      <main className="hidden lg:grid gap-4 p-4 grid-cols-[220px,_1fr] dark:bg-darkBackground">
        <Sidebar />
        <div className="bg-white dark:bg-secondDarkBackground border dark:border-darkBorder h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
          {/* Top Bar */}
          <div className="flex py-3 h-16 justify-between items-center sticky top-0 bg-white dark:bg-secondDarkBackground px-4 border-b border-stone-200 dark:border-darkBorder z-10">
            <h2 className="font-bold dark:text-white">Collections</h2>
            <button
              onClick={() => setOpen(true)}
              className="flex text-sm items-center gap-2 bg-stone-100 dark:bg-darkButtons dark:text-white transition-colors hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900 dark:hover:text-violet-300 px-3 py-1.5 rounded"
            >
              <FiPlus className="text-violet-500" />
              <span>New Collection</span>
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
      <main className="h-screen dark:bg-darkBackground lg:hidden flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-secondDarkBackground px-4 py-3 flex items-center justify-between shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] sticky top-0 z-50">
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-700 select-none tracking-wide cursor-pointer font-PlaywriteHU to-gray-600 dark:to-white/80 text-transparent bg-clip-text">
            PostPilot
          </h1>
          <div className="flex gap-3 justify-center items-center">
            {/* Notifications */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => {
                  openNotificationBar(!notificationBar);
                }}
                className="p-2 transition-all hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl relative"
              >
                <IoIosNotificationsOutline className="w-6 h-6 dark:text-white" />
                {notifications && notifications.length > 0 && (
                  <div className="w-2 h-2 absolute top-1.5 rounded-full right-1.5 bg-red-500 animate-pulse"></div>
                )}
              </button>

              {/* Notification Dropdown */}
              <div
                ref={notificationRef}
                className={`absolute right-0 top-12 z-[51] w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1a1a1a] border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl transition-all duration-300 ${
                  !notificationBar && "hidden"
                }`}
              >
                <div className="p-3 border-b border-stone-200 dark:border-stone-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                {notifications == undefined || notifications.length == 0 ? (
                  <div className="flex flex-col justify-center items-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    <IoIosNotificationsOutline className="w-8 h-8 mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map(
                      (notification: UserNotification, index: number) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all duration-200 border-b border-stone-100 dark:border-stone-800 last:border-b-0"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col items-start gap-1">
                              {notification.Type == "Ask" && (
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                  {notification.owner}
                                </span>
                              )}
                              <span className="text-gray-600 dark:text-gray-300 text-sm">
                                {notification.Type == "Ask" &&
                                  "invited you to join"}{" "}
                                <span className="font-medium text-violet-600 dark:text-violet-400">
                                  {notification.channelName}
                                </span>
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {notification.channelDescription}
                            </p>
                            {notification.Type === "Ask" && (
                              <div className="flex justify-end gap-2 mt-2">
                                <Button
                                  onClick={() =>
                                    rejectJoiningToAChannel(
                                      notification,
                                      user.email,
                                    )
                                  }
                                  variant={"ghost"}
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  Reject
                                </Button>
                                <Button
                                  onClick={() =>
                                    acceptJoiningToAChannel(notification, user)
                                  }
                                  size="sm"
                                  className="bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                  Accept
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"outline"}
                  className="rounded-full border-2 border-violet-200 dark:border-violet-800 w-10 h-10 overflow-hidden p-0.5 flex items-center justify-center hover:border-violet-400 dark:hover:border-violet-600 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="size-8 rounded-full shrink-0 bg-violet-500 shadow object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mr-4" align="end">
                {/* User Info Section */}
                <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full bg-violet-500 shadow object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Collections
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.channels.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.isVerified
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Navigation */}
                {user?.isVerified && (
                  <DropdownMenuItem
                    onClick={() => router.push("/collections")}
                    className="px-3 py-2 cursor-pointer"
                  >
                    <FiFolder className="w-4 h-4 mr-3" />
                    <span>My Collections</span>
                  </DropdownMenuItem>
                )}

                {/* Theme Toggle */}
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="px-3 py-2 cursor-pointer"
                >
                  {theme === "dark" ? (
                    <>
                      <FiSun className="w-4 h-4 mr-3" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <FiMoon className="w-4 h-4 mr-3" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={async () => {
                    await logOut();
                    window.location.reload();
                  }}
                  className="px-3 py-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <FiLogOut className="w-4 h-4 mr-3" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            <Suspense fallback={<Loading />}>
              <ChannelsComponent channels={user.channels} />
            </Suspense>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          {/* <Button
            onClick={() => setOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
            <span><FiPlus className="w-6 h-6"/></span>
          </Button> */}
          <button
            onClick={() => setOpen(true)}
            className="flex text-sm items-center gap-2 bg-stone-100 dark:bg-darkButtons dark:text-white transition-colors hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900 dark:hover:text-violet-300 px-3 py-1.5 rounded"
          >
            <FiPlus className="text-violet-500" />
            <span>New Collection</span>
          </button>
        </div>
      </main>
    </>
  );
};

export default Page;
