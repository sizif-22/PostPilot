"use client";
import { useState, useEffect } from "react";
import { useChannel } from "@/context/ChannelContext";
import {
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiX,
  FiEye,
  FiFilter,
  FiSearch,
  FiFacebook,
  FiInstagram,
  FiGlobe,
  FiChevronDown,
  FiCalendar,
} from "react-icons/fi";
import { FaXTwitter, FaTiktok, FaLinkedin } from "react-icons/fa6";
import { formatDateInTimezone } from "@/utils/timezone";
import { createIssue } from "@/firebase/issue.firestore";
import { IssueStatus, IssuePriority } from "@/interfaces/Issue";
import { Issue } from "@/interfaces/Channel";
import Loading from "@/components/ui/Loading";

export const Issues = () => {
  const { channel } = useChannel();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (channel) {
      const allIssues = Object.values(channel.posts)
        .flatMap((post) => post.issues || [])
        .sort((a, b) => b.date.seconds - a.date.seconds);
      setIssues(allIssues);
      setFilteredIssues(allIssues);
    }
  }, [channel]);

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

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case "critical":
        return "text-red-600 dark:text-red-400";
      case "high":
        return "text-orange-600 dark:text-orange-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: filteredIssues.length,
      open: filteredIssues.filter((i) => i.status === "open").length,
      in_progress: filteredIssues.filter((i) => i.status === "in_progress")
        .length,
      resolved: filteredIssues.filter((i) => i.status === "resolved").length,
    };
    return stats;
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
              <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                {stats.in_progress}
              </div>
              <div className="text-stone-500 dark:text-stone-400">Progress</div>
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

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <FiAlertTriangle className="w-8 h-8 text-stone-400 dark:text-stone-500" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 dark:text-white mb-2">
              No issues found
            </h3>
            <p className="text-stone-500 dark:text-stone-400 max-w-md">
              Great! No issues have been reported on your posts yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-darkBorder">
            {filteredIssues.map((issue: Issue, index) => (
              <div
                key={index}
                className="p-6 hover:bg-stone-50 dark:hover:bg-darkBackground transition-colors cursor-pointer"
                onClick={() => setSelectedIssue(issue)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        issue.priority === "critical"
                          ? "bg-red-500"
                          : issue.priority === "high"
                          ? "bg-orange-500"
                          : issue.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {/* <h3 className="font-semibold text-stone-900 dark:text-white">
                          {issue.title}
                        </h3> */}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            issue.status
                          )}`}>
                          {(issue.status || "").replace("_", " ")}
                        </span>
                        <span
                          className={`text-xs font-medium capitalize ${getPriorityColor(
                            issue.priority
                          )}`}>
                          {issue.priority}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-2 line-clamp-2">
                        {issue.message}
                      </p>
                      <div className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded p-2 mb-3">
                        <div className="font-medium mb-1">Related Post:</div>
                        {/* <div className="line-clamp-1">{issue.postContent}</div> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      <span>{issue.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      <span>{formatCommentDate(issue.date)}</span>
                    </div>
                    {/* {issue.postPlatforms && (
                      <div className="flex items-center gap-1">
                        {issue.postPlatforms.map((platform) => (
                          <span key={platform}>
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    )} */}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* {issue.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FiMessageSquare className="w-4 h-4" />
                        <span>{issue.comments.length}</span>
                      </div>
                    )} */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssue(issue);
                      }}
                      className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded">
                      <FiEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-stone-950/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondDarkBackground rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl dark:shadow-[0_8px_64px_0_rgba(0,0,0,0.6)] border border-stone-200 dark:border-darkBorder">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-darkBackground">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedIssue.priority === "critical"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : selectedIssue.priority === "high"
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : selectedIssue.priority === "medium"
                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                      : "bg-green-100 dark:bg-green-900/30"
                  }`}>
                  <FiAlertTriangle
                    className={`w-5 h-5 ${getPriorityColor(
                      selectedIssue.priority
                    )}`}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {selectedIssue.message}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedIssue.status
                      )}`}>
                      {(selectedIssue.status || "").replace("_", " ")}
                    </span>
                    <span
                      className={`text-sm font-medium capitalize ${getPriorityColor(
                        selectedIssue.priority
                      )}`}>
                      {selectedIssue.priority} priority
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
                <FiX className="w-5 h-5 text-stone-500 dark:text-stone-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="p-6 space-y-6">
                {/* Issue Description */}
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-stone-700 dark:text-stone-300">
                    {selectedIssue.message}
                  </p>
                </div>

                {/* Related Post */}
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-white mb-3">
                    Related Post
                  </h3>
                  <div className="bg-stone-100 dark:bg-darkButtons rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCalendar className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                      <span className="text-sm text-stone-600 dark:text-stone-400">
                        {/* Scheduled for {formatDateInTimezone(selectedIssue.postScheduledDate || 0, "Africa/Cairo").full} */}
                      </span>
                      {/* <div className="flex items-center gap-1 ml-auto">
                        {selectedIssue.postPlatforms.map((platform) => (
                          <span key={platform}>
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div> */}
                    </div>
                    {/* <p className="text-stone-800 dark:text-stone-200">
                      {selectedIssue.postContent}
                    </p> */}
                  </div>
                </div>

                {/* Issue Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-white mb-2">
                      Reported By
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                          {selectedIssue.name.slice(0, 1)}
                        </span>
                      </div>
                      <span className="text-stone-700 dark:text-stone-300">
                        {selectedIssue.name}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {/* {formatDateInTimezone(selectedIssue.createdAt, "Africa/Cairo").full} */}
                    </p>
                  </div>

                  {/* {selectedIssue.assignedTo && (
                    <div>
                      <h3 className="font-semibold text-stone-900 dark:text-white mb-2">
                        Assigned To
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                            {selectedIssue.assignedTo.name.slice(0, 1)}
                          </span>
                        </div>
                        <span className="text-stone-700 dark:text-stone-300">
                          {selectedIssue.assignedTo.name}
                        </span>
                      </div>
                    </div>
                  )} */}
                </div>

                {/* Comments */}
                
              </div>
            </div>

            {/* Modal Footer */}
            {/* <div className="flex items-center justify-between p-6 border-t border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-darkBackground">
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-600 dark:text-stone-400">
                  Status:
                </span>
                <select
                  value={selectedIssue.status}
                  onChange={(e) =>
                    createIssue({
                      issue: {
                        ...selectedIssue,
                        status: e.target.value as IssueStatus,
                      },
                      post: channel.posts[selectedIssue.postId],
                      channelId: channel.id,
                    })
                  }
                  className="px-3 py-1 text-sm border border-stone-300 dark:border-darkBorder rounded bg-white dark:bg-darkButtons text-stone-900 dark:text-white">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors">
                  Close
                </button>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};


// {selectedIssue.comments.length > 0 && (
//   <div>
//     <h3 className="font-semibold text-stone-900 dark:text-white mb-3">
//       Comments
//     </h3>
//     <div className="space-y-3">
//       {selectedIssue.comments.map((comment) => (
//         <div key={comment.id} className="flex gap-3">
//           <div className="w-8 h-8 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center flex-shrink-0">
//             <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
//               {comment.userName.slice(0, 1)}
//             </span>
//           </div>
//           <div className="flex-1">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="font-medium text-stone-900 dark:text-white">
//                 {comment.userName}
//               </span>
//               <span className="text-sm text-stone-500 dark:text-stone-400">
//                 {/* {formatDateInTimezone(comment.createdAt, "Africa/Cairo").relative} */}
//               </span>
//             </div>
//             <p className="text-stone-700 dark:text-stone-300">
//               {comment.content}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
// )}