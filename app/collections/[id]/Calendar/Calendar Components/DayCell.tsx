"use client";

import { useState } from "react";
import { DayCellProps } from "./interfaces";
import { HorizontalPostCard } from "./HorizontalPostCard";
import { AllPostsDialog } from "./AllPostsDialog";

export const DayCell = ({
    day,
    month,
    year,
    isToday,
    isCurrentMonth,
    posts,
    onDayClick,
    onPostClick,
}: DayCellProps) => {
    const [showAllPosts, setShowAllPosts] = useState(false);
    const hasPosts = posts.length > 0;
    const displayPosts = posts.slice(0, 2);
    const hasMorePosts = posts.length > 2;

    return (
        <>
            <div
                onClick={() => onDayClick(day, month, year)}
                className={`
          group relative shrink-0 border-r border-b
          transition-all cursor-pointer
          ${isCurrentMonth ? "border-gray-200 dark:border-stone-700" : "border-gray-100 dark:border-stone-800"}
          ${hasPosts ? "bg-violet-50 dark:bg-violet-950/20" : "bg-white dark:bg-secondDarkBackground"}
          hover:bg-violet-100 dark:hover:bg-violet-950/30
          
          /* Mobile: Rectangle cells */
          w-24 h-20 sm:w-28 sm:h-24
          
          /* Desktop: Square cells */
          lg:w-32 lg:h-32 xl:w-40 xl:h-40
        `}
            >
                {/* Day Number */}
                <div
                    className={`
            absolute top-1 left-1 flex items-center justify-center
            rounded-full font-medium
            ${isToday
                            ? "bg-violet-500 text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
                            : hasPosts
                                ? "text-violet-600 dark:text-violet-400 font-semibold"
                                : isCurrentMonth
                                    ? "text-gray-700 dark:text-gray-300"
                                    : "text-gray-400 dark:text-gray-600"
                        }
            text-xs sm:text-sm lg:text-base
          `}
                >
                    {day}
                </div>

                {/* Post Count Badge */}
                {hasPosts && (
                    <div className="absolute top-1 right-1 bg-violet-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-semibold">
                        {posts.length}
                    </div>
                )}

                {/* Posts Preview - Hidden on mobile if too small */}
                {hasPosts && (
                    <div className="absolute top-8 left-1 right-1 flex flex-col gap-0.5 sm:gap-1">
                        {displayPosts.map((post) => (
                            <div
                                key={post.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPostClick(post);
                                }}
                            >
                                <HorizontalPostCard post={post} onClick={() => onPostClick(post)} compact />
                            </div>
                        ))}

                        {hasMorePosts && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAllPosts(true);
                                }}
                                className="w-full text-left px-1.5 py-0.5 text-[9px] sm:text-[10px] rounded bg-violet-200 dark:bg-violet-900/40 hover:bg-violet-300 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-400 transition-colors"
                            >
                                +{posts.length - 2} more
                            </button>
                        )}
                    </div>
                )}

                {/* Empty State Indicator */}
                {!hasPosts && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity">
                        <div className="text-4xl text-violet-300 dark:text-violet-800">+</div>
                    </div>
                )}
            </div>

            {/* All Posts Dialog */}
            {showAllPosts && (
                <AllPostsDialog
                    open={showAllPosts}
                    onClose={() => setShowAllPosts(false)}
                    posts={posts}
                    date={{ day, month, year }}
                    onEventSelect={onPostClick}
                    monthNames={[
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
                    ]}
                    handleDragStart={() => { }}
                    handleDragEnd={() => { }}
                />
            )}
        </>
    );
};
