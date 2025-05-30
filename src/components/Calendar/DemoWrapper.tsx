'use client';

import React from "react";
import { ContinuousCalendar } from "@/components/Calendar/ContinuousCalendar";

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ScheduledPost {
  id: string;
  title: string;
  start: Date;
  end: Date;
  platforms: string[];
  content: string;
  imageUrl?: string[];
}

export default function DemoWrapper() {
  const handleEventSelect = (post: ScheduledPost) => {
    console.log(`Selected post: ${post.title} at ${post.start}`);
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">      
        <ContinuousCalendar onEventSelect={handleEventSelect} />
    </div>
  );
}
