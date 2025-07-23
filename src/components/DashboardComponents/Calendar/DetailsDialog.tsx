import { useState } from "react";
import { Command } from "cmdk";
import {
  FiX,
  FiMessageSquare,
  FiFacebook,
  FiInstagram,
  FiGlobe,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { FaPlay, FaLinkedin } from "react-icons/fa";
import { Post } from "@/interfaces/Channel";
import { useChannel } from "@/context/ChannelContext";
import { formatDateInTimezone } from "@/utils/timezone";
import { deletePost } from "@/firebase/channel.firestore";
import { EditPostDialog } from "../Dashboard/EditPostDialog";
import { MediaItem } from "@/interfaces/Media";
import { DialogTitle } from "@radix-ui/react-dialog";

// Local type to match EditPostDialog's Post interface
type EditDialogPost = {
  id: string;
  message: string;
  platforms: string[];
  media: any[];
};
export const DetailsDialog = ({
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
            className="bg-white dark:bg-darkBackground rounded-lg w-full max-h-[99vh] max-w-[70vw] mx-4 shadow-xl dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="px-4 flex items-center justify-between  border-b border-stone-200 dark:border-darkBorder h-[9vh]">
              <div className="flex sticky top-0 justify-between w-full items-center">
                <h3 className="text-lg font-semibold dark:text-white">
                  Scheduled Post Preview
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="hover:bg-stone-100 dark:hover:bg-stone-700 p-1 rounded-full transition-colors">
                  <FiX className="text-stone-500 dark:text-stone-400" />
                </button>
              </div>
            </div>
            <div className="grid w-full bg-stone-50 dark:bg-secondDarkBackground h-[70vh] grid-cols-5">
              {selectedEvent.imageUrls && (
                <div
                  className={` overflow-hidden border col-span-2 border-stone-200 dark:border-darkBorder grid gap-1 ${
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
                          className={`relative ${
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
                              <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                  <FaPlay
                                    size={24}
                                    className="text-white"
                                  />
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
                              <span className="text-white text-3xl font-bold">
                                +{remainingCount}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
              <div className="col-span-3 flex flex-col p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 font-semibold">
                        {channel?.socialMedia?.facebook?.name.slice(0, 1)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold dark:text-white">
                        {channel?.socialMedia?.facebook?.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                        <div className="flex items-center gap-1">
                          <FiClock className="text-stone-400 dark:text-stone-500" />
                          {(() => {
                            const timestamp =
                              selectedEvent.scheduledDate ??
                              selectedEvent.date?.seconds;
                            if (!timestamp) return null;
                            const formatted = formatDateInTimezone(
                              timestamp,
                              "Africa/Cairo"
                            );
                            return (
                              <>
                                {formatted.date} {formatted.month} at{" "}
                                {formatted.time}
                              </>
                            );
                          })()}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {selectedEvent?.platforms?.map((platform, index) => (
                            <span key={platform} className="flex items-center">
                              {getPlatformIcon(platform)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[15px] whitespace-pre-wrap dark:text-white">
                    {selectedEvent.content || selectedEvent.message}
                  </p>
                </div>

                <div className="bg-white dark:bg-darkButtons p-3 rounded-lg border border-stone-200 dark:border-darkBorder">
                  <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                    {selectedEvent.scheduledDate && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-violet-500 "></div>
                        <span className="font-medium dark:text-white">
                          Scheduled
                        </span>
                      </>
                    )}
                    {!selectedEvent.published && (
                      <>
                        <span className="text-stone-500 dark:text-stone-400">
                          •
                        </span>
                        Will be posted on{" "}
                      </>
                    )}
                    {(() => {
                      const timestamp =
                        selectedEvent.scheduledDate ??
                        selectedEvent.date?.seconds;
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

                {/* Comment Section */}
                <div className="border-t border-stone-200 dark:border-darkBorder pt-4">
                  <h4 className="font-semibold dark:text-white mb-2">Comments & Issues</h4>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex-shrink-0"></div>
                    <div className="w-full">
                      <textarea
                        placeholder="Add a comment or raise an issue..."
                        className="w-full p-2 border border-stone-300 dark:border-darkBorder rounded-md bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        rows={3}
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 dark:bg-violet-700 dark:hover:bg-violet-800 rounded-lg transition-colors">
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(channel?.authority == "Owner" ||
              channel?.authority == "Contributor") &&
              !selectedEvent.published &&
              !(
                selectedEvent.scheduledDate &&
                selectedEvent.scheduledDate - Math.floor(Date.now() / 1000) <
                  180
              ) && (
                <div className="px-4 flex items-center w-full border-t border-stone-200 dark:border-darkBorder bg-stone-50 dark:bg-darkBackground h-[9vh]">
                  <div className="flex justify-end gap-2 w-full">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg transition-colors">
                      Delete Post
                    </button>

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
                                Are you sure you want to delete this Post? This
                                action cannot be undone.
                              </p>
                              <div className="flex gap-3 justify-end">
                                <button
                                  onClick={() => setShowDeleteConfirm(false)}
                                  className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-darkBorder rounded">
                                  Cancel
                                </button>
                                <button
                                  onClick={confirmDelete}
                                  disabled={isDeleting}
                                  className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded${
                                    isDeleting
                                      ? " opacity-60 cursor-not-allowed"
                                      : ""
                                  }`}>
                                  {isDeleting ? "Deleting..." : "Delete Post"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 dark:bg-violet-700 dark:hover:bg-violet-800 rounded-lg transition-colors"
                      onClick={() => {
                        setEditDialogPost(getEditDialogPost(selectedEvent));
                        setIsEditDialogOpen(true);
                        setOpen(false);
                      }}>
                      Edit Post
                    </button>
                  </div>
                </div>
              )}
          </div>
        </Command.Dialog>
      )}
    </>
  );
};