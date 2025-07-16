import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/timezone.ts
// Utility functions for handling timezone conversions

/**
 * Convert a datetime-local string to Unix timestamp considering the specified timezone
 * @param dateTimeString - The datetime string from datetime-local input (YYYY-MM-DDTHH:mm)
 * @param timeZone - IANA timezone identifier (e.g., 'America/New_York')
 * @returns Unix timestamp in seconds
 */
export const convertLocalDateTimeToUnixTimestamp = (
  dateTimeString: string,
  timeZone: string
): number => {
  // Parse the datetime-local string
  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  // Create a date object representing the local time in the specified timezone
  // We use the Intl.DateTimeFormat to handle timezone conversion properly
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  
  // Get the timezone offset for this specific date in the target timezone
  const offsetInMinutes = getTimezoneOffsetForDate(localDate, timeZone);
  
  // Adjust the local time to UTC
  const utcTimestamp = localDate.getTime() - (offsetInMinutes * 60 * 1000);
  
  return Math.floor(utcTimestamp / 1000);
};

/**
 * Get the timezone offset in minutes for a specific date and timezone
 * @param date - The date for which to get the offset
 * @param timeZone - IANA timezone identifier
 * @returns Offset in minutes (positive means ahead of UTC)
 */
export const getTimezoneOffsetForDate = (date: Date, timeZone: string): number => {
  // Create two dates: one in UTC and one in the target timezone
  const utcDate = new Date(date.getTime());
  const localizedDate = new Date(date.toLocaleString('en-US', { timeZone }));
  
  // Calculate the difference
  return (utcDate.getTime() - localizedDate.getTime()) / (1000 * 60);
};

/**
 * Get the current time in a specific timezone
 * @param timeZone - IANA timezone identifier
 * @returns Formatted date string
 */
export const getCurrentTimeInTimezone = (timeZone: string): string => {
  const now = new Date();
  return now.toLocaleString("en-US", { 
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Get the minimum datetime for scheduling (13 minutes from now) in a specific timezone
 * @param timeZone - IANA timezone identifier
 * @returns Datetime string in YYYY-MM-DDTHH:mm format
 */
export const getMinScheduleDateTime = (timeZone: string): string => {
  const now = new Date();
  
  // Add 13 minutes buffer
  const minTime = new Date(now.getTime() + (13 * 60 * 1000));
  
  // Convert to the target timezone
  const minTimeInTZ = new Date(minTime.toLocaleString("en-US", { timeZone }));
  
  // Format for datetime-local input
  const year = minTimeInTZ.getFullYear();
  const month = (minTimeInTZ.getMonth() + 1).toString().padStart(2, "0");
  const day = minTimeInTZ.getDate().toString().padStart(2, "0");
  const hours = minTimeInTZ.getHours().toString().padStart(2, "0");
  const minutes = minTimeInTZ.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Convert Unix timestamp to human-readable format in a specific timezone
 * @param timestamp - Unix timestamp in seconds
 * @param timeZone - IANA timezone identifier
 * @returns Formatted date string
 */
export const formatTimestampInTimezone = (
  timestamp: number,
  timeZone: string
): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-US", {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Validate if a scheduled time is at least 13 minutes in the future
 * @param timestamp - Unix timestamp in seconds
 * @returns boolean indicating if the time is valid for scheduling
 */
export const isValidScheduleTime = (timestamp: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  const minScheduleTime = now + (13 * 60); // 13 minutes from now
  return timestamp >= minScheduleTime;
};

/**
 * Get all available timezones sorted by offset
 * @returns Array of timezone objects with name and offset
 */
export const getSortedTimezones = (): Array<{name: string, offset: string}> => {
  const timeZones = Intl.supportedValuesOf("timeZone");
  const now = new Date();
  
  return timeZones
    .map(tz => {
      const offset = getTimezoneOffsetForDate(now, tz);
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset <= 0 ? '+' : '-';
      const offsetString = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      return {
        name: tz,
        offset: offsetString
      };
    })
    .sort((a, b) => {
      // Sort by offset first, then by name
      if (a.offset !== b.offset) {
        return a.offset.localeCompare(b.offset);
      }
      return a.name.localeCompare(b.name);
    });
};


// Helper function to format date in user's timezone
export const formatDateInTimezone = (timestamp: number, timeZone: string) => {
  const date = new Date(timestamp * 1000); // Convert from Unix timestamp to Date
  return {
    date: date.getDate(),
    day: date.toLocaleString("en-us", { weekday: "short", timeZone }),
    month: date.toLocaleString("en-us", { month: "short", timeZone }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone,
    }),
  };
};