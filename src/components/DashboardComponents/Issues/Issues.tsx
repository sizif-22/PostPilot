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
import { getIssuesByChannel, updateIssueStatus as updateStatusInDb } from "@/firebase/issue.firestore";
import { Issue, IssueStatus, IssuePriority } from "@/interfaces/Issue";
import Loading from "@/components/ui/Loading";

export const Issues = () => {
  const { channel } = useChannel();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterStatus, setFilterStatus] = useState<IssueStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<IssuePriority | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channel) {
      const fetchIssues = async () => {
        try {
          setLoading(true);
          const channelIssues = await getIssuesByChannel(channel.id);
          setIssues(channelIssues);
          setFilteredIssues(channelIssues);
        } catch (err) {
          setError("Failed to fetch issues. Please try again later.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchIssues();
    }
  }, [channel]);

  // Filter issues based on search and filters
  useEffect(() => {
    let filtered = issues;

    if (filterStatus !== "all") {
      filtered = filtered.filter((issue) => issue.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((issue) => issue.priority === filterPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.postContent.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  }, [issues, filterStatus, filterPriority, searchTerm]);

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
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleUpdateIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    const originalIssues = [...issues];
    const updatedIssues = issues.map((issue) =>
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    );
    setIssues(updatedIssues);

    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue({ ...selectedIssue, status: newStatus });
    }

    try {
      await updateStatusInDb(issueId, newStatus);
    } catch (error) {
      setIssues(originalIssues);
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(originalIssues.find(i => i.id === issueId) || null);
      }
      alert("Failed to update issue status. Please try again.");
      console.error("Error updating status:", error);
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: filteredIssues.length,
      open: filteredIssues.filter((i) => i.status === "open").length,
      in_progress: filteredIssues.filter((i) => i.status === "in_progress").length,
      resolved: filteredIssues.filter((i) => i.status === "resolved").length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FiAlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-stone-900 dark:text-white mb-2">Error</h3>
        <p className="text-stone-500 dark:text-stone-400">{error}</p>
      </div>
    );
  }

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
              <div className="font-semibold text-stone-900 dark:text-white">{stats.total}</div>
              <div className="text-stone-500 dark:text-stone-400">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600 dark:text-red-400">{stats.open}</div>
              <div className="text-stone-500 dark:text-stone-400">Open</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600 dark:text-yellow-400">{stats.in_progress}</div>
              <div className="text-stone-500 dark:text-stone-400">Progress</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600 dark:text-green-400">{stats.resolved}</div>
              <div className="text-stone-500 dark:text-stone-400">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-stone-200 dark:border-darkBorder space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 dark:text-stone-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search issues, posts, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-darkBorder rounded-lg bg-white dark:bg-darkButtons text-stone-900 dark:text-white placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-darkButtons rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
            <FiFilter className="w-4 h-4" />
            Filters
            <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {(filterStatus !== 'all' || filterPriority !== 'all') && (
            <div className="text-sm text-stone-500 dark:text-stone-400">
              {filteredIssues.length} of {issues.length} issues shown
            </div>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-darkBackground rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as IssueStatus | 'all')}
                className="px-3 py-1 text-sm border border-stone-300 dark:border-darkBorder rounded bg-white dark:bg-darkButtons text-stone-900 dark:text-white">
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Priority:</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as IssuePriority | 'all')}
                className="px-3 py-1 text-sm border border-stone-300 dark:border-darkBorder rounded bg-white dark:bg-darkButtons text-stone-900 dark:text-white">
                <option value="all">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <FiAlertTriangle className="w-8 h-8 text-stone-400 dark:text-stone-500" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 dark:text-white mb-2">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                ? 'No issues match your filters' 
                : 'No issues found'}
            </h3>
            <p className="text-stone-500 dark:text-stone-400 max-w-md">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'Great! No issues have been reported on your posts yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-darkBorder">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-6 hover:bg-stone-50 dark:hover:bg-darkBackground transition-colors cursor-pointer"
                onClick={() => setSelectedIssue(issue)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      issue.priority === 'critical' ? 'bg-red-500' :
                      issue.priority === 'high' ? 'bg-orange-500' :
                      issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-900 dark:text-white">{issue.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-medium capitalize ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-2 line-clamp-2">
                        {issue.description}
                      </p>
                      <div className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded p-2 mb-3">
                        <div className="font-medium mb-1">Related Post:</div>
                        <div className="line-clamp-1">{issue.postContent}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      <span>{issue.reportedBy.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      <span>{formatDateInTimezone(issue.createdAt, "Africa/Cairo").date} {formatDateInTimezone(issue.createdAt, "Africa/Cairo").month} at {formatDateInTimezone(issue.createdAt, "Africa/Cairo").time}</span>
                    </div>
                    {issue.postPlatforms && (
                      <div className="flex items-center gap-1">
                        {issue.postPlatforms.map((platform) => (
                          <span key={platform}>
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {issue.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FiMessageSquare className="w-4 h-4" />
                        <span>{issue.comments.length}</span>
                      </div>
                    )}
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedIssue.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                  selectedIssue.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  selectedIssue.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                  'bg-green-100 dark:bg-green-900/30'
                }`}>
                  <FiAlertTriangle className={`w-5 h-5 ${getPriorityColor(selectedIssue.priority)}`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">{selectedIssue.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('_', ' ')}
                    </span>
                    <span className={`text-sm font-medium capitalize ${getPriorityColor(selectedIssue.priority)}`}>
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
                  <h3 className="font-semibold text-stone-900 dark:text-white mb-2">Description</h3>
                  <p className="text-stone-700 dark:text-stone-300">{selectedIssue.description}</p>
                </div>

                {/* Related Post */}
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-white mb-3">Related Post</h3>
                  <div className="bg-stone-100 dark:bg-darkButtons rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCalendar className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                      <span className="text-sm text-stone-600 dark:text-stone-400">
                        {/* Scheduled for {formatDateInTimezone(selectedIssue.postScheduledDate || 0, "Africa/Cairo").full} */}
                      </span>
                      <div className="flex items-center gap-1 ml-auto">
                        {selectedIssue.postPlatforms.map((platform) => (
                          <span key={platform}>
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-800 dark:text-stone-200">{selectedIssue.postContent}</p>
                  </div>
                </div>

                {/* Issue Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-white mb-2">Reported By</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                          {selectedIssue.reportedBy.name.slice(0, 1)}
                        </span>
                      </div>
                      <span className="text-stone-700 dark:text-stone-300">{selectedIssue.reportedBy.name}</span>
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {/* {formatDateInTimezone(selectedIssue.createdAt, "Africa/Cairo").full} */}
                    </p>
                  </div>

                  {selectedIssue.assignedTo && (
                    <div>
                      <h3 className="font-semibold text-stone-900 dark:text-white mb-2">Assigned To</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                            {selectedIssue.assignedTo.name.slice(0, 1)}
                          </span>
                        </div>
                        <span className="text-stone-700 dark:text-stone-300">{selectedIssue.assignedTo.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments */}
                {selectedIssue.comments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-white mb-3">Comments</h3>
                    <div className="space-y-3">
                      {selectedIssue.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                              {comment.userName.slice(0, 1)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-stone-900 dark:text-white">{comment.userName}</span>
                              <span className="text-sm text-stone-500 dark:text-stone-400">
                                {/* {formatDateInTimezone(comment.createdAt, "Africa/Cairo").relative} */}
                              </span>
                            </div>
                            <p className="text-stone-700 dark:text-stone-300">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-darkBackground">
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-600 dark:text-stone-400">Status:</span>
                <select
                  value={selectedIssue.status}
                  onChange={(e) => handleUpdateIssueStatus(selectedIssue.id, e.target.value as IssueStatus)}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};