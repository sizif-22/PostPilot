'use client';
import React, { useState, useMemo } from 'react';
import { ContinuousCalendar } from './ContinuousCalendar';
import { DetailsDialog } from './DetailsDialog';
import { Post } from '@/interfaces/Channel';


const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const Calendar = ({ dummyScheduledPosts }: { dummyScheduledPosts: Post[] }) => {
  const [selectedEvent, setSelectedEvent] = useState<Post | null>(null);

  // Get highlighted dates for the calendar
  const highlightedDates = useMemo(() => {
    const dateMap = new Map<string, Post[]>();
    
    dummyScheduledPosts.forEach(post => {
      const date = new Date(post.date);
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
    .filter(post => post.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

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
