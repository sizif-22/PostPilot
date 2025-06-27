"use client";
import { useChannel } from "@/context/ChannelContext";
import { useState, useMemo } from "react";
import { PlatformPerformance } from "./PlatformPerformance";
import { ContentAnalysis } from "./ContentAnalysis";
import { EngagementMetrics } from "./EngagementMetrics";
import { PostTimeline } from "./PostTimeline";
import { TopPosts } from "./TopPosts";
import { PlatformComparison } from "./PlatformComparison";

export const Analysis = () => {
  const { channel } = useChannel();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  // Calculate analytics data from posts
  const analyticsData = useMemo(() => {
    if (!channel?.posts) return null;

    const posts = Object.values(channel.posts);
    const now = new Date();
    const timeframeMs = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
    };

    const filteredPosts = posts.filter((post) => {
      if (!post.date) return false;
      const postDate = new Date(post.date);
      return (
        now.getTime() - postDate.getTime() <=
        timeframeMs[selectedTimeframe as keyof typeof timeframeMs]
      );
    });

    // Platform usage analysis
    const platformUsage = {
      facebook: 0,
      instagram: 0,
      tiktok: 0,
    };

    filteredPosts.forEach((post) => {
      post.platforms?.forEach((platform) => {
        if (platform in platformUsage) {
          platformUsage[platform as keyof typeof platformUsage]++;
        }
      });
    });

    // Content type analysis
    const contentTypes = {
      text: 0,
      image: 0,
      video: 0,
      mixed: 0,
    };

    filteredPosts.forEach((post) => {
      const hasImages = post.imageUrls && post.imageUrls.length > 0;
      const hasVideo = post.imageUrls?.some((img) => img.isVideo);

      if (hasVideo) {
        contentTypes.video++;
      } else if (hasImages) {
        contentTypes.image++;
      } else if (post.content || post.message) {
        contentTypes.text++;
      }

      if (hasImages && (post.content || post.message)) {
        contentTypes.mixed++;
      }
    });

    // Publishing schedule analysis
    const publishingSchedule = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    filteredPosts.forEach((post) => {
      if (post.date) {
        const day = new Date(post.date)
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        if (day in publishingSchedule) {
          publishingSchedule[day as keyof typeof publishingSchedule]++;
        }
      }
    });

    // Engagement simulation (since we don't have real engagement data)
    const engagementData = filteredPosts.map((post) => ({
      id: post.id,
      title: post.title || "Untitled Post",
      content: post.content || post.message || "",
      platforms: post.platforms || [],
      date: post.date,
      engagement: Math.floor(Math.random() * 1000) + 50, // Simulated engagement
      reach: Math.floor(Math.random() * 5000) + 200, // Simulated reach
      likes: Math.floor(Math.random() * 500) + 10, // Simulated likes
      shares: Math.floor(Math.random() * 100) + 5, // Simulated shares
    }));

    return {
      totalPosts: filteredPosts.length,
      publishedPosts: filteredPosts.filter((p) => p.published).length,
      scheduledPosts: filteredPosts.filter(
        (p) => !p.published && p.scheduledDate
      ).length,
      platformUsage,
      contentTypes,
      publishingSchedule,
      engagementData,
      averageEngagement:
        engagementData.reduce((acc, post) => acc + post.engagement, 0) /
          engagementData.length || 0,
      topPosts: engagementData
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5),
    };
  }, [channel?.posts, selectedTimeframe]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available for analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-white h-[calc(100vh-2rem)] overflow-y-auto relative rounded-lg shadow ">
      {/* Header */}
      <div className="border-b px-4 py-3 h-16 mb-4  border-stone-200 sticky top-0 z-50 bg-white flex justify-between">
        <div>
          <h1 className="text-sm font-bold block">Analytics Dashboard</h1>
          <p className="text-xs block text-stone-500">
            Insights and performance metrics for your social media content
          </p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded ${
                selectedTimeframe === timeframe
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}>
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Posts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.totalPosts}
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Published
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.publishedPosts}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Scheduled
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.scheduledPosts}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Engagement
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(analyticsData.averageEngagement)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 my-4">
        <PlatformPerformance data={analyticsData.platformUsage} />
        <ContentAnalysis data={analyticsData.contentTypes} />
        <EngagementMetrics data={analyticsData.engagementData} />
        <PostTimeline data={analyticsData.publishingSchedule} />
      </div>

      {/* Full Width Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 my-4">
        <TopPosts posts={analyticsData.topPosts} />
        <PlatformComparison data={analyticsData} />
      </div>
    </div>
  );
};
