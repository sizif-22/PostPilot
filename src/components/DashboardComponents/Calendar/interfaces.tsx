import { Post } from "@/interfaces/Channel";

export const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const monthNames = [
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

interface HighlightedDate {
  day: number;
  month: number;
  year: number;
  posts: Post[];
}

export interface ContinuousCalendarProps {
  onEventSelect?: (post: Post) => void;
  highlightedDates?: HighlightedDate[];
}