'use client';

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { HorizontalCalendar } from "./Calendar Components/HorizontalCalendar";
import { HighlightedDate } from "./Calendar Components/interfaces";
import { useState } from "react";

const Calendar = () => {
  const params = useParams();
  const collectionId = params.id as Id<"collection">;
  const allPosts = useQuery(api.postFunctions.getPosts, { collectionId });
  const [key, setKey] = useState(0);
  // Transform posts for the calendar
  const highlightedDates = allPosts
    ?.filter((post) => post.scheduledDate)
    .reduce((acc: HighlightedDate[], post) => {
      const date = new Date(post.scheduledDate!);
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();

      const existingDate = acc.find(
        (d) => d.day === day && d.month === month && d.year === year
      );

      if (existingDate) {
        existingDate.posts.push(post as any);
      } else {
        acc.push({
          day,
          month,
          year,
          posts: [post as any],
        });
      }
      return acc;
    }, []) || [];

  return (
    <div className="h-full w-full p-2 sm:p-4">
      <HorizontalCalendar
        key={key}
        highlightedDates={highlightedDates}
        onEventSelect={(post) => {
          console.log("Selected post:", post);
          // TODO: Implement post details view
          setKey((prevKey) => prevKey + 1);
        }}
      />
    </div>
  );
};

export default Calendar;
