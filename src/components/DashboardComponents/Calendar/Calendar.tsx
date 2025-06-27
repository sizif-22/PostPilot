"use client";
import React, { useState, useMemo } from "react";
import { ContinuousCalendar } from "./ContinuousCalendar";
import { DetailsDialog } from "./DetailsDialog";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const Calendar = () => {
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
      <ContinuousCalendar
        highlightedDates={highlightedDates}
        onEventSelect={handleEventSelect}
      />
      <DetailsDialog
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        open={!!selectedEvent}
        setOpen={setSelectedEvent}
      />
    </>
  );
};
