"use client";
import { Channel, getChannel } from "@/firebase/channel.firestore";
import { UserChannel } from "@/firebase/user.firestore";
import React, { useContext, useState, use, useEffect } from "react";
import { createContext } from "react";

const ChannelContext = createContext<{
  channel: Channel | null;
  setChannel: (channel: Channel | null) => void;
}>({
  channel: null,
  setChannel: () => {},
});

export const ChannelContextProvider = ({ children , userChannel }: { children: React.ReactNode , userChannel: UserChannel }) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  useEffect(() => {
    if (userChannel) {
      getChannel(userChannel, (channel) => setChannel(channel));
    }
  }, [userChannel]);
  return (
    <ChannelContext.Provider value={{ channel, setChannel }}>
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannel = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannel must be used within a ChannelProvider");
  }
  return context;
};
