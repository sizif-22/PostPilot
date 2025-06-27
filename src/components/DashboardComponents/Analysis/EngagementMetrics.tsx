"use client";
import { FiTrendingUp, FiEye, FiHeart, FiShare2 } from "react-icons/fi";

interface EngagementData {
  id?: string;
  title: string;
  content: string;
  platforms: string[];
  date?: Date;
  engagement: number;
  reach: number;
  likes: number;
  shares: number;
}

interface EngagementMetricsProps {
  data: EngagementData[];
}

export const EngagementMetrics = ({ data }: EngagementMetricsProps) => {
  const totalEngagement = data.reduce((sum, post) => sum + post.engagement, 0);
  const totalReach = data.reduce((sum, post) => sum + post.reach, 0);
  const totalLikes = data.reduce((sum, post) => sum + post.likes, 0);
  const totalShares = data.reduce((sum, post) => sum + post.shares, 0);
  const avgEngagement = data.length > 0 ? totalEngagement / data.length : 0;
  const avgReach = data.length > 0 ? totalReach / data.length : 0;

  const metrics = [
    {
      name: "Total Engagement",
      value: totalEngagement.toLocaleString(),
      icon: FiTrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      name: "Total Reach",
      value: totalReach.toLocaleString(),
      icon: FiEye,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8.2%",
      changeType: "positive",
    },
    {
      name: "Total Likes",
      value: totalLikes.toLocaleString(),
      icon: FiHeart,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "+15.3%",
      changeType: "positive",
    },
    {
      name: "Total Shares",
      value: totalShares.toLocaleString(),
      icon: FiShare2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+5.7%",
      changeType: "positive",
    },
  ];

  // Engagement trend data (last 7 days)
  const trendData = [
    { day: "Mon", engagement: 245, reach: 1200 },
    { day: "Tue", engagement: 312, reach: 1500 },
    { day: "Wed", engagement: 289, reach: 1350 },
    { day: "Thu", engagement: 356, reach: 1800 },
    { day: "Fri", engagement: 423, reach: 2100 },
    { day: "Sat", engagement: 398, reach: 1950 },
    { day: "Sun", engagement: 367, reach: 1750 },
  ];

  const maxEngagement = Math.max(...trendData.map((d) => d.engagement));
  const maxReach = Math.max(...trendData.map((d) => d.reach));

  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-lg border dark:border-stone-800 shadow-sm dark:shadow-lg">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
        Engagement Metrics
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.name}
              className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`text-lg ${metric.color}`} />
                </div>
                <span
                  className={`text-xs font-medium ${
                    metric.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">
                {metric.value}
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {metric.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Engagement Trend Chart */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-stone-900 dark:text-white mb-3">
          Weekly Trend
        </h4>
        <div className="space-y-3">
          {trendData.map((day, index) => (
            <div key={day.day} className="flex items-center gap-4">
              <div className="w-12 text-sm text-stone-600 dark:text-stone-400">
                {day.day}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600 dark:text-stone-400">
                    Engagement
                  </span>
                  <span className="text-stone-900 dark:text-white">
                    {day.engagement}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(day.engagement / maxEngagement) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600 dark:text-stone-400">
                    Reach
                  </span>
                  <span className="text-stone-900 dark:text-white">
                    {day.reach}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(day.reach / maxReach) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Averages */}
      <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Avg Engagement
            </p>
            <p className="text-lg font-semibold text-stone-900 dark:text-white">
              {Math.round(avgEngagement)}
            </p>
          </div>
          <div>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Avg Reach
            </p>
            <p className="text-lg font-semibold text-stone-900 dark:text-white">
              {Math.round(avgReach)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
