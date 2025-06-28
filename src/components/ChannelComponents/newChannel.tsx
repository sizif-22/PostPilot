"use client";
import { useState, useRef } from "react";
import { FiFacebook, FiInstagram } from "react-icons/fi";
import { Button } from "../ui/button";
import { createChannel } from "@/firebase/channel.firestore";
import { useUser } from "@/context/UserContext";
import { Timestamp } from "firebase/firestore";
import { Channel } from "@/interfaces/Channel";
export const NewChannel = ({
  setCreateNewChannel,
}: {
  setCreateNewChannel: (value: boolean) => void;
}) => {
  const { user } = useUser();
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const handleCreateChannel = async () => {
    if (channelName && user?.email && user.name) {
      const channel: Channel = {
        id: "",
        name: channelName,
        description: channelDescription,
        authority: "Owner",
        createdAt: Timestamp.now(),
        posts: {},
        TeamMembers: [
          {
            name: user?.name,
            email: user?.email,
            role: "Owner",
            status: "active",
          },
        ],
      };
      await createChannel(channel, user);
      setCreateNewChannel(false);
    }
  };
  const handleCancel = () => {
    setCreateNewChannel(false);
  };
  const handleFacebookConnect = () => {
    console.log("Connecting to Facebook...");
  };

  const handleInstagramConnect = () => {
    console.log("Connecting to Instagram...");
  };

  const socialMedia = [
    {
      name: "Facebook",
      icon: FiFacebook,
      connect: handleFacebookConnect,
    },
    {
      name: "Instagram",
      icon: FiInstagram,
      connect: handleInstagramConnect,
    },
  ];
  return (
    <main className="p-4 md:px-24 grid-cols-[220px,_1fr] dark:bg-darkBackground">
      <div className="bg-white dark:bg-secondDarkBackground dark:border-darkBorder h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] pb-10">
        {/* Top Bar */}
        <div className="flex py-3 h-16 justify-between items-center sticky top-0 bg-white dark:bg-secondDarkBackground px-4 border-b border-stone-200 dark:border-darkBorder z-10">
          <h2 className="font-bold dark:text-white">Create New Channel</h2>
        </div>
        <div className="px-8 md:px-16">
          <div className="p-6 space-y-6">
            <div className="pb-4">
              <h2 className="text-xl border-b border-stone-200 dark:border-gray-700 pb-4 mb-2 font-semibold dark:text-white">
                Channel Details
              </h2>
              <p className="text-sm text-stone-500 dark:text-white/70">
                Create a new channel to start posting to your social media
                accounts.
              </p>
              <div className="flex flex-col gap-2 w-full border-2 border-stone-200 dark:border-darkBorder rounded-lg px-4 py-2 mt-4">
                <div className="flex flex-col items-start w-full py-2 gap-2">
                  <h2 className="text-lg font-medium dark:text-white">Channel Name</h2>
                  <input
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    type="text"
                    className="w-1/2 border-2 border-stone-200 dark:border-darkBorder rounded-lg px-4 py-2 dark:bg-darkButtons dark:text-white"
                  />
                  <hr className="w-full border-stone-200 dark:border-gray-700 my-2" />
                  <h2 className="text-lg font-medium dark:text-white">Channel Description</h2>
                  <textarea
                    value={channelDescription}
                    onChange={(e) => setChannelDescription(e.target.value)}
                    className="w-full border-2 min-h-24 border-stone-200 dark:border-darkBorder rounded-lg px-4 py-2 dark:bg-darkButtons dark:text-white"
                  />
                </div>
              </div>
            </div>
            {/* Section Title */}
            {/* <div className="py-6 border-t">
              <h2 className="text-xl border-b border-stone-200 pb-4 mb-2 font-semibold">
                Social Media Connections
              </h2>
              <p className="text-sm text-stone-500">
                Connect your social media accounts to enable posting
              </p>
              <div className="flex flex-col gap-2 w-full border-2 border-stone-200 rounded-lg px-4 py-2 mt-4">
                {socialMedia.map((item, index) => (
                  <>
                    <div className="flex justify-between py-2 items-center w-full gap-2">
                      <div>
                        <h2 className="text-lg font-medium">
                          Connect to {item.name}
                        </h2>
                        <h3 className="text-sm text-stone-500">
                          Connect your {item.name} account to enable posting
                        </h3>
                      </div>
                      <button
                        onClick={item.connect}
                        className=" text-sm bg font-bold duration-300 bg-white hover:text-black text-black/70 transition-colors rounded-lg border hover:bg-stone-200 border-stone-200 px-4 py-2"
                      >
                        Connect
                      </button>
                    </div>
                    {index != socialMedia.length - 1 && (
                      <hr className="w-full border-stone-200" />
                    )}
                  </>
                ))}
              </div>
            </div> */}
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCancel}
                variant={"outline"}
                className="text-sm  hover:bg-stone-200 dark:hover:bg-darkButtons dark:bg-transparent dark:text-white dark:border-darkBorder duration-300 rounded-lg px-4 py-2">
                Cancel
              </Button>
              <Button
                onClick={handleCreateChannel}
                className={`text-sm ${
                  channelName
                    ? "bg-violet-700 hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-700 dark:text-white"
                    : "bg-stone-300 text-stone-500 hover:bg-stone-300 cursor-not-allowed dark:bg-darkButtons dark:text-gray-400"
                } duration-300 rounded-lg px-4 py-2`}>
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
