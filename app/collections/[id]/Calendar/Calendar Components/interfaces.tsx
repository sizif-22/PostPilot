import { Post } from "@/interfaces/Collection";

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

export interface HighlightedDate {
  day: number;
  month: number;
  year: number;
  posts: Post[];
}

export interface ContinuousCalendarProps {
  onEventSelect?: (post: Post) => void;
  highlightedDates?: HighlightedDate[];
}

export interface HorizontalCalendarProps {
  onEventSelect?: (post: Post) => void;
  highlightedDates?: HighlightedDate[];
  onPostMove?: (
    post: Post,
    newDay: number,
    newMonth: number,
    newYear: number
  ) => void;
}

export interface DayCellProps {
  day: number;
  month: number;
  year: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  posts: Post[];
  onDayClick: (day: number, month: number, year: number) => void;
  onPostClick: (post: Post) => void;
  canDragDrop?: boolean;
}