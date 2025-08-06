import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiX,
  FiCalendar,
  FiImage,
  FiVideo,
  FiCheck,
  FiExternalLink,
  FiEdit3,
  FiSend,
} from "react-icons/fi";
import { Issue, Post, Comment } from "@/interfaces/Channel";
import { IssueStatus, IssuePriority } from "@/interfaces/Issue";
import { EditPostDialog } from "../Dashboard/EditPostDialog";
import { MediaItem } from "@/interfaces/Media";
import { createIssueComment } from "@/firebase/issue.firestore";
import { useUser } from "@/context/UserContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useChannel } from "@/context/ChannelContext";
import { useNotification } from "@/context/NotificationContext";
type EditDialogPost = {
  id: string;
  message: string;
  platforms: string[];
  media: any[];
};

interface IssueDetailModalProps {
  issue: Issue;
  post: Post;
  media: MediaItem[];
  channelId: string; // Added channelId prop
  onClose: () => void;
  onResolve: (issue: Issue) => void;
  onCommentAdded?: (issue: Issue, comment: Comment) => void; // Added callback for comment updates
  formatCommentDate: (timestamp: any) => string;
  getPlatformIcon: (platform: string) => JSX.Element;
  getStatusColor: (status: IssueStatus) => string;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  post,
  media,
  channelId,
  onClose,
  onResolve,
  onCommentAdded,
  formatCommentDate,
  getPlatformIcon,
  getStatusColor,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDialogPost, setEditDialogPost] = useState<EditDialogPost | null>(
    null
  );
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [toggle, setToggle] = useState<boolean>(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { user } = useUser();
  const { channel } = useChannel();
  const { addNotification } = useNotification();
  useEffect(() => {
    const fetchedComments =
      channel?.posts?.[issue.postId]?.issues?.[issue.id]?.comments ?? [];
    setComments(fetchedComments);
  }, [issue, toggle]);

  const handleAddComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const newComment: Comment = {
        postId: post.id!,
        message: commentText.trim(),
        author: {
          email: user?.email || "",
          name: user?.name || "",
          avatar: user?.avatar || "",
        },
        date: new Date() as any,
      };

      addNotification({
        messageOnProgress: "Adding your comment.",
        successMessage: "Your comment added successfully.",
        failMessage: "Failed adding your comment.",
        func: [
          new Promise(async (resolve, reject) => {
            try {
              await createIssueComment({
                issue,
                comment: newComment,
                channelId,
              });
              setToggle(!toggle);
              resolve(true);
            } catch {
              reject(false);
            }
          }),
        ],
      });

      // Update local state if callback provided
      if (onCommentAdded) {
        onCommentAdded(issue, newComment);
      }

      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      // You might want to show an error toast here
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <>
      <EditPostDialog
        isOpen={isEditDialogOpen}
        setIsOpen={(open) => setIsEditDialogOpen(open)}
        post={editDialogPost}
        media={media}
      />
      <div
        className="fixed inset-0 bg-stone-950/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}>
        <div className="bg-white dark:bg-secondDarkBackground rounded-xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl dark:shadow-[0_8px_64px_0_rgba(0,0,0,0.6)] border border-stone-200 dark:border-darkBorder">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-darkBackground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <FiAlertTriangle className="text-red-600 dark:text-red-400 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold dark:text-white">
                  Issue Details
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      issue.status
                    )}`}>
                    {(issue.status || "").replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {issue.status !== "resolved" && (
                <>
                  <button
                    onClick={() => onResolve(issue)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium">
                    <FiCheck className="w-4 h-4" />
                    Resolve Issue
                  </button>
                  <button
                    onClick={() => {
                      setEditDialogPost(post as EditDialogPost | null);
                      setIsEditDialogOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium bg-blue-600 hover:bg-blue-700">
                    <FiEdit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
                <FiX className="w-5 h-5 text-stone-500 dark:text-stone-400" />
              </button>
            </div>
          </div>

          {/* Modal Content - Two Columns */}
          <div className="flex flex-1 overflow-hidden h-[calc(90vh-120px)]">
            {/* Left Column - Post Details */}
            <div className="w-1/2 border-r border-stone-200 dark:border-darkBorder overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiCalendar className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                  <h3 className="font-semibold text-lg text-stone-900 dark:text-white">
                    Related Post
                  </h3>
                </div>

                {/* Post Date and Status */}
                <div className="bg-stone-50 dark:bg-darkButtons rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                      <FiClock className="w-4 h-4" />
                      <span>Posted on {formatCommentDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.isScheduled ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                          Scheduled
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                          Published
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Platforms */}
                  {post.platforms && post.platforms.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        Platforms:
                      </span>
                      <div className="flex items-center gap-2">
                        {post.platforms.map((platform, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            {getPlatformIcon(platform)}
                            <span className="text-sm text-stone-600 dark:text-stone-400 capitalize">
                              {platform}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                {post.message && (
                  <div className="mb-6">
                    <h4 className="font-medium text-stone-900 dark:text-white mb-3">
                      Post Message
                    </h4>
                    <div className="bg-white dark:bg-darkBackground border border-stone-200 dark:border-darkBorder rounded-lg p-4">
                      <p className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                        {post.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Media */}
                {((post.media && post.media.length > 0) ||
                  (post.videoUrls && post.videoUrls.length > 0)) && (
                  <div className="mb-6">
                    <h4 className="font-medium text-stone-900 dark:text-white mb-3">
                      Media Content
                    </h4>

                    {/* Images */}
                    {post.media && post.media.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiImage className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            Images ({post.media.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {post.media.map((image, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden">
                              <img
                                src={image.url}
                                alt={`Post image ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {post.videoUrls && post.videoUrls.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FiVideo className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            Videos ({post.videoUrls.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {post.videoUrls.map((video, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                              <FiVideo className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              <span className="text-sm text-stone-700 dark:text-stone-300">
                                Video {idx + 1}
                              </span>
                              <button className="ml-auto p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded">
                                <FiExternalLink className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Post Stats */}
                {/* <div className="bg-stone-50 dark:bg-darkButtons rounded-lg p-4">
                  <h4 className="font-medium text-stone-900 dark:text-white mb-3">
                    Post Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">
                        Issues:
                      </span>
                      <span className="ml-2 font-medium text-stone-900 dark:text-white">
                        {Object.values(post.issues || {}).length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">
                        Comments:
                      </span>
                      <span className="ml-2 font-medium text-stone-900 dark:text-white">
                        {post.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Right Column - Issue Details and Comments */}
            <div className="w-1/2 space-y-3 flex flex-col justify-between h-full px-4 py-2">
              {/* Issue Description */}
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
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
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="flex flex-col mb-2">
                        <span className="font-medium text-red-900 dark:text-red-100">
                          {issue.author.name}
                        </span>
                        <p className="text-sm text-red-600 dark:text-red-400 ">
                          {issue.author.email}
                        </p>
                      </div>
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {formatCommentDate(issue.date)}
                      </span>
                    </div>
                    <p className="text-red-800 dark:text-red-200">
                      {issue.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {comments.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <FiMessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-medium text-stone-900 dark:text-white">
                      Comments ({comments.length})
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="flex flex-col gap-2">
                      {comments
                        .sort((a, b) => b.date.seconds - a.date.seconds)
                        .map((comment: Comment, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-darkBackground border border-stone-200 dark:border-darkBorder rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                {comment.author?.avatar ? (
                                  <>
                                    <img
                                      src={comment.author.avatar}
                                      alt="avatar"
                                      className="object-cover w-full h-full rounded-full"
                                    />
                                  </>
                                ) : (
                                  <>
                                    {comment.author.name
                                      .slice(0, 1)
                                      .toUpperCase()}
                                  </>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <div className="flex flex-col mb-2">
                                    <span className="font-medium text-stone-900 dark:text-white">
                                      {comment.author.name}
                                    </span>
                                    <p className="text-sm text-stone-500 dark:text-stone-400">
                                      {comment.author.email}
                                    </p>
                                  </div>
                                  <span className="text-sm text-stone-500 dark:text-stone-400">
                                    {formatCommentDate(comment.date)}
                                  </span>
                                </div>
                                <p className="text-stone-700 dark:text-stone-300">
                                  {comment.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {/* No Comments State */}
              {(!issue.comments || comments.length === 0) && (
                <div className="text-center py-6 mb-6">
                  <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
                    <FiMessageSquare className="w-6 h-6 text-stone-400 dark:text-stone-500" />
                  </div>
                  <h4 className="font-medium text-stone-900 dark:text-white mb-1">
                    No Comments Yet
                  </h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Be the first to comment on this issue.
                  </p>
                </div>
              )}

              {/* Add Comment Form - Only show if issue is not resolved */}
              {issue.status !== "resolved" && (
                <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-darkBorder">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment to this issue..."
                    className="w-full px-3 py-2 border border-stone-200 dark:border-darkBorder rounded-lg bg-white dark:bg-darkBackground text-stone-900 dark:text-white placeholder-stone-500 dark:placeholder-stone-400 focus:border-transparent resize-none"
                    disabled={isSubmittingComment}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="self-end mb-1 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium">
                    <FiSend className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Resolved Badge */}
              {issue.status === "resolved" && (
                <div className="pt-3 border-t border-stone-200 dark:border-darkBorder">
                  <div className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg">
                    <FiCheck className="w-5 h-5" />
                    <span className="font-medium">Issue Resolved</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IssueDetailModal;
