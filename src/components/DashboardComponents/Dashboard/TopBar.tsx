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
    <div className="border-b px-4 py-3 h-16 mb-4  border-stone-200 sticky top-0 z-50 bg-white">
      <div className="flex items-center justify-between py-0.5">
        <div>
          <span className="text-sm font-bold block">{channel?.name}</span>
          <span className="text-xs block text-stone-500">
            {channel?.description}
          </span>
        </div>
        {(channel?.authority == "Contributor" ||
          channel?.authority == "Owner") && (
          <>
            <button
              onClick={() => setOpen(true)}
              className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded">
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
