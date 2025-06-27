"use client";
import { FiBarChart, FiTrendingUp, FiUsers, FiClock } from "react-icons/fi";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

interface PlatformComparisonProps {
  data: any;
}

export const PlatformComparison = ({ data }: PlatformComparisonProps) => {
  // Simulated platform comparison data
  const platformData = [
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      posts: data.platformUsage?.facebook || 0,
      avgEngagement: 245,
      avgReach: 1200,
      bestTime: "2-4 PM",
      audience: "25-54",
      growth: "+12.5%",
      growthType: "positive",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      posts: data.platformUsage?.instagram || 0,
      avgEngagement: 312,
      avgReach: 1500,
      bestTime: "6-8 PM",
      audience: "18-34",
      growth: "+18.2%",
      growthType: "positive",
    },
    {
      name: "TikTok",
      icon: FaTiktok,
      color: "text-black dark:text-white",
      bgColor: "bg-stone-100 dark:bg-stone-700",
      posts: data.platformUsage?.tiktok || 0,
      avgEngagement: 456,
      avgReach: 2100,
      bestTime: "7-9 PM",
      audience: "16-24",
      growth: "+25.7%",
      growthType: "positive",
    },
  ];

  const totalPosts = platformData.reduce(
    (sum, platform) => sum + platform.posts,
    0
  );
  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-lg border dark:border-stone-800 shadow-sm dark:shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <FiBarChart className="text-lg text-stone-600 dark:text-stone-400" />
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
          Platform Comparison
        </h3>
      </div>

      <div className="space-y-4">
        {platformData.map((platform) => {
          const postPercentage =
            totalPosts > 0 ? (platform.posts / totalPosts) * 100 : 0;

          return (
            <div
              key={platform.name}
              className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                  {(() => {
                    const Icon = platform.icon;
                    return <Icon className={`text-xl ${platform.color}`} />;
                  })()}
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900 dark:text-white">
                      {platform.name}
                    </h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {platform.posts} posts
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-medium ${
                      platform.growthType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                    {platform.growth}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <FiTrendingUp className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <div>
                    <p className="text-stone-600 dark:text-stone-400">
                      Avg Engagement
                    </p>
                    <p className="font-medium text-stone-900 dark:text-white">
                      {platform.avgEngagement}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiUsers className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <div>
                    <p className="text-stone-600 dark:text-stone-400">
                      Avg Reach
                    </p>
                    <p className="font-medium text-stone-900 dark:text-white">
                      {platform.avgReach}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <FiClock className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <div>
                    <p className="text-stone-600 dark:text-stone-400">
                      Best Time
                    </p>
                    <p className="font-medium text-stone-900 dark:text-white">
                      {platform.bestTime}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-stone-600 dark:text-stone-400">
                    Target Audience
                  </p>
                  <p className="font-medium text-stone-900 dark:text-white">
                    {platform.audience}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600 dark:text-stone-400">
                    Post Distribution
                  </span>
                  <span className="text-stone-900 dark:text-white">
                    {postPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${platform.bgColor
                      .replace("bg-", "bg-")
                      .replace("-100", "-500")}`}
                    style={{ width: `${postPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Recommendations */}
      <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
        <h4 className="text-md font-medium text-stone-900 dark:text-white mb-3">
          Recommendations
        </h4>
        <div className="space-y-2 text-sm">
          {platformData.map((platform) => {
            if (platform.posts === 0) {
              return (
                <div
                  key={`rec-${platform.name}`}
                  className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-stone-600 dark:text-stone-400">
                    Consider posting on{" "}
                    <span className="font-medium text-stone-900 dark:text-white">
                      {platform.name}
                    </span>{" "}
                    to expand your reach
                  </span>
                </div>
              );
            }
            return null;
          })}

          {platformData.some((p) => p.posts > 0) && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-stone-600 dark:text-stone-400">
                <span className="font-medium text-stone-900 dark:text-white">
                  TikTok
                </span>{" "}
                shows the highest engagement rate - focus on video content
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-stone-600 dark:text-stone-400">
              Optimize posting times based on platform-specific peak hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
