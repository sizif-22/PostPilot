"use client";
import { FiTrendingUp, FiEye, FiHeart, FiShare2 } from "react-icons/fi";
import { FaFacebook, FaInstagram } from "react-icons/fa";

interface TopPost {
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

interface TopPostsProps {
  posts: TopPost[];
}

export const TopPosts = ({ posts }: TopPostsProps) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <FaFacebook className="text-blue-600" />;
      case "instagram":
        return <FaInstagram className="text-pink-600" />;
      case "tiktok":
        return <div className="text-black font-bold">TT</div>;
      default:
        return null;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Unknown date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-lg border dark:border-stone-800 shadow-sm dark:shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="text-lg text-stone-600 dark:text-stone-400" />
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
          Top Performing Posts
        </h3>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={post.id || index}
            className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    #{index + 1}
                  </span>
                </div>
                <h4 className="font-medium text-stone-900 dark:text-white">
                  {post.title || "Untitled Post"}
                </h4>
              </div>
              <div className="flex items-center gap-1">
                {post.platforms.map((platform) => (
                  <div key={platform} className="p-1">
                    {getPlatformIcon(platform)}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
              {truncateText(
                post.content || post.title || "No content available"
              )}
            </p>

            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-3">
              <span>{formatDate(post.date)}</span>
              <div className="flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" />
                <span className="font-medium text-violet-600 dark:text-violet-400">
                  {post.engagement} engagement
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-1 text-xs">
                <FiEye className="w-3 h-3 text-blue-500" />
                <span className="text-stone-600 dark:text-stone-400">
                  {post.reach}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <FiHeart className="w-3 h-3 text-red-500" />
                <span className="text-stone-600 dark:text-stone-400">
                  {post.likes}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <FiShare2 className="w-3 h-3 text-green-500" />
                <span className="text-stone-600 dark:text-stone-400">
                  {post.shares}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-8">
          <FiTrendingUp className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <p className="text-stone-500 dark:text-stone-400">
            No posts available for analysis
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-stone-600 dark:text-stone-400">
            Showing top {posts.length} posts
          </span>
          <span className="text-stone-900 dark:text-white font-medium">
            Based on engagement metrics
          </span>
        </div>
      </div>
    </div>
  );
};
