"use client";

import { useState, useRef, useMemo } from "react";
import { HorizontalCalendarProps, daysOfWeek } from "./interfaces";
import { DayCell } from "./DayCell";
import { MonthNavigation } from "./MonthNavigation";

export const HorizontalCalendar = ({
    highlightedDates = [],
    onEventSelect,
}: HorizontalCalendarProps) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Generate calendar days for the current month
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay();

        const days = [];

        // Add previous month's trailing days
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                month: currentMonth === 0 ? 11 : currentMonth - 1,
                year: currentMonth === 0 ? currentYear - 1 : currentYear,
                isCurrentMonth: false,
            });
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                day,
                month: currentMonth,
                year: currentYear,
                isCurrentMonth: true,
            });
        }

        // Add next month's leading days to complete the grid
        const remainingCells = 7 - (days.length % 7);
        if (remainingCells < 7) {
            for (let day = 1; day <= remainingCells; day++) {
                days.push({
                    day,
                    month: currentMonth === 11 ? 0 : currentMonth + 1,
                    year: currentMonth === 11 ? currentYear + 1 : currentYear,
                    isCurrentMonth: false,
                });
            }
        }

        return days;
    }, [currentMonth, currentYear]);

    // Group days into weeks
    const weeks = useMemo(() => {
        const weekArray = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            weekArray.push(calendarDays.slice(i, i + 7));
        }
        return weekArray;
    }, [calendarDays]);

    // Navigation handlers
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleTodayClick = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    // Touch handlers for swipe gestures
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNextMonth();
        } else if (isRightSwipe) {
            handlePrevMonth();
        }
    };

    // Get posts for a specific day
    const getPostsForDay = (day: number, month: number, year: number) => {
        const dateData = highlightedDates.find(
            (date) => date.day === day && date.month === month && date.year === year
        );
        return dateData?.posts || [];
    };

    // Check if a day is today
    const isToday = (day: number, month: number, year: number) => {
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    return (
        <div className="h-full w-full flex flex-col bg-white dark:bg-secondDarkBackground rounded-lg shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] overflow-hidden">
            {/* Navigation */}
            <MonthNavigation
                currentMonth={currentMonth}
                currentYear={currentYear}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onMonthChange={setCurrentMonth}
                onYearChange={setCurrentYear}
                onTodayClick={handleTodayClick}
            />

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-900/30">
                {daysOfWeek.map((day, index) => (
                    <div
                        key={index}
                        className="
              py-2 text-center font-semibold
              text-gray-600 dark:text-stone-400
              text-xs sm:text-sm
              border-r border-gray-200 dark:border-stone-700
              last:border-r-0
            "
                    >
                        {/* Show full name on desktop, abbreviated on mobile */}
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 3)}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid - Horizontal Scrolling */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto overflow-y-auto"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="min-w-full">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex">
                            {week.map((dayData, dayIndex) => (
                                <DayCell
                                    key={`${dayData.month}-${dayData.day}-${dayIndex}`}
                                    day={dayData.day}
                                    month={dayData.month}
                                    year={dayData.year}
                                    isToday={isToday(dayData.day, dayData.month, dayData.year)}
                                    isCurrentMonth={dayData.isCurrentMonth}
                                    posts={getPostsForDay(dayData.day, dayData.month, dayData.year)}
                                    onDayClick={() => { }}
                                    onPostClick={(post) => onEventSelect?.(post)}
                                    canDragDrop={false}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile hint */}
            <div className="sm:hidden px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-stone-700">
                Swipe left or right to change months
            </div>
        </div>
    );
};
