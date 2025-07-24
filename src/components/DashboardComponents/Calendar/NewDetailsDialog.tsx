import { useState, useEffect } from "react";
import { Command } from "cmdk";
import {
  FiX,
  FiMessageSquare,
  FiFacebook,
  FiInstagram,
  FiGlobe,
  FiClock,
  FiAlertCircle,
  FiMessageCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { FaPlay, FaLinkedin } from "react-icons/fa";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
import { formatDateInTimezone } from "@/utils/timezone";
import { deletePost, addCommentToPost } from "@/firebase/channel.firestore";
import { EditPostDialog } from "../Dashboard/EditPostDialog";
import { MediaItem } from "@/interfaces/Media";
import { DialogTitle } from "@radix-ui/react-dialog";
import { createIssue } from "@/firebase/issue.firestore";
import { useUser } from "@/context/UserContext";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: any;
  type: 'comment' | 'issue';
}

type EditDialogPost = {
  id: string;
  message: string;
  platforms: string[];
  media: any[];
};

type CommentType = 'comment' | 'issue';

export const NewDetailsDialog = ({
  selectedEvent,
  setSelectedEvent,
  open,
  setOpen,
  media,
}: {
  selectedEvent: Post | null;
  setSelectedEvent: (event: Post | null) => void;
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentType, setCommentType] = useState<CommentType>('comment');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (selectedEvent && selectedEvent.comments) {
      setComments(selectedEvent.comments as Comment[]);
    } else {
      setComments([]);
    }
  }, [selectedEvent]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <FiFacebook className="text-[#1877F2]" />;
      case "instagram":
        return <FiInstagram className="text-[#E4405F]" />;
      case "linkedin":
        return <FaLinkedin className="text-[#0A66C2]" />;
      case "x":
        return <FaXTwitter className="text-black dark:text-white" />;
      case "tiktok":
        return <FaTiktok className="text-black dark:text-white" />;
      default:
        return <FiGlobe className="text-stone-600" />;
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    if (channel && selectedEvent && selectedEvent.id) {
      await fetch("/api/lambda", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ruleNames: [selectedEvent?.ruleName] }),
      });
      await deletePost(selectedEvent?.id, channel?.id);
      setShowDeleteConfirm(false);
      setOpen(false);
    }
    setIsDeleting(false);
  };

  const getEditDialogPost = (event: Post | null): EditDialogPost | null => {
    if (!event) return null;
    return {
      id: event.id || "",
      message: event.content || event.message || "",
      platforms: event.platforms || [],
      media: event.imageUrls || [],
    };
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedEvent || !user) return;

    if (commentType === 'issue') {
      const newIssue = {
        postId: selectedEvent.id!,
        postContent: selectedEvent.content || selectedEvent.message || '',
        postScheduledDate: selectedEvent.scheduledDate,
        postPlatforms: selectedEvent.platforms || [],
        title: 'New Issue Reported',
        description: commentText,
        status: 'open' as 'open',
        priority: 'medium' as 'medium',
        reportedBy: {
          id: user.uid,
          name: user.name || 'Anonymous',
          avatar: user.avatar || "https://api.dicebear.com/9.x/notionists/svg?seed=5",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        comments: [],
      };
      await createIssue(newIssue);
    } else {
      await addCommentToPost(selectedEvent.id!, channel!.id, {
        author: user.name || 'Anonymous',
        content: commentText,
        createdAt: new Date(),
        type: 'comment',
      });
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      author: user.name || 'Anonymous',
      content: commentText,
      createdAt: { seconds: Date.now() / 1000 },
      type: commentType,
    };
    setComments([...comments, newComment]);

    setCommentText('');
  };

  const getPlaceholderText = () => {
    return commentType === 'comment'
      ? "Share your thoughts about this post..."
      : "Describe the issue you've identified...";
  };

  return (
    <>
      <EditPostDialog
        isOpen={isEditDialogOpen}
        setIsOpen={(open) => setIsEditDialogOpen(open)}
        post={editDialogPost}
        media={media}
      />
      {selectedEvent && (
        <Command.Dialog
          open={open && !isEditDialogOpen}
          onOpenChange={(openVal) => {
            if (!openVal) {
              setOpen(false);
              setSelectedEvent(null);
            }
          }}
          label="Post Details"
          className="fixed inset-0 bg-stone-950/50 dark:bg-black/70 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}>
          <DialogTitle></DialogTitle>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-darkBackground rounded-xl w-full max-h-[95vh] max-w-[80vw] mx-4 shadow-2xl dark:shadow-[0_8px_64px_0_rgba(0,0,0,0.6)] overflow-hidden border border-stone-200 dark:border-darkBorder">

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-secondDarkBackground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <FiMessageSquare className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">
                    Scheduled Post Preview
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Review and manage your scheduled content
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="hover:bg-stone-200 dark:hover:bg-stone-700 p-2 rounded-full transition-colors">
                <FiX className="text-stone-500 dark:text-stone-400 w-5 h-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(95vh-200px)]">
              {/* Media Section */}
              {selectedEvent.imageUrls && selectedEvent.imageUrls.length > 0 && (
                <div className="w-2/5 bg-stone-100 dark:bg-secondDarkBackground border-r border-stone-200 dark:border-darkBorder">
                  <div className="h-full overflow-hidden flex items-center justify-center">
                    <div className={`w-full h-full grid gap-1 p-2 ${
                      selectedEvent.imageUrls.length === 1
                        ? "grid-cols-1"
                        : "grid-cols-2"
                    }`}>
                      {selectedEvent.imageUrls
                        ?.slice(0, 3)
                        .map((image, index) => {
                          const isLastImage =
                            index === 2 &&
                            (selectedEvent.imageUrls?.length ?? 0) > 3;
                          const remainingCount =
                            (selectedEvent.imageUrls?.length ?? 0) - 3;

                          return (
                            <div
                              key={index}
                              className={`relative rounded-lg overflow-hidden bg-transparent ${
                                (selectedEvent.imageUrls?.length ?? 0) >= 3 &&
                                index === 0
                                  ? "row-span-2"
                                  : ""
                              }`}>
                              {image.isVideo ? (
                                <>
                                  <video
                                    className="w-full h-full object-cover"
                                    preload="metadata">
                                    <source src={image.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                  <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-black/15 transition-all backdrop-blur-sm flex items-center justify-center">
                                      <FaPlay size={16} className="text-white ml-1" />
                                    </div>
                                  </div>
                                </> 
                              ) : (
                                <img
                                  src={image.url}
                                  alt={`Post image ${index + 1}`}
                                  className={`w-full h-full object-cover ${
                                    isLastImage
                                      ? "brightness-50 blur-[2px]"
                                      : ""
                                  }`}
                                  style={{ minHeight: "200px" }}
                                />
                              )}

                              {isLastImage && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-white text-2xl font-bold">
                                    +{remainingCount}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div className={`${selectedEvent.imageUrls && selectedEvent.imageUrls.length > 0 ? 'w-3/5' : 'w-full'} flex flex-col`}>
                <div className="flex-1 p-6 overflow-y-auto">
                  {/* Post Author Info */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-600 dark:text-violet-400 font-semibold text-lg">
                        {channel?.socialMedia?.facebook?.name?.slice(0, 1) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg dark:text-white mb-1">
                        {channel?.socialMedia?.facebook?.name || 'Unknown User'}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {(() => {
                            const timestamp =
                              selectedEvent.scheduledDate ??
                              selectedEvent.date?.seconds;
                            if (!timestamp) return 'No date set';
                            const formatted = formatDateInTimezone(
                              timestamp,
                              "Africa/Cairo"
                            );
                            return `${formatted.date} ${formatted.month} at ${formatted.time}`;
                          })()}
                        </div>
                        {selectedEvent?.platforms && selectedEvent.platforms.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-2">
                              {selectedEvent.platforms.map((platform) => (
                                <span key={platform} className="flex items-center">
                                  {getPlatformIcon(platform)}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-6">
                    <p className="text-base leading-relaxed whitespace-pre-wrap dark:text-white">
                      {selectedEvent.content || selectedEvent.message || 'No content available'}
                    </p>
                  </div>

                  {/* Schedule Status */}
                  <div className="bg-stone-50 dark:bg-darkButtons p-4 rounded-xl border border-stone-200 dark:border-darkBorder mb-6">
                    <div className="flex items-center gap-3">
                      {selectedEvent.scheduledDate && (
                        <>
                          <div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse"></div>
                          <span className="font-medium text-stone-700 dark:text-white">
                            Scheduled
                          </span>
                        </>
                      )}
                      {!selectedEvent.published && (
                        <>
                          <span className="text-stone-400 dark:text-stone-500">•</span>
                          <span className="text-stone-600 dark:text-stone-300">
                            Will be posted on{" "}
                            {(() => {
                              const timestamp =
                                selectedEvent.scheduledDate ??
                                selectedEvent.date?.seconds;
                              if (!timestamp) return 'unknown date';
                              const formatted = formatDateInTimezone(
                                timestamp,
                                "Africa/Cairo"
                              );
                              return `${formatted.date} ${formatted.month} at ${formatted.time}`;
                            })()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Comments & Issues Section */}
                  <div className="border-t border-stone-200 dark:border-darkBorder pt-6">
                    <h4 className="font-semibold text-lg dark:text-white mb-4 flex items-center gap-2">
                      <FiMessageCircle className="w-5 h-5" />
                      Feedback & Issues
                    </h4>

                    {/* Comment Type Selector */}
                    <div className="mb-4">
                      <div className="flex bg-stone-100 dark:bg-darkButtons rounded-lg p-1 w-fit">
                        <button
                          onClick={() => setCommentType('comment')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            commentType === 'comment'
                              ? 'bg-white dark:bg-stone-700 text-violet-600 dark:text-violet-400 shadow-sm'
                              : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                          }`}>
                          <FiMessageCircle className="w-4 h-4" />
                          Comment
                        </button>
                        <button
                          onClick={() => setCommentType('issue')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            commentType === 'issue'
                              ? 'bg-white dark:bg-stone-700 text-red-600 dark:text-red-400 shadow-sm'
                              : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                          }`}>
                          <FiAlertTriangle className="w-4 h-4" />
                          Issue
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Display existing comments/issues */}
                      <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                        {comments.map((comment) => (
                          <div key={comment.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                            comment.type === 'issue' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-stone-50 dark:bg-stone-800/50'
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                              comment.type === 'issue' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-violet-100 dark:bg-violet-900/30'
                            }`}>
                              <span className={`text-sm font-medium ${
                                comment.type === 'issue' ? 'text-red-600 dark:text-red-400' : 'text-violet-600 dark:text-violet-400'
                              }`}>
                                {comment.author.slice(0, 1)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm text-stone-800 dark:text-white">{comment.author}</span>
                                <span className="text-xs text-stone-500 dark:text-stone-400">
                                  {formatDateInTimezone(comment.createdAt.seconds, "Africa/Cairo").date} {formatDateInTimezone(comment.createdAt.seconds, "Africa/Cairo").month} at {formatDateInTimezone(comment.createdAt.seconds, "Africa/Cairo").time}
                                </span>
                              </div>
                              <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Comment Input */}
                      <div className="flex items-start gap-3 pt-4 border-t border-stone-200 dark:border-darkBorder">
                        <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                            {channel?.socialMedia?.facebook?.name?.slice(0, 1) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className={`rounded-lg border-2 transition-colors ${
                            commentType === 'comment'
                              ? 'border-violet-200 dark:border-violet-800 focus-within:border-violet-500'
                              : 'border-red-200 dark:border-red-800 focus-within:border-red-500'
                          }`}>
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder={getPlaceholderText()}
                              className="w-full p-4 bg-transparent dark:text-white focus:outline-none resize-none"
                              rows={4}
                            />
                            <div className="px-4 pb-3 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50 rounded-b-lg">
                              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                                {commentType === 'comment' ? (
                                  <>
                                    <FiMessageCircle className="w-3 h-3 text-violet-500" />
                                    <span>Adding a comment</span>
                                  </>
                                ) : (
                                  <>
                                    <FiAlertTriangle className="w-3 h-3 text-red-500" />
                                    <span>Reporting an issue</span>
                                  </>
                                )}
                              </div>
                              <button
                                onClick={handleSubmitComment}
                                disabled={!commentText.trim()}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  commentType === 'comment'
                                    ? 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700'
                                    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                                }`}>
                                {commentType === 'comment' ? 'Comment' : 'Report Issue'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            {(channel?.authority === "Owner" ||
              channel?.authority === "Contributor") &&
              !selectedEvent.published &&
              !(
                selectedEvent.scheduledDate &&
                selectedEvent.scheduledDate - Math.floor(Date.now() / 1000) < 180
              ) && (
                <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-secondDarkBackground">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4" />
                    Delete Post
                  </button>

                  <button
                    className="px-5 py-2.5 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 rounded-lg transition-colors"
                    onClick={() => {
                      setEditDialogPost(getEditDialogPost(selectedEvent));
                      setIsEditDialogOpen(true);
                      setOpen(false);
                    }}>
                    Edit Post
                  </button>
                </div>
              )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-stone-950/50 dark:bg-black/70 flex items-center justify-center z-[60]">
                <div className="bg-white dark:bg-secondDarkBackground rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl dark:shadow-[0_8px_64px_0_rgba(0,0,0,0.6)] border border-stone-200 dark:border-darkBorder">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <FiAlertCircle className="text-red-600 dark:text-red-400 w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">
                        Delete Post
                      </h3>
                      <p className="text-stone-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this post? This action cannot be undone and will remove the post from all scheduled platforms.
                      </p>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-darkBorder rounded-lg transition-colors">
                          Cancel
                        </button>
                        <button
                          onClick={confirmDelete}
                          disabled={isDeleting}
                          className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg transition-colors flex items-center gap-2${
                            isDeleting ? " opacity-60 cursor-not-allowed" : ""
                          }`}>
                          {isDeleting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Deleting...
                            </>
                          ) : (
                            'Delete Post'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Command.Dialog>
      )}
    </>
  );
};