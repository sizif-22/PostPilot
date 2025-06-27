"use client";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

interface PlatformPerformanceProps {
  data: {
    facebook: number;
    instagram: number;
    tiktok: number;
  };
}

export const PlatformPerformance = ({ data }: PlatformPerformanceProps) => {
  const total = data.facebook + data.instagram + data.tiktok;
  const platforms = [
    {
      name: "Facebook",
      count: data.facebook,
      icon: FaFacebook,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Instagram",
      count: data.instagram,
      icon: FaInstagram,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      name: "TikTok",
      count: data.tiktok,
      icon: FaTiktok,
      color: "text-black dark:text-white",
      bgColor: "bg-stone-100 dark:bg-stone-700",
    },
  ];
  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-lg border dark:border-stone-800 shadow-sm dark:shadow-lg">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
        Platform Performance
      </h3>

      <div className="space-y-4">
        {platforms.map((platform) => {
          const percentage = total > 0 ? (platform.count / total) * 100 : 0;

          return (
            <div
              key={platform.name}
              className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                  {(() => {
                    const Icon = platform.icon;
                    return <Icon className={`text-xl ${platform.color}`} />;
                  })()}
                </div>
                <div>
                  <p className="font-medium text-stone-900 dark:text-white">
                    {platform.name}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {platform.count} posts
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-stone-900 dark:text-white">
                  {percentage.toFixed(1)}%
                </p>
                <div className="w-20 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${platform.bgColor
                      .replace("bg-", "bg-")
                      .replace("-100", "-500")}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Total Posts
          </span>
          <span className="font-semibold text-stone-900 dark:text-white">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
};
