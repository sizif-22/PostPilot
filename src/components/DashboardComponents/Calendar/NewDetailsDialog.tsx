import { useEffect, useState } from "react";
import { Command } from "cmdk";
import {
  FiX,
  FiFacebook,
  FiInstagram,
  FiGlobe,
  FiClock,
  FiAlertCircle,
  FiMessageCircle,
  FiAlertTriangle,
  FiEdit3,
  FiTrash2,
  FiFileText,
  FiSend,
} from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { FaPlay, FaLinkedin } from "react-icons/fa";
import { Issue, Post, Comment } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
import { formatDateInTimezone } from "@/utils/timezone";
import { deletePost, addCommentToPost } from "@/firebase/channel.firestore";
import { EditPostDialog } from "../Dashboard/EditPostDialog";
import { MediaItem } from "@/interfaces/Media";
import { DialogTitle } from "@radix-ui/react-dialog";
import { createComment, createIssue } from "@/firebase/issue.firestore";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { useNotification } from "@/context/NotificationContext";
import * as fs from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";

type EditDialogPost = {
  id: string;
  message: string;
  platforms: string[];
  media: any[];
};

type CommentType = "comment" | "issue";

export const NewDetailsDialog = ({
  selectedPost,
  setSelectedPost,
  open,
  setOpen,
  media,
}: {
  selectedPost: Post | null;
  setSelectedPost: (event: Post | null) => void;
  open: boolean;
  setOpen: any;
  media: MediaItem[];
}) => {
  const { channel } = useChannel();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDialogPost, setEditDialogPost] = useState<EditDialogPost | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentType, setCommentType] = useState<CommentType>("comment");
  const [commentText, setCommentText] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [toggle, setToggle] = useState<boolean>(false);
  const [toggle2, setToggle2] = useState<boolean>(false);
  const { user } = useUser();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (selectedPost && selectedPost.id) {
      const fetchedIssues = Object.values(
        channel?.posts[selectedPost.id]?.issues ?? {}
      );
      setIssues(fetchedIssues);
    }
  }, [selectedPost, toggle]);

  useEffect(() => {
    if (selectedPost && selectedPost.id) {
      const fetchedComments = Object.values(
        channel?.posts[selectedPost.id]?.comments ?? {}
      );
      setComments(fetchedComments);
    }
  }, [selectedPost, toggle2]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <FiFacebook className="text-[#1877F2] w-5 h-5" />;
      case "instagram":
        return <FiInstagram className="text-[#E4405F] w-5 h-5" />;
      case "linkedin":
        return <FaLinkedin className="text-[#0A66C2] w-5 h-5" />;
      case "x":
        return <FaXTwitter className="text-gray-800 dark:text-white w-5 h-5" />;
      case "tiktok":
        return <FaTiktok className="text-gray-800 dark:text-white w-5 h-5" />;
      default:
        return <FiGlobe className="text-stone-600 w-5 h-5" />;
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    if (channel && selectedPost && selectedPost.id) {
      const ruleName = selectedPost?.ruleName;
      const postId = selectedPost.id;
      const channelId = channel.id;
      addNotification({
        messageOnProgress: "Deleting the post.",
        successMessage: "Post deleted successfully.",
        failMessage: "Failed to delete the post.",
        func: [
          fetch("/api/lambda", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ruleNames: [ruleName] }),
          }),
          new Promise(async (resolve, reject) => {
            try {
              await deletePost(postId, channelId);
              resolve(true);
            } catch {
              reject(false);
            }
          }),
        ],
      });
      setShowDeleteConfirm(false);
      setCurrentIndex(0);
      setOpen(false);
    }
    setIsDeleting(false);
  };

  const getEditDialogPost = (event: Post | null): EditDialogPost | null => {
    if (!event) return null;
    return {
      id: event.id || "",
      message: event.message || "",
      platforms: event.platforms || [],
      media: event.media || [],
    };
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedPost || !user) return;

    if (commentType === "issue") {
      const issueId = `${new Date().getTime()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const newIssue = {
        id: issueId,
        message: commentText,
        status: "open",
        author: { email: user.email, name: user.name, avatar: user.avatar },
        comments: [] as Comment[],
        date: fs.Timestamp.now(),
      } as Issue;
      addNotification({
        messageOnProgress: "Submitting new issue",
        failMessage: "Failed to submit the issue",
        successMessage: "Issue submitted successfully.",
        func: [
          new Promise(async (resolve, reject) => {
            try {
              if (channel?.id)
                await createIssue({
                  issue: newIssue,
                  post: selectedPost,
                  channelId: channel?.id,
                });
              setToggle(!toggle);
              resolve(true);
            } catch (error) {
              reject(false);
            }
          }),
        ],
      });
      handleDraft("draft");
    } else {
      const newComment = {
        message: commentText,
        author: { email: user.email, name: user.name, avatar: user.avatar },
        date: fs.Timestamp.now(),
      } as Comment;
      addNotification({
        messageOnProgress: "Submitting new comment",
        failMessage: "Failed to submit the comment",
        successMessage: "Comment submitted successfully.",
        func: [
          new Promise(async (resolve, reject) => {
            try {
              if (channel?.id)
                await createComment({
                  comment: newComment,
                  post: selectedPost,
                  channelId: channel?.id,
                });
              setToggle2(!toggle2);
              resolve(true);
            } catch (error) {
              reject(false);
            }
          }),
        ],
      });
    }
    setCommentText("");
  };

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
  const handleDraft = (type: "draft" | "schedule") => {
    if (!selectedPost) return;

    if (type == "schedule") {
      if (
        selectedPost.issues &&
        Object.values(selectedPost.issues).filter((i) => i.status === "open")
          .length > 0
      ) {
        addNotification({
          failMessage: "There is some issues, this post can't be scheduled",
          messageOnProgress: "",
          successMessage: "",
          func: [new Promise((resolve, reject) => reject(false))],
        });
        return;
      }
      const date = selectedPost.date.seconds - 30;
      const lambdaData = {
        postId: selectedPost.id,
        channelId: channel?.id,
        scheduledDate: date,
      };
      addNotification({
        messageOnProgress: "Scheduling the post",
        failMessage: "failed to schedule",
        successMessage: "Post scheduled successfully",
        func: [
          new Promise(async (resolve, reject) => {
            try {
              await fs.updateDoc(
                fs.doc(db, "Channels", channel?.id as string),
                {
                  [`posts.${selectedPost.id}.draft`]: false,
                }
              );
              resolve(true);
            } catch {
              reject(false);
            }
          }),
          fetch("/api/lambda", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lambdaData),
          }),
        ],
      });
    } else if (type == "draft")
      addNotification({
        messageOnProgress: "adding to Draft",
        failMessage: "failed to Draft",
        successMessage: "Post add to draft successfully",
        func: [
          new Promise(async (resolve, reject) => {
            try {
              await fs.updateDoc(
                fs.doc(db, "Channels", channel?.id as string),
                {
                  [`posts.${selectedPost.id}.draft`]: true,
                }
              );
              resolve(true);
            } catch {
              reject(false);
            }
          }),
          fetch("/api/lambda", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ruleNames: [selectedPost?.ruleName] }),
          }),
        ],
      });
  };

  return (
    <>
      <EditPostDialog
        isOpen={isEditDialogOpen}
        setIsOpen={(open) => setIsEditDialogOpen(open)}
        post={editDialogPost}
        media={media}
      />
      {selectedPost && (
        <div
          className="fixed inset-0 bg-stone-950/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCurrentIndex(0);
              setOpen(false);
            }
          }}>
          <div
            className={`bg-white dark:bg-secondDarkBackground rounded-xl shadow-2xl h-[80vh] max-h-[80vh] w-full max-w-6xl grid overflow-hidden ${
              selectedPost?.media && selectedPost.media.length > 0
                ? "grid-cols-14"
                : "grid-cols-9"
            }`}
            onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => {
                setCurrentIndex(0);
                setOpen(false);
              }}
              className="absolute top-4 right-4 z-10 p-2  ">
              <FiX className="w-5 h-5 text-black dark:text-white" />
            </button>

            {/* Media Section */}
            {selectedPost?.media && selectedPost.media.length > 0 && (
              <div className="col-span-1 lg:col-span-5 bg-gray-50 dark:bg-secondDarkBackground flex items-center justify-center min-h-[300px] lg:min-h-full">
                <div className="relative w-full h-full">
                  {!selectedPost.media[currentIndex]?.isVideo ? (
                    <Image
                      src={selectedPost.media[currentIndex].url}
                      width={1000}
                      height={1000}
                      alt="Post media"
                      className="w-full h-full object-contain border-r dark:border-darkBorder"
                    />
                  ) : (
                    <>
                      <video
                        className="w-full h-full object-cover"
                        preload="metadata">
                        <source src={selectedPost.media[currentIndex].url} />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-md">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                          <FaPlay size={12} className="text-white" />
                        </div>
                      </div>
                    </>
                  )}
                  {Array.isArray(selectedPost?.media) &&
                    typeof selectedPost?.media.length == "number" &&
                    selectedPost.media.length > 1 && (
                      <>
                        {/* Navigation Buttons */}
                        <motion.button
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onClick={() => {
                            if (
                              selectedPost?.media &&
                              selectedPost.media.length > 0
                            ) {
                              setCurrentIndex(
                                currentIndex === 0
                                  ? selectedPost.media.length - 1
                                  : currentIndex - 1
                              );
                            }
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 shadow hover:bg-white/20 transition-colors group"
                          disabled={selectedPost.media.length <= 1}>
                          <ChevronLeft
                            size={24}
                            className="text-white transition-transform group-hover:-translate-x-1"
                          />
                        </motion.button>

                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onClick={() => {
                            if (
                              selectedPost?.media &&
                              selectedPost.media.length > 0
                            ) {
                              setCurrentIndex(
                                (currentIndex + 1) % selectedPost.media.length
                              );
                            }
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 shadow hover:bg-white/20 transition-colors group"
                          disabled={selectedPost.media.length <= 1}>
                          <ChevronRight
                            size={24}
                            className="text-white transition-transform group-hover:translate-x-1"
                          />
                        </motion.button>
                        {selectedPost.media.length > 1 && (
                          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-2 py-1 rounded-full">
                            +{selectedPost.media.length - 1} more
                          </div>
                        )}
                      </>
                    )}
                </div>
              </div>
            )}

            {/* Post Content Section */}
            <div className="col-span-1 lg:col-span-5 flex flex-col p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Platforms:
                    </span>
                    <div className="flex space-x-2">
                      {selectedPost?.platforms?.map((platform, index) => (
                        <div
                          key={platform}
                          className="flex items-center justify-center">
                          {getPlatformIcon(platform)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                <div className="flex items-center gap-1">
                  <FiClock className="text-stone-400 dark:text-stone-500" />
                  {(() => {
                    const timestamp = selectedPost.date.seconds;
                    if (!timestamp) return null;
                    const formatted = formatDateInTimezone(
                      timestamp,
                      "Africa/Cairo"
                    );
                    return (
                      <>
                        {formatted.date} {formatted.month} at {formatted.time}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Post Message */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Post Content
                </h3>
                <div className="bg-gray-50 dark:bg-darkButtons rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-darkBorder">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                {!selectedPost.published && (
                  <button
                    onClick={() => {
                      setEditDialogPost(getEditDialogPost(selectedPost));
                      setIsEditDialogOpen(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <FiEdit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                {!(
                  selectedPost.issues &&
                  Object.values(selectedPost.issues).filter(
                    (i) => i.status === "open"
                  ).length > 0
                ) &&
                  !selectedPost?.published && (
                    <button
                      onClick={() => {
                        handleDraft(
                          selectedPost.draft == true ? "schedule" : "draft"
                        );
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-darkButtons text-white rounded-lg transition-colors">
                      <FiFileText className="w-4 h-4" />
                      <span>
                        {selectedPost.draft == true ? "Schedule" : "Draft"}
                      </span>
                    </button>
                  )}
              </div>
            </div>

            {/* Comments/Issues Section */}
            <div className="col-span-1 lg:col-span-4 flex flex-col max-h-[80vh] bg-gray-50 dark:bg-secondDarkBackground border-l border-gray-200 dark:border-darkBorder">
              {/* Comments Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Discussion
                  </h3>
                </div>

                {/* Comment Type Toggle */}
                <div className="flex rounded-lg bg-gray-200 dark:bg-darkBorder p-1">
                  <button
                    onClick={() => setCommentType("comment")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      commentType === "comment"
                        ? "bg-white dark:bg-darkButtons text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}>
                    <FiMessageCircle className="w-4 h-4" />
                    <span>Comments</span>
                  </button>
                  <button
                    onClick={() => setCommentType("issue")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      commentType === "issue"
                        ? "bg-white dark:bg-darkButtons text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}>
                    <FiAlertTriangle className="w-4 h-4" />
                    <span>Issues</span>
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {commentType == "issue" && issues.length > 0 ? (
                  issues
                    .sort((a, b) => b.date.seconds - a.date.seconds)
                    .map((issue, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-darkBorder">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {issue.author.name || issue.author.email}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCommentDate(issue.date)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {issue.message}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                          ${
                            issue.status == "open"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }
                          `}>
                            <FiAlertCircle className="w-3 h-3 mr-1" />

                            {issue.status == "open" ? "Issue" : "Resolved"}
                          </span>
                        </div>
                      </div>
                    ))
                ) : commentType == "comment" && comments.length > 0 ? (
                  comments
                    .sort((a, b) => b.date.seconds - a.date.seconds)
                    .map((comment, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-darkBorder">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {comment.author.name || comment.author.email}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCommentDate(comment.date)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {comment.message}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200 dark:bg-darkBackground flex items-center justify-center">
                      {commentType === "comment" ? (
                        <FiMessageCircle className="w-6 h-6 text-gray-400" />
                      ) : (
                        <FiAlertTriangle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No {commentType === "comment" ? "comments" : "issues"} yet
                    </p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              {selectedPost.published != true && (
                <div className="p-4 border-t border-gray-200 dark:border-darkBorder">
                  <div className="flex gap-3">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={
                        commentType === "comment"
                          ? "What do you think..."
                          : "Describe Your issue..."
                      }
                      className="w-full px-3 py-2 border border-stone-200 dark:border-darkBorder rounded-lg bg-white dark:bg-darkBackground text-stone-900 dark:text-white placeholder-stone-500 dark:placeholder-stone-400 resize-none"
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim()}
                      className="self-end mb-1 p-2 bg-purple-900 hover:bg-purple-950  text-white rounded-lg transition-colors">
                      <FiSend className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-stone-950/50 dark:bg-black/70 flex items-center justify-center">
              <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-6 max-w-md w-full mx-4 shadow-xl dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
                <div className="flex items-start gap-4">
                  <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">
                      Delete Post
                    </h3>
                    <p className="text-stone-600 dark:text-gray-400 mb-4">
                      Are you sure you want to delete this post? This action
                      cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-darkBorder rounded">
                        Cancel
                      </button>
                      <button
                        disabled={isDeleting}
                        onClick={confirmDelete}
                        className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded`}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* </Command.Dialog> */}
        </div>
      )}
    </>
  );
};
