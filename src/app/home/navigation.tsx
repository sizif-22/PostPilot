"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/DashboardComponents/Sidebar/ThemeToggle";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/context/NotificationContext";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { IoIosNotificationsOutline } from "react-icons/io";
import {
  acceptJoiningToAChannel,
  rejectJoiningToAChannel,
} from "@/firebase/user.firestore";
import { logOut } from "../signin/action";
import { Notification as UserNotification } from "@/interfaces/User"; // Alias to avoid conflict
import { NotificationConfig } from "@/context/NotificationContext";
import axios from "axios";
export const Navigation = () => {
  const router = useRouter();
  const { user } = useUser();
  const Buttons = [
    {
      name: "About",
      href: "#about",
    },
    {
      name: "Contact-Us",
      href: "#contact",
    },
    {
      name: "Privacy-Policy",
      href: "/privacy-policy",
    },
  ];
  const { addNotification } = useNotification();
  const notificationRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [notificationBar, openNotificationBar] = useState<boolean>(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [lastNotifCount, setLastNotifCount] = useState<number>(
    user?.notifications?.length || 0
  );
  const [newNotif, setNewNotif] = useState<UserNotification | null>(null);

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

  return (
    <nav className="fixed top-0 w-full transition-all duration-300 dark:bg-black/90 bg-white/90 backdrop-blur-sm z-50 dark:border-violet-900 border-violet-200">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <h1 className="select-none cursor-pointer text-xl sm:text-2xl font-PlaywriteHU dark:text-violet-400 text-violet-700 font-bold">
            PostPilot
          </h1>
          <div className="flex items-center gap-2 sm:gap-6">
            {Buttons.map((button, index) => (
              <Link
                key={index}
                href={button.href}
                className="text-sm sm:text-base dark:text-zinc-400  text-gray-700 dark:hover:text-violet-400 hover:text-violet-700 transition-colors">
                {button.name}
              </Link>
            ))}
            {/* <Button
              onClick={async () => {
                const res = await axios.post("/api/smtp/invitation",{sender:"s1h9e7r4if@gmail.com",receiver:"sheriflotfy22@hotmail.com",channelId:"123"});
                console.log("Response:", res.data);
              }}>
              Send Email
            </Button> */}
            <ThemeToggle />
            <Suspense fallback={<div>Loading...</div>}>
              {user?.email && (
                <>
                  <span className="text-black dark:text-white">|</span>
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
                    className={`absolute top-16 right-40 z-[51] w-80 bg-[#1a1a1a]/90 backdrop-blur-md rounded-xl shadow-2xl text-white transition-all duration-300 ${
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
                </>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
};
