"use client";
import React from "react";
import {
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiCalendar,
  FiClock,
  FiGlobe,
} from "react-icons/fi";
import { FaPlay, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
// import { DetailsDialog } from "../Calendar/DetailsDialog.tsxo";
import { useState, useEffect } from "react";
import { FiFacebook } from "react-icons/fi";
import Image from "next/image";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
import { formatDateInTimezone } from "@/utils/timezone";
import { MediaItem } from "@/interfaces/Media";
import { NewDetailsDialog } from "../Calendar/NewDetailsDialog";

// Get all available timezones
const timeZones = Intl.supportedValuesOf("timeZone");

export const Upcoming = ({ media }: { media: MediaItem[] }) => {
  const [selectedEvent, setSelectedEvent] = useState<Post | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>(() => {
    // Try to get saved timezone from localStorage, default to user's local timezone
    return (
      localStorage.getItem("userTimeZone") ||
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  });
  const { channel } = useChannel();

  // Save timezone preference when it changes
  useEffect(() => {
    localStorage.setItem("userTimeZone", selectedTimeZone);
  }, [selectedTimeZone]);

  // First sort all posts by date and time
  const sortedPosts = Object.values(channel?.posts || {})
    .filter((post) => {
      // Ensure scheduledDate exists and is in the future (compared to current Unix timestamp)
      return (
        post.isScheduled &&
        post.date.toDate() > new Date(Date.now()) &&
        !post.draft
      );
    })
    .sort((a, b) => {
      const dateA = a.date.seconds;
      const dateB = b.date.seconds;
      return dateA - dateB;
    });

  // Group posts by full date (YYYY-MM-DD)
  const groupedPosts = sortedPosts.reduce((acc, post) => {
    if (!post.isScheduled) return acc;
    const dateObj = post.date.toDate();
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    const groupKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    // Use formatDateInTimezone for display values
    const {
      date,
      day: dayName,
      month: monthName,
    } = formatDateInTimezone(post.date.seconds, selectedTimeZone);

    if (!acc[groupKey]) {
      acc[groupKey] = {
        groupKey,
        date, // day of month
        day: dayName,
        month: monthName,
        posts: [],
        timestamp: post.date.seconds,
      };
    }
    acc[groupKey].posts.push(post);
    return acc;
  }, {} as Record<string, { groupKey: string; date: number; day: string; month: string; posts: Post[]; timestamp: number }>);

  // Convert to array and sort by timestamp
  const sortedGroupedPosts = Object.values(groupedPosts).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  return (
    <div className="col-span-2 row-span-3 border dark:border-darkBorder  shadow-sm dark:shadow-lg rounded-lg lg:min-h-[81vh] min-h-[30vh] bg-white dark:bg-transparent">
      <div className="flex sticky z-10 top-0 items-center rounded-t-lg bg-white dark:bg-transparent justify-between px-6 py-4 border-b dark:border-darkBorder">
        <div className="flex items-center gap-2">
          <FiCalendar className="w-5 h-5 text-violet-500" />
          <h1 className="text-xl font-bold dark:text-white">Upcoming</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="md:flex hidden items-center gap-2">
            <FiGlobe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedTimeZone}
              onChange={(e) => setSelectedTimeZone(e.target.value)}
              className="text-sm text-gray-500 dark:text-gray-400 bg-transparent border-none focus:ring-0 cursor-pointer">
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
              timeZone: selectedTimeZone,
            })}
          </div>
        </div>
      </div>
      {sortedGroupedPosts.length == 0 && (
        <div className="flex justify-center pt-5 text-black/70 dark:text-white/70 font-bold text-sm">
          There are no Upcoming Posts right now
        </div>
      )}
      <div className="flex flex-col gap-8 p-6 overflow-y-auto max-h-[calc(81vh-5rem)] agenda-container mr-1 ">
        {sortedGroupedPosts.map(({ date, day, month, posts }) => (
          <div key={date} className="flex gap-6 relative">
            <div className="sticky top-0 flex flex-col items-center min-w-[4rem] pt-2 h-fit">
              <div className=" backdrop-blur-sm rounded-lg p-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {month}
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {date}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {posts
                .filter((post) => !post.draft)
                .map((post) => (
                  <div
                    key={post.id}
                    className="rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-darkButtons border border-gray-100 dark:border-darkBorder cursor-pointer transition-colors duration-200"
                    onClick={() => setSelectedEvent(post)}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <FiClock className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {
                            formatDateInTimezone(
                              post.date.seconds,
                              selectedTimeZone
                            ).time
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        {post.platforms?.map((platform: string) => (
                          <span
                            key={platform}
                            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            {platform === "facebook" ? (
                              <FiFacebook className="w-4 h-4" />
                            ) : platform === "instagram" ? (
                              <FiInstagram className="w-4 h-4" />
                            ) : platform === "x" ? (
                              <FaXTwitter className="w-4 h-4" />
                            ) : platform === "linkedin" ? (
                              <FiLinkedin className="w-4 h-4" />
                            ) : platform === "youtube" ? (
                              <FiYoutube className="w-4 h-4" />
                            ) : platform === "tiktok" ? (
                              <FaTiktok className="w-4 h-4" />
                            ) : null}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="min-w-1 w-1 self-stretch bg-violet-500 rounded-full"></div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                          {post.facebookText || post.instagramText || post.xText || post.linkedinText || post.youtubeTitle || post.tiktokDescription}
                        </h3>
                        {post.media && post.media.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {post.media?.map((image, index) => (
                              <div key={index} className="relative">
                                {image.isVideo ? (
                                  <>
                                    <video
                                      className="w-10 h-10 object-cover rounded-md"
                                      preload="metadata">
                                      <source
                                        src={image.url}
                                        type="video/mp4"
                                      />
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                    <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-md">
                                      <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                        <FaPlay
                                          size={12}
                                          className="text-white"
                                        />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <Image
                                    src={image.url}
                                    alt={post.title || "Post image"}
                                    className="w-10 h-10 object-cover rounded-md"
                                    width={48}
                                    height={48}
                                  />
                                )}
                                {index === 3 &&
                                  post.media &&
                                  post.media.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        +{post.media.length - 4}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <NewDetailsDialog
        selectedPost={selectedEvent}
        setSelectedPost={setSelectedEvent}
        open={!!selectedEvent}
        setOpen={setSelectedEvent}
        media={media}
      />
    </div>
  );
};
