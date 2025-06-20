"use client";
import React from "react";
import {
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiYoutube,
  FiCalendar,
  FiClock,
  FiGlobe,
} from "react-icons/fi";
import { DetailsDialog } from "../Calendar/DetailsDialog";
import { useState, useEffect } from "react";
import { FiFacebook } from "react-icons/fi";
import Image from "next/image";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
import { formatDateInTimezone } from "@/lib/utils";

// Get all available timezones
const timeZones = Intl.supportedValuesOf("timeZone");

export const Upcoming = () => {
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
  const sortedPosts = [...(channel?.posts || [])]
    .filter((post) => {
      // Ensure scheduledDate exists and is in the future (compared to current Unix timestamp)
      return post.scheduledDate && post.scheduledDate * 1000 > Date.now();
    })
    .sort((a, b) => {
      const dateA = a.scheduledDate || 0;
      const dateB = b.scheduledDate || 0;
      return dateA - dateB;
    });

  const groupedPosts = sortedPosts.reduce((acc, post) => {
    if (!post.scheduledDate) return acc;

    const { date, day, month } = formatDateInTimezone(
      post.scheduledDate,
      selectedTimeZone
    );

    if (!acc[date]) {
      acc[date] = {
        date,
        day,
        month,
        posts: [],
      };
    }
    acc[date].posts.push(post);
    return acc;
  }, {} as Record<number, { date: number; day: string; month: string; posts: Post[] }>);

  // Convert to array and sort by date
  const sortedGroupedPosts = Object.values(groupedPosts).sort((a, b) => {
    const dateA = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      a.date
    );
    const dateB = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      b.date
    );
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="col-span-2 row-span-3 border shadow-sm rounded-lg h-[81vh] bg-white ">
      <div className="flex sticky z-10 top-0 items-center rounded-t-lg bg-white justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <FiCalendar className="w-5 h-5 text-violet-500" />
          <h1 className="text-xl font-bold">Upcoming</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FiGlobe className="w-4 h-4 text-gray-500" />
            <select
              value={selectedTimeZone}
              onChange={(e) => setSelectedTimeZone(e.target.value)}
              className="text-sm text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer">
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
              timeZone: selectedTimeZone,
            })}
          </div>
        </div>
      </div>
      {sortedGroupedPosts.length == 0 && (
        <div className="flex justify-center pt-5 text-black/70 font-bold text-sm">
          There are no Upcoming Posts right now
        </div>
      )}
      <div className="flex flex-col gap-8 p-6 overflow-y-auto max-h-[calc(81vh-5rem)] agenda-container mr-1 ">
        {sortedGroupedPosts.map(({ date, day, month, posts }) => (
          <div key={date} className="flex gap-6 relative">
            <div className="sticky top-0 flex flex-col items-center min-w-[4rem] pt-2 h-fit">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2">
                <div className="text-sm text-gray-500">{month}</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {date}
                </div>
                <div className="text-sm text-gray-500">{day}</div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg p-4 hover:bg-gray-50 border border-gray-100 cursor-pointer transition-colors duration-200"
                  onClick={() => setSelectedEvent(post)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center text-gray-500">
                      <FiClock className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {post.scheduledDate
                          ? formatDateInTimezone(
                              post.scheduledDate,
                              selectedTimeZone
                            ).time
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      {post.platforms?.map((platform: string) => (
                        <span
                          key={platform}
                          className="hover:text-gray-700 transition-colors">
                          {platform === "facebook" ? (
                            <FiFacebook className="w-4 h-4" />
                          ) : platform === "instagram" ? (
                            <FiInstagram className="w-4 h-4" />
                          ) : platform === "twitter" ? (
                            <FiTwitter className="w-4 h-4" />
                          ) : platform === "linkedin" ? (
                            <FiLinkedin className="w-4 h-4" />
                          ) : platform === "youtube" ? (
                            <FiYoutube className="w-4 h-4" />
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="min-w-1 w-1 self-stretch bg-violet-500 rounded-full"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                        {post.content || post.message}
                      </h3>
                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {post.imageUrls?.map((image, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={image.url}
                                alt={post.title || "Post image"}
                                className="w-10 h-10 object-cover rounded-md"
                                width={48}
                                height={48}
                              />
                              {index === 3 &&
                                post.imageUrls &&
                                post.imageUrls.length > 4 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      +{post.imageUrls.length - 4}
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
      <DetailsDialog
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        open={!!selectedEvent}
        setOpen={setSelectedEvent}
      />
    </div>
  );
};
