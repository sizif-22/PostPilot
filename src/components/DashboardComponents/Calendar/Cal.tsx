"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Select } from "./Select";
import { ContinuousCalendarProps, daysOfWeek, monthNames } from "./interfaces";
import { PostCard } from "./PostCard";
import { ReactSortable } from "react-sortablejs";
import { Post } from "@/interfaces/Channel";
import { AllPostsDialog } from "./AllPostsDialog";
import { useUser } from "@/context/UserContext";
import { useChannel } from "@/context/ChannelContext";
export const Cal: React.FC<
  ContinuousCalendarProps & {
    onPostMove?: (
      post: Post,
      newDay: number,
      newMonth: number,
      newYear: number
    ) => void;
  }
> = ({ onEventSelect, highlightedDates = [], onPostMove }) => {
  const { user } = useUser();
  const { channel } = useChannel();
  const today = new Date();
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [draggedPost, setDraggedPost] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // State for the all posts dialog
  const [showAllPostsDialog, setShowAllPostsDialog] = useState(false);
  const [selectedDayPosts, setSelectedDayPosts] = useState<{
    posts: Post[];
    date: { day: number; month: number; year: number };
  } | null>(null);

  const monthOptions = monthNames.map((month, index) => ({
    name: month,
    value: `${index}`,
  }));

  useEffect(() => {
    handleTodayClick();
  }, []);

  const scrollToDay = (monthIndex: number, dayIndex: number) => {
    const targetDayIndex = dayRefs.current.findIndex(
      (ref) =>
        ref &&
        ref.getAttribute("data-month") === `${monthIndex}` &&
        ref.getAttribute("data-day") === `${dayIndex}`
    );

    const targetElement = dayRefs.current[targetDayIndex];

    if (targetDayIndex !== -1 && targetElement) {
      const container = document.querySelector(".calendar-container");
      const elementRect = targetElement.getBoundingClientRect();
      const is2xl = window.matchMedia("(min-width: 1536px)").matches;
      const offsetFactor = is2xl ? 3 : 2.5;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const offset =
          elementRect.top -
          containerRect.top -
          containerRect.height / offsetFactor +
          elementRect.height / 2;

        container.scrollTo({
          top: container.scrollTop + offset,
          behavior: "smooth",
        });
      } else {
        const offset =
          window.scrollY +
          elementRect.top -
          window.innerHeight / offsetFactor +
          elementRect.height / 2;

        window.scrollTo({
          top: offset,
          behavior: "smooth",
        });
      }
    }
  };

  const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
  const handleNextYear = () => setYear((prevYear) => prevYear + 1);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(event.target.value, 10);
    setSelectedMonth(monthIndex);
    scrollToDay(monthIndex, 1);
  };

  const handleTodayClick = () => {
    setYear(today.getFullYear());
    scrollToDay(today.getMonth(), today.getDate());
  };

  // Handle showing all posts dialog
  const handleShowAllPosts = (posts: Post[], day: number, month: number) => {
    setSelectedDayPosts({
      posts,
      date: { day, month, year },
    });
    setShowAllPostsDialog(true);
  };

  // Handle drag start
  const handleDragStart = (post: any) => {
    setDraggedPost(post);
    setIsDragging(true);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedPost(null);
    setIsDragging(false);
  };

  // Handle drop on a day
  const handleDrop = (
    targetMonth: number,
    targetDay: number,
    targetYear: number
  ) => {
    if (draggedPost && onPostMove) {
      const currentDate = highlightedDates.find((date) =>
        date.posts.some((p) => p.id === draggedPost.id)
      );

      if (
        !currentDate ||
        currentDate.day !== targetDay ||
        currentDate.month !== targetMonth ||
        currentDate.year !== targetYear
      ) {
        console.log("DraggedPost:", draggedPost);
        onPostMove(draggedPost, targetDay, targetMonth, targetYear);
      }
    }
    setDraggedPost(null);
    setIsDragging(false);
  };

  const generateCalendar = useMemo(() => {
    const today = new Date();

    const daysInYear = (): { month: number; day: number }[] => {
      const daysInYear = [];
      const startDayOfWeek = new Date(year, 0, 1).getDay();

      if (startDayOfWeek < 6) {
        for (let i = 0; i < startDayOfWeek; i++) {
          daysInYear.push({ month: -1, day: 32 - startDayOfWeek + i });
        }
      }

      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          daysInYear.push({ month, day });
        }
      }

      const lastWeekDayCount = daysInYear.length % 7;
      if (lastWeekDayCount > 0) {
        const extraDaysNeeded = 7 - lastWeekDayCount;
        for (let day = 1; day <= extraDaysNeeded; day++) {
          daysInYear.push({ month: 0, day });
        }
      }

      return daysInYear;
    };

    const calendarDays = daysInYear();

    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    const calendar = calendarWeeks.map((week, weekIndex) => (
      <div className="flex w-full" key={`week-${weekIndex}`}>
        {week.map(({ month, day }, dayIndex) => {
          const index = weekIndex * 7 + dayIndex;
          const isNewMonth =
            index === 0 || calendarDays[index - 1].month !== month;
          const isToday =
            today.getMonth() === month &&
            today.getDate() === day &&
            today.getFullYear() === year;

          // Get posts for this day
          const dateData = highlightedDates.find(
            (date) =>
              date.day === day && date.month === month && date.year === year
          );
          const postsForDay = dateData?.posts || [];
          const hasEvents = postsForDay.length > 0;

          // Check if this is a valid drop target (not past dates for future months)
          const isValidDropTarget = month >= 0;
          const isDragOver = isDragging && isValidDropTarget;

          return (
            <div
              key={`${month}-${day}`}
              ref={(el) => {
                dayRefs.current[index] = el;
              }}
              data-month={month}
              data-day={day}
              className={`relative group border font-medium transition-all hover:z-20  hover:border-violet-400 dark:hover:border-violet-600 border-[#00000005] dark:border-stone-700 w-full min-h-[50px] sm:min-h-[80px] lg:min-h-[200px] px-2 pt-12 pb-2 ${
                hasEvents
                  ? "bg-violet-50 dark:bg-violet-950/30"
                  : "dark:bg-secondDarkBackground"
              }`}
              onDragOver={(e) => {
                if (isValidDropTarget) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (isValidDropTarget) {
                  handleDrop(month, day, year);
                }
              }}>
              <span
                className={`absolute left-1 top-1 flex size-6 items-center rounded-full justify-center text-xs sm:size-7 sm:text-sm lg:left-2 lg:top-2 lg:size-8 lg:text-base ${
                  isToday
                    ? "bg-violet-500 font-semibold text-white"
                    : hasEvents
                    ? "text-violet-600 font-semibold dark:text-violet-400"
                    : ""
                }`}>
                {day}
              </span>
              {isNewMonth && (
                <span className="absolute bottom-1 left-1 w-[calc(100%-8px)] truncate text-xs font-semibold text-slate-300 dark:text-stone-500 sm:bottom-1.5 sm:left-1.5 sm:text-sm lg:bottom-2 lg:left-2 lg:text-base">
                  {monthNames[month]}
                </span>
              )}
              {hasEvents && (
                <div className="absolute top-8 sm:top-12 lg:top-14 left-1 right-1 lg:left-2 lg:right-2 flex flex-col gap-1 overflow-y-auto max-h-[calc(100%-40px)] sm:max-h-[calc(100%-50px)] lg:max-h-[calc(100%-60px)]">
                  <ReactSortable
                    list={postsForDay
                      .sort((a, b) => {
                        const aDate: number = a.date.seconds;
                        const bDate: number = b.date.seconds;
                        return aDate - bDate;
                      })
                      .slice(0, 2)
                      .filter((post) => post.id !== undefined)
                      .map((post) => ({
                        ...post,
                        id: post.id as string | number,
                        chosen: false,
                      }))}
                    setList={() => {}}
                    group={{
                      name: "posts",
                      pull: true,
                      put: false,
                    }}
                    filter={".disable-sortable"}
                    sort={false}
                    onStart={(evt) => {
                      const post = postsForDay[evt.oldIndex!];
                      handleDragStart(post);
                    }}
                    onEnd={(evt) => {
                      handleDragEnd();

                      const dropTarget = evt.to.closest(
                        "[data-month][data-day]"
                      );
                      if (dropTarget && draggedPost) {
                        const targetMonth = parseInt(
                          dropTarget.getAttribute("data-month")!
                        );
                        const targetDay = parseInt(
                          dropTarget.getAttribute("data-day")!
                        );

                        if (targetMonth >= 0) {
                          handleDrop(targetMonth, targetDay, year);
                        }
                      }
                    }}
                    className="flex flex-col gap-1">
                    {postsForDay.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className={` ${
                          channel?.authority == "Reviewer" && "disable-sortable"
                        }  `}>
                        <PostCard
                          callbackFunc={() => onEventSelect?.(post)}
                          post={post}
                        />
                      </div>
                    ))}
                  </ReactSortable>
                  {postsForDay.length > 2 && (
                    <button
                      onClick={() =>
                        handleShowAllPosts(postsForDay, day, month)
                      }
                      className="w-full text-left px-1.5 flex justify-between py-1 text-[10px] sm:text-xs truncate rounded bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-400 transition-colors">
                      {postsForDay.length === 3
                        ? "There is 1 more ..."
                        : `There are ${postsForDay.length - 2} more ...`}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ));

    return calendar;
  }, [year, highlightedDates, onEventSelect, isDragging, draggedPost]);

  useEffect(() => {
    const calendarContainer = document.querySelector(".calendar-container");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const month = parseInt(
              entry.target.getAttribute("data-month")!,
              10
            );
            setSelectedMonth(month);
          }
        });
      },
      {
        root: calendarContainer,
        rootMargin: "-75% 0px -25% 0px",
        threshold: 0,
      }
    );

    dayRefs.current.forEach((ref) => {
      if (ref && ref.getAttribute("data-day") === "15") {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="calendar-container text-slate-800 dark:text-white bg-white dark:bg-secondDarkBackground h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg pb-4 shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
        <div className="sticky top-0 z-50  w-full rounded-t-2xl bg-white dark:bg-secondDarkBackground px-2 pt-3 sm:px-5 sm:pt-7">
          <div className="mb-2 flex w-full  sm:flex-row sm:items-center justify-between gap-2 sm:gap-6">
            <div className="flex items-center gap-2">
              <Select
                name="month"
                value={`${selectedMonth}`}
                options={monthOptions}
                onChange={handleMonthChange}
                className="border-violet-400 dark:text-white"
              />
              <button
                onClick={handleTodayClick}
                className="rounded-lg border border-stone-300 dark:border-darkBorder bg-white dark:bg-darkButtons px-2 py-1 text-sm font-medium text-stone-900 dark:text-white hover:bg-darkBorder transition-all dark:hover:bg-stone-700 focus:outline-none sm:px-3 sm:py-1.5 lg:px-5 lg:py-2.5">
                Today
              </button>
            </div>
            <div className="flex w-fit items-center justify-between">
              <button
                onClick={handlePrevYear}
                className="rounded-full border border-slate-300 dark:border-stone-700 p-1 transition-colors hover:bg-slate-100 dark:hover:bg-stone-700 focus:outline-none sm:p-2">
                <svg
                  className="size-4 sm:size-5 text-stone-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m15 19-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="min-w-12 sm:min-w-16 text-center text-base sm:text-lg font-semibold lg:min-w-20 lg:text-xl dark:text-white">
                {year}
              </h1>
              <button
                onClick={handleNextYear}
                className="rounded-full border border-slate-300 dark:border-stone-700 p-1 transition-colors hover:bg-slate-100 dark:hover:bg-stone-700 focus:outline-none sm:p-2">
                <svg
                  className="size-4 sm:size-5 text-stone-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m9 5 7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid w-full grid-cols-7 justify-between text-slate-500 dark:text-stone-400">
            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className="w-full border-b border-slate-200 dark:border-stone-700 py-1 sm:py-2 text-center text-xs sm:text-sm font-semibold">
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full gap-1 sm:gap-2 px-2 sm:px-5 lg:px-8 pt-2 sm:pt-4 lg:pt-6">
          {generateCalendar}
        </div>
      </div>

      {/* All Posts Dialog */}
      {selectedDayPosts && (
        <AllPostsDialog
          open={showAllPostsDialog}
          onClose={() => {
            setShowAllPostsDialog(false);
            setSelectedDayPosts(null);
          }}
          posts={selectedDayPosts.posts}
          date={selectedDayPosts.date}
          onEventSelect={onEventSelect}
          onPostMove={onPostMove}
          monthNames={monthNames}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
        />
      )}
    </>
  );
};
