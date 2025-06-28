"use client";
import React from "react";
import { FiCalendar } from "react-icons/fi";
import { CPDialog } from "./CPDialog";
import { useState } from "react";
import { MediaItem } from "@/interfaces/Media";
import { useChannel } from "@/context/ChannelContext";
export const TopBar = ({ media }: { media: MediaItem[] }) => {
  const { channel } = useChannel();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b dark:border-darkBorder px-4 py-3 h-16 mb-4 border-stone-200 sticky top-0 z-50 bg-white  dark:bg-secondDarkBackground transition-colors duration-300">
      <div className="flex items-center justify-between py-0.5">
        <div>
          <span className="text-sm font-bold block text-gray-900 dark:text-gray-100 transition-colors">
            {channel?.name}
          </span>
          <span className="text-xs block text-stone-500 dark:text-stone-300 transition-colors">
            {channel?.description}
          </span>
        </div>
        {(channel?.authority == "Contributor" ||
          channel?.authority == "Owner") && (
          <>
            <button
              onClick={() => setOpen(true)}
              className="flex text-sm items-center gap-2 dark:text-white bg-stone-100 dark:bg-darkButtons transition-colors hover:bg-violet-100 dark:hover:bg-violet-950 hover:text-violet-700 dark:hover:text-white px-3 py-1.5 rounded">
              <FiCalendar className="text-violet-500" />
              <span>Schedule Post</span>
            </button>
            <CPDialog open={open} setOpen={setOpen} media={media} />
          </>
        )}
      </div>
    </div>
  );
};
