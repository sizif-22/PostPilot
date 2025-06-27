"use client";
import { FiCalendar } from "react-icons/fi";

interface PostTimelineProps {
  data: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

export const PostTimeline = ({ data }: PostTimelineProps) => {
  const days = [
    { name: "Monday", count: data.monday, short: "Mon" },
    { name: "Tuesday", count: data.tuesday, short: "Tue" },
    { name: "Wednesday", count: data.wednesday, short: "Wed" },
    { name: "Thursday", count: data.thursday, short: "Thu" },
    { name: "Friday", count: data.friday, short: "Fri" },
    { name: "Saturday", count: data.saturday, short: "Sat" },
    { name: "Sunday", count: data.sunday, short: "Sun" },
  ];

  const total = days.reduce((sum, day) => sum + day.count, 0);
  const maxCount = Math.max(...days.map((day) => day.count));

  // Find best and worst performing days
  const bestDay = days.reduce((best, current) =>
    current.count > best.count ? current : best
  );
  const worstDay = days.reduce((worst, current) =>
    current.count < worst.count ? current : worst
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FiCalendar className="text-lg text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Posting Schedule
        </h3>
      </div>

      {/* Weekly Schedule Chart */}
      <div className="space-y-3 mb-6">
        {days.map((day) => {
          const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
          const isBest = day.count === bestDay.count && day.count > 0;
          const isWorst = day.count === worstDay.count && day.count > 0;

          return (
            <div key={day.name} className="flex items-center gap-3">
              <div className="w-16 text-sm font-medium text-gray-900 dark:text-white">
                {day.short}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    {day.count} posts
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {total > 0 ? ((day.count / total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isBest
                        ? "bg-green-500"
                        : isWorst
                        ? "bg-red-500"
                        : "bg-violet-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                  {isBest && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {isWorst && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Insights
        </h4>
        <div className="space-y-2">
          {bestDay.count > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  {bestDay.name}
                </span>{" "}
                is your most active day with {bestDay.count} posts
              </span>
            </div>
          )}
          {worstDay.count === 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  {worstDay.name}
                </span>{" "}
                has no posts - consider adding content
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Average of{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(total / 7)}
              </span>{" "}
              posts per day
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {worstDay.count === 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Consider scheduling posts on{" "}
            {worstDay.name} to maintain consistent engagement throughout the
            week.
          </p>
        </div>
      )}
    </div>
  );
};
