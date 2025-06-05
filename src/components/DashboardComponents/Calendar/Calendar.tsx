'use client';
import React, { useState, useMemo } from 'react';
import { ContinuousCalendar } from './ContinuousCalendar';
import { DetailsDialog } from './DetailsDialog';

interface ScheduledPost {
  id: string;
  title: string;
  start: Date;
  end: Date;
  platforms: string[];
  content: string;
  imageUrl?: string[];
}

interface HighlightedDate {
  day: number;
  month: number;
  year: number;
  posts: ScheduledPost[];
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const Calendar = ({ dummyScheduledPosts }: { dummyScheduledPosts: ScheduledPost[] }) => {
  const [selectedEvent, setSelectedEvent] = useState<ScheduledPost | null>(null);

  // Get highlighted dates for the calendar
  const highlightedDates = useMemo(() => {
    const dateMap = new Map<string, ScheduledPost[]>();
    
    dummyScheduledPosts.forEach(post => {
      const date = new Date(post.start);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!dateMap.has(key)) {
        dateMap.set(key, []);
      }
      dateMap.get(key)!.push(post);
    });

    return Array.from(dateMap).map(([key, posts]) => {
      const [year, month, day] = key.split('-').map(Number);
      return {
        day,
        month,
        year,
        posts
      };
    });
  }, [dummyScheduledPosts]);

  // Get upcoming events (today and future)
  const upcomingEvents = dummyScheduledPosts
    .filter(post => post.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  const handleEventSelect = (post: ScheduledPost) => {
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
