"use client";
import { useState, useEffect } from "react";
import { useChannel } from "@/context/ChannelContext";
import {
  FiAlertTriangle,
  FiClock,
  FiMessageSquare,
  FiEye,
  FiSearch,
  FiFacebook,
  FiInstagram,
  FiGlobe,
  FiCalendar,
  FiImage,
  FiVideo,
  FiCheck,
} from "react-icons/fi";
import { FaXTwitter, FaTiktok, FaLinkedin } from "react-icons/fa6";
import { IssueStatus, IssuePriority } from "@/interfaces/Issue";
import { Issue, Post, Comment } from "@/interfaces/Channel";
import IssueDetailModal from "./IssueDetailModal";
import * as fs from "firebase/firestore";
import { useNotification } from "@/context/NotificationContext";
import { db } from "@/firebase/config";
import { EditPostDialog } from "../Dashboard/EditPostDialog";
import { MediaItem } from "@/interfaces/Media";
export const Issues = ({ media }: { media: MediaItem[] }) => {
  const { channel } = useChannel();
  const [issues, setIssues] = useState<Issue[]>([]);

  const [resolvedIssues, setResolvedIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<"open" | "resolved">("open");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | "all">(
    "all"
  );
  const { addNotification } = useNotification();

  useEffect(() => {
    if (channel) {
      const allIssues: Issue[] = [];
      const allResolvedIssues: Issue[] = [];

      Object.entries(channel.posts).forEach(([postId, post]) => {
        if (post.issues) {
          Object.values(post.issues).forEach((issue) => {
            const issueWithPost = { ...issue, postId };
            if (issue.status === "resolved") {
              allResolvedIssues.push(issueWithPost);
            } else {
              allIssues.push(issueWithPost);
            }
          });
        }
      });

      // Sort by date (newest first)
      allIssues.sort((a, b) => b.date.seconds - a.date.seconds);
      allResolvedIssues.sort((a, b) => b.date.seconds - a.date.seconds);

      setIssues(allIssues);
      setResolvedIssues(allResolvedIssues);
    }
  }, [channel]);

  useEffect(() => {
    const currentIssues = activeTab === "open" ? issues : resolvedIssues;
    let filtered = currentIssues;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    setFilteredIssues(filtered);
  }, [
    channel,
    issues,
    resolvedIssues,
    activeTab,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  const formatCommentDate = (timestamp: any) => {
    const date = timestamp?.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <FiFacebook className="text-[#1877F2] w-4 h-4" />;
      case "instagram":
        return <FiInstagram className="text-[#E4405F] w-4 h-4" />;
      case "linkedin":
        return <FaLinkedin className="text-[#0A66C2] w-4 h-4" />;
      case "x":
        return <FaXTwitter className="text-black dark:text-white w-4 h-4" />;
      case "tiktok":
        return <FaTiktok className="text-black dark:text-white w-4 h-4" />;
      default:
        return <FiGlobe className="text-stone-600 w-4 h-4" />;
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: issues.length + resolvedIssues.length,
      open: issues.length,
      resolved: resolvedIssues.length,
    };
    return stats;
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    if (issue.postId && channel?.posts[issue.postId]) {
      setSelectedPost(channel.posts[issue.postId]);
    }
  };

  const handleResolveIssue = async (issue: Issue) => {
    if (!channel || !issue.postId) return;
    addNotification({
      failMessage: "Failed to resolve the issue",
      messageOnProgress: "Resolving the issue.",
      successMessage: "issue resolved successfully.",
      func: [
        fs.updateDoc(fs.doc(db, "Channels", channel.id), {
          [`posts.${issue.postId}.issues.${issue.id}.status`]: "resolved",
        }),
      ],
    });

    setSelectedIssue(null);
    setSelectedPost(null);
  };

  const stats = getStatusStats();

  return (
    <div className="bg-white dark:bg-secondDarkBackground h-[calc(100vh-2rem)] overflow-hidden relative rounded-lg shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] border border-stone-200 dark:border-darkBorder transition-colors duration-300">
      {/* Header */}
      <div className="flex p-6 justify-between items-center border-b border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-darkBackground">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <FiAlertTriangle className="text-red-600 dark:text-red-400 w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-xl dark:text-white">Issues</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Track and resolve content issues across all posts
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-stone-900 dark:text-white">
                {stats.total}
              </div>
              <div className="text-stone-500 dark:text-stone-400">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600 dark:text-red-400">
                {stats.open}
              </div>
              <div className="text-stone-500 dark:text-stone-400">Open</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600 dark:text-green-400">
                {stats.resolved}
              </div>
              <div className="text-stone-500 dark:text-stone-400">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="border-b border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-darkBackground">
        <div className="flex items-center justify-between p-4">
          {/* Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("open")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "open"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}>
              Open Issues ({issues.length})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "resolved"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}>
              Resolved ({resolvedIssues.length})
            </button>
          </div>

          {/* Search and Filters */}
          {/* <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-stone-200 dark:border-darkBorder rounded-lg bg-white dark:bg-darkButtons text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as IssueStatus | "all")
              }
              className="px-3 py-2 border border-stone-200 dark:border-darkBorder rounded-lg bg-white dark:bg-darkButtons text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as IssuePriority | "all")
              }
              className="px-3 py-2 border border-stone-200 dark:border-darkBorder rounded-lg bg-white dark:bg-darkButtons text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white">
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div> */}
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-scroll space-y-2 flex flex-col gap-2 h-[75vh] pb-10">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <FiAlertTriangle className="w-8 h-8 text-stone-400 dark:text-stone-500" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 dark:text-white mb-2">
              {activeTab === "open"
                ? "No open issues found"
                : "No resolved issues found"}
            </h3>
            <p className="text-stone-500 dark:text-stone-400 max-w-md">
              {activeTab === "open"
                ? "Great! No issues have been reported on your posts yet."
                : "No issues have been resolved yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-darkBorder">
            {filteredIssues.map((issue: Issue, index) => {
              const post = issue.postId && channel?.posts[issue.postId];
              return (
                <div
                  key={`${issue.postId}-${index}`}
                  className="p-6 hover:bg-stone-50 dark:hover:bg-darkBackground transition-colors cursor-pointer"
                  onClick={() => handleIssueClick(issue)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              issue.status
                            )}`}>
                            {(issue.status || "").replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-stone-900 dark:text-white mb-2">
                          {issue.message}
                        </p>

                        {/* Post Preview */}
                        {post && (
                          <div className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded p-3 mb-3">
                            <div className="font-medium mb-2 flex items-center gap-2">
                              <FiCalendar className="w-3 h-3" />
                              Related Post - {formatCommentDate(post.date)}
                            </div>
                            {post.message && (
                              <p className="line-clamp-2 mb-2">
                                {post.message}
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              {post.platforms && (
                                <div className="flex items-center gap-1">
                                  {post.platforms.map((platform, idx) => (
                                    <span key={idx}>
                                      {getPlatformIcon(platform)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {post.media && post.media.length > 0 && (
                                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                  <FiImage className="w-3 h-3" />
                                  <span>{post.media.length}</span>
                                </div>
                              )}
                              {post.videoUrls && post.videoUrls.length > 0 && (
                                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                  <FiVideo className="w-3 h-3" />
                                  <span>{post.videoUrls.length}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                            {issue.author?.avatar ? (
                              <>
                                <img
                                  src={issue.author.avatar}
                                  alt="avatar"
                                  className="object-cover w-full h-full rounded-full"
                                />
                              </>
                            ) : (
                              <>{issue.author.name.slice(0, 1).toUpperCase()}</>
                            )}
                          </span>
                        </div>
                        <span>{issue.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>{formatCommentDate(issue.date)}</span>
                      </div>
                      {post &&
                        typeof post === "object" &&
                        "comments" in post &&
                        Array.isArray(issue.comments) &&
                        issue.comments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FiMessageSquare className="w-4 h-4" />
                            <span>{issue.comments.length} comments</span>
                          </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIssueClick(issue);
                        }}
                        className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors">
                        <FiEye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && selectedPost && (
        <IssueDetailModal
          issue={selectedIssue}
          post={selectedPost}
          media={media}
          channelId={channel?.id || ""}
          onClose={() => {
            setSelectedIssue(null);
            setSelectedPost(null);
          }}
          onResolve={handleResolveIssue}
          formatCommentDate={formatCommentDate}
          getPlatformIcon={getPlatformIcon}
          getStatusColor={getStatusColor}
          // getPriorityColor={getPriorityColor}
        />
      )}
    </div>
  );
};
