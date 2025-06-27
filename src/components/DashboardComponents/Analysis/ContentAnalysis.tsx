"use client";
import { FiType, FiImage, FiVideo, FiLayers } from "react-icons/fi";

interface ContentAnalysisProps {
  data: {
    text: number;
    image: number;
    video: number;
    mixed: number;
  };
}

export const ContentAnalysis = ({ data }: ContentAnalysisProps) => {
  const total = data.text + data.image + data.video + data.mixed;
  const contentTypes = [
    {
      name: "Text Only",
      count: data.text,
      icon: FiType,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Posts with text content only",
    },
    {
      name: "Images",
      count: data.image,
      icon: FiImage,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Posts with image content",
    },
    {
      name: "Videos",
      count: data.video,
      icon: FiVideo,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Posts with video content",
    },
    {
      name: "Mixed",
      count: data.mixed,
      icon: FiLayers,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Posts with text and media",
    },
  ];

  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-lg border dark:border-stone-800 shadow-sm dark:shadow-lg">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
        Content Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {contentTypes.map((type) => {
          const percentage = total > 0 ? (type.count / total) * 100 : 0;
          const Icon = type.icon;

          return (
            <div
              key={type.name}
              className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${type.bgColor}`}>
                  <Icon className={`text-lg ${type.color}`} />
                </div>
                <div>
                  <p className="font-medium text-stone-900 dark:text-white">
                    {type.name}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {type.count} posts
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600 dark:text-stone-400">
                    Usage
                  </span>
                  <span className="font-medium text-stone-900 dark:text-white">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${type.bgColor
                      .replace("bg-", "bg-")
                      .replace("-100", "-500")}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {type.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Content Distribution
          </span>
          <span className="font-semibold text-stone-900 dark:text-white">
            {total} total
          </span>
        </div>
      </div>
    </div>
  );
};
