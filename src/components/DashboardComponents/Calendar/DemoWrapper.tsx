"use client";

import React from "react";
import { ContinuousCalendar } from "@/components/DashboardComponents/Calendar/ContinuousCalendar";
import { Post } from "@/interfaces/Channel";

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

export default function DemoWrapper() {
  const handleEventSelect = (post: Post) => {
    console.log(
      `Selected post: ${post.title || post.message} at ${post.scheduledDate}`
    );
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <ContinuousCalendar onEventSelect={handleEventSelect} />
    </div>
  );
}
