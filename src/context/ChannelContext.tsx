"use client";
import { getChannel } from "@/firebase/channel.firestore";
import React, { useContext, useState, useEffect } from "react";
import { Channel } from "@/interfaces/Channel";
import { UserChannel } from "@/interfaces/User";
import { createContext } from "react";

const ChannelContext = createContext<{
  channel: Channel | null;
  setChannel: (channel: Channel | null) => void;
}>({
  channel: null,
  setChannel: () => { },
});

import { checkTokenExpiration } from "@/utils/token-expiration";

export const ChannelContextProvider = ({ children, userChannel }: { children: React.ReactNode, userChannel: UserChannel }) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  useEffect(() => {
    if (userChannel) {
      getChannel(userChannel, (channel) => setChannel(channel));
    }
  }, [userChannel]);

  useEffect(() => {
    if (channel) {
      checkTokenExpiration(channel);
    }
  }, [channel]);

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
