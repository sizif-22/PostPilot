import React from "react";
import { Post } from "@/interfaces/Channel";
import { PostCard } from "./PostCard";
import { ReactSortable } from "react-sortablejs";
import { monthNames } from "./interfaces";
import Draggable from "react-draggable";
interface AllPostsDialogProps {
  open: boolean;
  onClose: () => void;
  posts: Post[];
  date: { day: number; month: number; year: number };
  monthNames: string[];
  onEventSelect?: (post: Post) => void;
  onPostMove?: (
    post: Post,
    newDay: number,
    newMonth: number,
    newYear: number
  ) => void;
  handleDragStart: (post: any) => void;
  handleDragEnd: () => void;
}

export const AllPostsDialog: React.FC<AllPostsDialogProps> = ({
  open,
  onClose,
  posts,
  date,
  monthNames,
  onEventSelect,
  onPostMove,
  handleDragStart,
  handleDragEnd,
}) => {
  const [draggedPost, setDraggedPost] = React.useState<Post | null>(null);
  const nodeRef = React.useRef(null);

  if (!open) return null;

  const formatDate = (date: { day: number; month: number; year: number }) => {
    return `${monthNames[date.month]} ${date.day}, ${date.year}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 w-screen parent h-screen bg-black/50 -z-40" onClick={onClose} />

      {/* Dialog Container */}
      <div className="fixed inset-0 z-50 grid grid-cols-3 items-center justify-items-center pointer-events-none">
        <Draggable bounds="parent" nodeRef={nodeRef}>
          <div
            ref={nodeRef}
            className="bg-white dark:bg-secondDarkBackground rounded-lg shadow-xl w-[18vw] max-w-2xl h-[90vh] overflow-hidden border-2 dark:border-white border-black pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-stone-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  All Posts
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatDate(date)} • {posts.length} post
                  {posts.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-3">
                <ReactSortable
                  list={posts
                    .filter((post) => post.id !== undefined)
                    .map((post) => ({
                      ...post,
                      id: post.id as string | number,
                      chosen: false,
                    }))}
                  setList={() => {}} // We handle movement via onPostMove
                  group={{
                    name: "posts-dialog",
                    pull: true,
                    put: false,
                  }}
                  sort={false}
                  onStart={(evt) => {
                    const post = posts[evt.oldIndex!];
                    handleDragStart(post);
                  }}
                  onEnd={(evt) => {
                    handleDragEnd();
                    onClose();
                  }}
                  className="space-y-3">
                  {posts.map((post) => (
                    <div key={post.id} className="cursor-move" draggable={true}>
                      <PostCard
                        callbackFunc={() => onEventSelect?.(post)}
                        post={post}
                      />
                    </div>
                  ))}
                </ReactSortable>
              </div>
            </div>
          </div>
        </Draggable>
      </div>
    </>
  );
};
