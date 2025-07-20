"use client";
import React, { useState, useMemo } from "react";
import { ContinuousCalendar } from "./ContinuousCalendar";
import { DetailsDialog } from "./DetailsDialog";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
import { Timestamp } from "firebase/firestore";
import { MediaItem } from "@/interfaces/Media";
import { Cal } from "./Cal";
export const Calendar = ({ media }: { media: MediaItem[] }) => {
  const [selectedEvent, setSelectedEvent] = useState<Post | null>(null);
  const { channel } = useChannel();

  // Get highlighted dates for the calendar
  const highlightedDates = useMemo(() => {
    const dateMap = new Map<string, Post[]>();

    if (channel?.posts) {
      Object.values(channel.posts).forEach((post) => {
        if (post.scheduledDate) {
          // Convert Unix timestamp to Date object
          const date = new Date(post.scheduledDate * 1000);
          // Create a consistent key format for the date
          const key = `${date.getFullYear()}-${
            date.getMonth() + 1
          }-${date.getDate()}`;

          if (!dateMap.has(key)) {
            dateMap.set(key, []);
          }
          dateMap.get(key)!.push(post);
        } else {
          if (post.date) {
            let date: Date | null = null;
            if (post.date instanceof Timestamp) {
              date = post.date.toDate();
            } else if (
              typeof post.date === "string" ||
              typeof post.date === "number"
            ) {
              date = new Date(post.date);
            } else if (
              typeof post.date === "object" &&
              post.date &&
              "getTime" in post.date
            ) {
              date = post.date as Date;
            }
            if (date && !isNaN(date.getTime())) {
              const key = `${date.getFullYear()}-${
                date.getMonth() + 1
              }-${date.getDate()}`;
              if (!dateMap.has(key)) {
                dateMap.set(key, []);
              }
              dateMap.get(key)!.push(post);
            }
          }
        }
      });
    }

    return Array.from(dateMap).map(([key, posts]) => {
      const [year, month, day] = key.split("-").map(Number);
      return {
        day,
        month: month - 1, // Convert to 0-based month index
        year,
        posts,
      };
    });
  }, [channel?.posts]);

  const handleEventSelect = (post: Post) => {
    setSelectedEvent(post);
  };

  return (
    <>
      <Cal
        highlightedDates={highlightedDates}
        onEventSelect={handleEventSelect}
      />
      <DetailsDialog
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        open={!!selectedEvent}
        setOpen={setSelectedEvent}
        media={media}
      />
    </>
  );
};
