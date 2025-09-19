import { logOut } from "@/app/signin/action";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/Loading";
import {
  rejectJoiningToAChannel,
  acceptJoiningToAChannel,
} from "@/firebase/user.firestore";
import { User } from "@/interfaces/User";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import router from "next/router";
import React, { Suspense, useRef, useState } from "react";
import { FiFolder, FiSun, FiMoon, FiLogOut, FiPlus } from "react-icons/fi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Notification as UserNotification } from "@/interfaces/User";
import { useTheme } from "next-themes";
import { HiMenuAlt2 } from "react-icons/hi";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "../Sidebar/Sidebar";

export default function NavBar({
  user,
  Callbackfunc,
  route,
}: {
  user: User;
  Callbackfunc: (route: string) => void;
  route: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [notificationBar, openNotificationBar] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  return (
    <main className="dark:bg-darkBackground mb-2 sticky top-0">
      {/* Header */}
      <div className="dark:bg-secondDarkBackground px-4 py-3 flex items-center justify-between shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] sticky top-0 z-50">
        <div className="flex gap-2 items-center justify-center">
          <Sheet>
            <SheetTrigger className="lg:hidden">
              <HiMenuAlt2 className="dark:text-white" size={28} />
            </SheetTrigger>
            <SheetContent side={"left"} className="dark:text-white">
              <Sidebar Callbackfunc={Callbackfunc} route={route} />
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-700 select-none tracking-wide cursor-pointer font-PlaywriteHU to-gray-600 dark:to-white/80 text-transparent bg-clip-text">
            PostPilot
          </h1>
        </div>
        <div className="flex gap-3 justify-center items-center">
          {/* Notifications */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => {
                openNotificationBar(!notificationBar);
              }}
              className="p-2 transition-all hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl relative">
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
              }`}>
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
                        className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-all duration-200 border-b border-stone-100 dark:border-stone-800 last:border-b-0">
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
                                    user.email
                                  )
                                }
                                variant={"ghost"}
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                                Reject
                              </Button>
                              <Button
                                onClick={() =>
                                  acceptJoiningToAChannel(notification, user)
                                }
                                size="sm"
                                className="bg-violet-600 hover:bg-violet-700 text-white">
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"outline"}
                className="rounded-full border-2 border-violet-200 dark:border-violet-800 w-10 h-10 overflow-hidden p-0.5 flex items-center justify-center hover:border-violet-400 dark:hover:border-violet-600 transition-colors">
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
                    }`}>
                    {user.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              {user?.isVerified && (
                <DropdownMenuItem
                  onClick={() => router.push("/folders")}
                  className="px-3 py-2 cursor-pointer">
                  <FiFolder className="w-4 h-4 mr-3" />
                  <span>My Collections</span>
                </DropdownMenuItem>
              )}

              {/* Theme Toggle */}
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="px-3 py-2 cursor-pointer">
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
                className="px-3 py-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
                <FiLogOut className="w-4 h-4 mr-3" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </main>
  );
}
