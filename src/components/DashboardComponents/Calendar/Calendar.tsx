"use client";
import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import React, { useState, useMemo } from "react";
import { ContinuousCalendar } from "./ContinuousCalendar";
import { NewDetailsDialog } from "./NewDetailsDialog";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
import { Timestamp } from "firebase/firestore";
import { MediaItem } from "@/interfaces/Media";
import { Cal } from "./Cal";
import { useNotification } from "@/context/NotificationContext";
export const Calendar = ({ media }: { media: MediaItem[] }) => {
  const [selectedEvent, setSelectedEvent] = useState<Post | null>(null);
  const { channel } = useChannel();
  const { addNotification } = useNotification();
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
  const onPostMove = async (
    post: Post,
    newDay: number,
    newMonth: number,
    newYear: number
  ) => {
    console.log("DATE:", newYear, newMonth, newDay);
    if (!channel?.id) throw new Error("channel id in invalid");

    if (!post.scheduledDate || post.scheduledDate * 1000 < Date.now()) {
      addNotification({
        messageOnProgress: "Updating Date",
        successMessage: "",
        failMessage: "This Post is already Published.",
        func: [
          new Promise((resolve, reject) => {
            reject();
          }),
        ],
      });
      return;
    }
    const originalDate = new Date(post.scheduledDate * 1000);
    const newDate: number = Math.floor(
      new Date(
        newYear,
        newMonth,
        newDay,
        originalDate.getHours(),
        originalDate.getMinutes(),
        originalDate.getSeconds(),
        originalDate.getMilliseconds()
      ).getTime() / 1000
    );
    const compare: number = new Date(
      newYear,
      newMonth,
      newDay,
      originalDate.getHours(),
      originalDate.getMinutes(),
      originalDate.getSeconds(),
      originalDate.getMilliseconds()
    ).getTime();

    if (compare < Date.now()) {
      addNotification({
        messageOnProgress: "Updating Date",
        successMessage: "",
        failMessage: "The new Date is invalid",
        func: [
          new Promise((resolve, reject) => {
            reject();
          }),
        ],
      });
      return;
    }

    const lambdaData = {
      postId: post.id,
      channelId: channel.id,
      scheduledDate: newDate - 30,
    };

    addNotification({
      messageOnProgress: "Updating Date",
      successMessage: "Date Updated Successfully",
      failMessage: "Failed Updating Date",
      func: [
        fetch("/api/lambda", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ruleNames: [post?.ruleName] }),
        }),
        fetch("/api/lambda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lambdaData),
        }),
        new Promise((resolve, reject) => {
          try {
            fs.updateDoc(fs.doc(db, "Channels", channel?.id), {
              [`posts.${post.id}.scheduledDate`]: newDate,
            });
            resolve("Done");
          } catch {
            reject("didn't changes");
          }
        }),
      ],
    });
  };

  return (
    <>
      <Cal
        onPostMove={onPostMove}
        highlightedDates={highlightedDates}
        onEventSelect={handleEventSelect}
      />
      <NewDetailsDialog
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        open={!!selectedEvent}
        setOpen={setSelectedEvent}
        media={media}
      />
    </>
  );
};
