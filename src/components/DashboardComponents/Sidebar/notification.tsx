import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { IoIosNotificationsOutline } from "react-icons/io";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  acceptJoiningToAChannel,
  rejectJoiningToAChannel,
} from "@/firebase/user.firestore";
const NotificationSection = () => {
  const { user } = useUser();
  const [notificationBar, openNotificationBar] = useState<boolean>(false);
  return (
    <div className="border-b h-16 flex items-center justify-between border-stone-300">
      <Link href="/home">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 select-none tracking-wide cursor-pointer font-PlaywriteHU to-gray-600 text-transparent bg-clip-text">
          PostPilot
        </h1>
      </Link>
      <button
        onClick={() => {
          console.log(notificationBar);
          openNotificationBar(!notificationBar);
        }}
        className="p-1 transition-all hover:bg-stone-200 rounded relative"
      >
        <IoIosNotificationsOutline className="w-6 h-auto" />
        <div
          className={`w-2 h-2 absolute top-1.5 rounded-full right-2 bg-red-600 ${
            (user?.notifications == undefined ||
              user?.notifications?.length == 0) &&
            "hidden"
          }`}
        ></div>
      </button>
      <div
        className={`absolute top-16 left-[12.8rem] z-[51] w-80 bg-[#1f1f1f]/90 backdrop-blur-md rounded-xl shadow-2xl text-white transition-all duration-300 ${
          !notificationBar && "hidden"
        }`}
      >
        {user?.notifications == undefined ||
        user?.notifications?.length == 0 ? (
          <div className="flex justify-center items-center py-8 text-gray-400 text-sm">
            No notifications at the moment
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-700/50">
            {user?.notifications?.map((notification, index) => (
              <div
                key={index}
                className="p-4 hover:bg-white/5 transition-all duration-200"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col  items-start gap-2 text-sm">
                    <span className="font-semibold">{notification.owner}</span>
                    <span className="text-gray-400">
                      invited you to join{" "}
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
                          rejectJoiningToAChannel(notification, user)
                        }
                        variant={"link"}
                        className=" text-red-400 px-4 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() =>
                          acceptJoiningToAChannel(notification, user)
                        }
                        variant={"secondary"}
                        className=" text-black px-4 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationSection;
