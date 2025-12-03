"use client";

import { monthNames } from "./interfaces";

interface MonthNavigationProps {
    currentMonth: number;
    currentYear: number;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
    onTodayClick: () => void;
}

export const MonthNavigation = ({
    currentMonth,
    currentYear,
    onPrevMonth,
    onNextMonth,
    onMonthChange,
    onYearChange,
    onTodayClick,
}: MonthNavigationProps) => {
    return (
        <div className="sticky top-0 z-50 bg-white dark:bg-secondDarkBackground border-b border-gray-200 dark:border-stone-700 px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left: Month Selector & Today Button */}
                <div className="flex items-center gap-2">
                    <select
                        value={currentMonth}
                        onChange={(e) => onMonthChange(parseInt(e.target.value))}
                        className="
              px-2 py-1.5 sm:px-3 sm:py-2
              text-sm sm:text-base font-medium
              rounded-lg border border-violet-400 dark:border-violet-600
              bg-white dark:bg-darkButtons
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-violet-500
              cursor-pointer
            "
                    >
                        {monthNames.map((month, index) => (
                            <option key={index} value={index}>
                                {month}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={onTodayClick}
                        className="
              px-2 py-1.5 sm:px-4 sm:py-2
              text-xs sm:text-sm font-medium
              rounded-lg border border-gray-300 dark:border-darkBorder
              bg-white dark:bg-darkButtons
              text-gray-900 dark:text-white
              hover:bg-gray-100 dark:hover:bg-stone-700
              transition-all focus:outline-none
              min-w-[60px] sm:min-w-[70px]
            "
                    >
                        Today
                    </button>
                </div>

                {/* Right: Year Navigation */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={onPrevMonth}
                        className="
              p-1.5 sm:p-2
              rounded-full border border-gray-300 dark:border-stone-700
              hover:bg-gray-100 dark:hover:bg-stone-700
              transition-colors focus:outline-none
            "
                        aria-label="Previous month"
                    >
                        <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 19-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onYearChange(currentYear - 1)}
                            className="
                p-1 rounded
                hover:bg-gray-100 dark:hover:bg-stone-700
                transition-colors
              "
                            aria-label="Previous year"
                        >
                            <svg
                                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 19-7-7 7-7" />
                            </svg>
                        </button>

                        <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white min-w-[60px] sm:min-w-[70px] text-center">
                            {currentYear}
                        </h1>

                        <button
                            onClick={() => onYearChange(currentYear + 1)}
                            className="
                p-1 rounded
                hover:bg-gray-100 dark:hover:bg-stone-700
                transition-colors
              "
                            aria-label="Next year"
                        >
                            <svg
                                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={onNextMonth}
                        className="
              p-1.5 sm:p-2
              rounded-full border border-gray-300 dark:border-stone-700
              hover:bg-gray-100 dark:hover:bg-stone-700
              transition-colors focus:outline-none
            "
                        aria-label="Next month"
                    >
                        <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
