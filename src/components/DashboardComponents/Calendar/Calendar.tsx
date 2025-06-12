'use client';
import React, { useState, useMemo } from 'react';
import { ContinuousCalendar } from './ContinuousCalendar';
import { DetailsDialog } from './DetailsDialog';
import { Post } from '@/interfaces/Channel';
import { useChannel } from '@/context/ChannelContext';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const Calendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<Post | null>(null);
  const {channel} = useChannel();
  // Get highlighted dates for the calendar
  const highlightedDates = useMemo(() => {
    const dateMap = new Map<string, Post[]>();
    
    channel?.posts.filter(post => post.published).forEach(post => {
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
  }, [channel?.posts]);

  // Get upcoming events (today and future)
  const upcomingEvents = channel?.posts.filter(post => post.published)
    .filter(post => post.published && post.date >= new Date())
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
