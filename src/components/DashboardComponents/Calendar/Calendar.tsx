"use client";
import React, { useState, useMemo } from "react";
import { ContinuousCalendar } from "./ContinuousCalendar";
import { DetailsDialog } from "./DetailsDialog";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
import { formatDateInTimezone, getCurrentTimeInTimezone } from "@/lib/utils";

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
    channel?.posts &&
      channel?.posts
        .filter((post) => post.published)
        .forEach((post) => {
          if (post.scheduledDate) {
            const date = new Date(
              formatDateInTimezone(post.scheduledDate, "Africa/Cairo").date
            );
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            if (!dateMap.has(key)) {
              dateMap.set(key, []);
            }
            dateMap.get(key)!.push(post);
          }
        });

    return Array.from(dateMap).map(([key, posts]) => {
      const [year, month, day] = key.split("-").map(Number);
      return {
        day,
        month,
        year,
        posts,
      };
    });
  }, [channel?.posts]);

  // Get upcoming events (today and future)

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
