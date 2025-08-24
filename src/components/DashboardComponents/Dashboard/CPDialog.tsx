import React, { useState, useEffect, useRef } from "react";
import {
  FiFacebook,
  FiInstagram,
  FiImage,
  FiX,
  FiCalendar,
  FiClock,
  FiRefreshCcw,
  FiGlobe,
  FiUpload,
} from "react-icons/fi";

import { Checkbox } from "@/components/ui/checkbox";
import { useChannel } from "@/context/ChannelContext";
import { createPost } from "@/firebase/channel.firestore";
import { Post } from "@/interfaces/Channel";
import {
  convertLocalDateTimeToUnixTimestamp,
  formatTimestampInTimezone,
  getCurrentTimeInTimezone,
  getMinScheduleDateTime,
  getSortedTimezones,
} from "@/utils/timezone";
import { MediaItem } from "@/interfaces/Media";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import { FaTiktok, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import { useNotification } from "@/context/NotificationContext";
import VideoThumbnailPicker from "../Media/VideoThumbnailPicker";
import { FiEdit2 } from "react-icons/fi";

export const CPDialog = ({
  open,
  setOpen,
  media,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  media: MediaItem[];
}) => {
  const { channel } = useChannel();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isThumbnailPickerOpen, setIsThumbnailPickerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [date, setDate] = useState("");
  const [publishOption, setPublishOption] = useState<"now" | "schedule">("now");
  const container = [useRef(null), useRef(null)];
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>(() => {
    return (
      localStorage.getItem("userTimeZone") ||
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  });
  const [currentTime, setCurrentTime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [facebookVideoType, setFacebookVideoType] = useState<
    "default" | "reel"
  >("default");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoValidationErrors, setVideoValidationErrors] = useState<string[]>(
    []
  );
  const { addNotification } = useNotification();

  // Get sorted timezones for better UX
  const sortedTimezones = getSortedTimezones();

  // Save timezone preference when it changes
  useEffect(() => {
    localStorage.setItem("userTimeZone", selectedTimeZone);
  }, [selectedTimeZone]);

  // Update current time display every minute
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(getCurrentTimeInTimezone(selectedTimeZone));
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(interval);
  }, [selectedTimeZone]);

  // Get video duration when a video is selected
  useEffect(() => {
    const validateVideoFile = async () => {
      if (selectedImages.length === 1 && selectedImages[0].isVideo) {
        const fileUrl = selectedImages[0].url;
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = fileUrl;
        return new Promise<{
          duration: number;
          width: number;
          height: number;
          errors: string[];
        }>((resolve) => {
          video.onloadedmetadata = () => {
            const errors: string[] = [];
            if (video.duration < 3 || video.duration > 90) {
              errors.push("Duration must be between 3 and 90 seconds.");
            }
            if (video.videoWidth < 540 || video.videoHeight < 960) {
              errors.push("Resolution must be at least 540x960 pixels.");
            }
            const aspect = video.videoWidth / video.videoHeight;
            if (Math.abs(aspect - 9 / 16) > 0.01) {
              errors.push("Aspect ratio must be 9:16.");
            }
            resolve({
              duration: video.duration,
              width: video.videoWidth,
              height: video.videoHeight,
              errors,
            });
          };
          video.onerror = () => {
            resolve({
              duration: 0,
              width: 0,
              height: 0,
              errors: ["Could not load video metadata."],
            });
          };
        });
      }
      return { duration: 0, width: 0, height: 0, errors: [] };
    };

    validateVideoFile().then(({ duration, width, height, errors }) => {
      setVideoDuration(duration);
      setVideoValidationErrors(errors);
      if (duration) {
        console.log(
          "Video duration:",
          duration,
          "width:",
          width,
          "height:",
          height,
          "errors:",
          errors
        );
      }
    });
  }, [selectedImages]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const resetForm = () => {
    setPostText("");
    setSelectedImages([]);
    setSelectedPlatforms([]);
    setDate("");
    setPublishOption("now");
    setFacebookVideoType("default");
    setVideoDuration(null);
    setError(null);
  };

  const handleImageSelect = (image: MediaItem) => {
    setSelectedImages((prev) => {
      if (prev.some((img) => img.url === image.url)) {
        return prev.filter((img) => img.url !== image.url);
      }
      return [...prev, image];
    });
  };

  const isTextOnly = postText.trim() && selectedImages.length === 0;
  const isFacebookOrXOnly =
    selectedPlatforms.length === 1 &&
    (selectedPlatforms[0] === "facebook" || selectedPlatforms[0] === "x");

  const isFormValid =
    ((postText.trim() && selectedImages.length === 0 && isFacebookOrXOnly) ||
      selectedImages.length > 0) &&
    selectedPlatforms.length > 0;

  const canSchedule = isFormValid && publishOption === "schedule" && date;
  const canPostNow = isFormValid && publishOption === "now";

  const formatScheduledDateTime = () => {
    if (date) {
      const dateObj = new Date(date);
      return (
        dateObj.toLocaleDateString() +
        ", " +
        dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
    return "";
  };

  const PostingHandler = async (postImmediately: boolean, draft: boolean) => {
    setIsPosting(true);
    setError(null);
    try {
      if (
        postText.trim() &&
        selectedImages.length === 0 &&
        (!isFacebookOrXOnly || selectedPlatforms.length === 0)
      ) {
        throw new Error(
          "Text-only posts are only allowed on Facebook. Please add an image or video to post to other platforms."
        );
      }

      if (selectedImages.length > 0) {
        const hasVideos = selectedImages.some((item) => item.isVideo);
        const hasImages = selectedImages.some((item) => !item.isVideo);
        const videoCount = selectedImages.filter((item) => item.isVideo).length;

        if (hasVideos && hasImages) {
          throw new Error(
            "Cannot mix videos and images in the same post. Please select either all videos or all images."
          );
        }

        if (videoCount > 1) {
          throw new Error(
            "Cannot post multiple videos at once. Please select only one video."
          );
        }

        if (selectedPlatforms.includes("x")) {
          if (hasImages) {
            for (const img of selectedImages) {
              if (typeof img.size === "number" && img.size > 30 * 1024 * 1024) {
                throw new Error(
                  "X: Each image must be less than 30MB. Please select a smaller image."
                );
              }
            }
          }
          if (hasVideos) {
            if (videoDuration !== null && videoDuration > 140) {
              throw new Error(
                "X: Video must be less than 2 minutes and 20 seconds (140 seconds)."
              );
            }
            for (const vid of selectedImages) {
              if (
                typeof vid.size === "number" &&
                vid.size > 512 * 1024 * 1024
              ) {
                throw new Error(
                  "X: Video must be less than 512MB. Please select a smaller video."
                );
              }
            }
          }
        }

        if (
          hasVideos &&
          facebookVideoType === "reel" &&
          videoDuration !== null
        ) {
          if (videoDuration < 3) {
            throw new Error(
              "Videos must be at least 3 seconds long to be published as a Reel. Please select 'Default Video' instead."
            );
          }
        }

        if (
          hasVideos &&
          selectedPlatforms.includes("instagram") &&
          videoDuration !== null &&
          videoDuration < 3
        ) {
          throw new Error(
            "Instagram videos must be at least 3 seconds long. Please select a longer video."
          );
        }
      }

      let scheduledTimestamp: number | undefined;
      if (!postImmediately && date) {
        const dateTimeString = date;
        scheduledTimestamp = convertLocalDateTimeToUnixTimestamp(
          dateTimeString,
          selectedTimeZone
        );

        const now = Math.floor(Date.now() / 1000);
        const minTime = now + 3 * 60;

        if (scheduledTimestamp < minTime) {
          throw new Error("Scheduled time must be at least 3 minutes");
        }
      }

      const isScheduled = Boolean(scheduledTimestamp) && !postImmediately;
      const postId = `${new Date().getTime()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const timeStampDate: Date = date ? new Date(date) : new Date(Date.now());

      const newPost: Post = {
        id: postId,
        message: postText,
        platforms: selectedPlatforms,
        media: selectedImages,
        facebookVideoType,
        draft,
        published: postImmediately,
        date: postImmediately
          ? Timestamp.now()
          : Timestamp.fromDate(timeStampDate),
        isScheduled: !postImmediately,
      };

      if (channel?.id) {
        await createPost(newPost, channel.id);
      } else {
        throw new Error("Channel ID not found");
      }

      if (postImmediately) {
        addNotification({
          messageOnProgress: "Publishing your post.",
          successMessage: "Post published successfully.",
          failMessage: "Failed to publish your post.",
          func: [
            fetch("/api/platforms/createpost", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                postId,
                channelId: channel.id,
              }),
            }),
          ],
        });
      } else {
        const scheduledDate = scheduledTimestamp && scheduledTimestamp - 30;
        const lambdaData = {
          postId: postId,
          channelId: channel.id,
          scheduledDate,
        };
        if (!draft) {
          addNotification({
            messageOnProgress: "Scheduling your post.",
            successMessage: "Post scheduled successfully.",
            failMessage: "Failed to schedule your post.",
            func: [
              fetch("/api/lambda", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lambdaData),
              }),
            ],
          });
        }
      }
      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error("Error posting:", error);
      setError(error.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-hidden dark:bg-secondDarkBackground dark:text-white">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-1/2 z-50 w-full max-w-md mx-auto">
            <Alert
              variant="destructive"
              className="bg-white shadow-lg dark:bg-darkBackground select-none shadow-black/50">
              <AlertCircleIcon className="h-5 w-5" />
              <AlertTitle>Unable to create post</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <button
                className="absolute top-2 right-2 hover:text-red-700"
                onClick={() => setError(null)}
                aria-label="Dismiss error">
                <FiX />
              </button>
            </Alert>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Left Column */}
          <div className="space-y-6 col-span-2 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Platform Selection */}
            <div className="space-y-3 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                Select Platforms
              </h3>
              <div className="flex gap-2 flex-wrap">
                {channel?.socialMedia?.facebook && (
                  <button
                    onClick={() => handlePlatformToggle("facebook")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${
                      selectedPlatforms.includes("facebook")
                        ? "border-blue-300 bg-blue-50 text-blue-700 dark:bg-darkBorder"
                        : "border-stone-200 hover:border-stone-300"
                    }`}>
                    <FiFacebook className="text-lg text-blue-700" />
                    <span className="text-sm">Facebook</span>
                  </button>
                )}
                {channel?.socialMedia?.instagram && (
                  <button
                    onClick={() => handlePlatformToggle("instagram")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${
                      selectedPlatforms.includes("instagram")
                        ? "border-pink-300 bg-pink-50 text-pink-700 dark:bg-darkBorder"
                        : "border-stone-200 hover:border-stone-300"
                    }`}>
                    <FiInstagram className="text-lg text-pink-700" />
                    <span className="text-sm">Instagram</span>
                  </button>
                )}
                {channel?.socialMedia?.tiktok && (
                  <button
                    onClick={() => handlePlatformToggle("tiktok")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${
                      selectedPlatforms.includes("tiktok")
                        ? "border-black bg-black text-white dark:bg-darkBorder"
                        : "border-stone-200 hover:border-stone-300"
                    }`}>
                    <FaTiktok className="text-lg" />
                    <span className="text-sm">TikTok</span>
                  </button>
                )}
                {channel?.socialMedia?.linkedin && (
                  <button
                    onClick={() => handlePlatformToggle("linkedin")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${
                      selectedPlatforms.includes("linkedin")
                        ? "border-blue-700 bg-blue-50 text-blue-700 dark:bg-darkBorder"
                        : "border-stone-200 hover:border-stone-300"
                    }`}>
                    <FaLinkedin className="text-lg text-blue-700" />
                    <span className="text-sm">LinkedIn</span>
                  </button>
                )}
                {channel?.socialMedia?.x && (
                  <button
                    onClick={() => handlePlatformToggle("x")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${
                      selectedPlatforms.includes("x")
                        ? "border-black bg-black text-white dark:bg-darkBorder"
                        : "border-stone-200 hover:border-stone-300"
                    }`}>
                    <FaXTwitter className="text-lg" />
                    <span className="text-sm">X</span>
                  </button>
                )}
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-3 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                Media
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-white/60">

                {selectedImages.filter((item) => item.isVideo).length > 1 && (
                  <>
                    <span className="text-orange-500 ml-4">⚠</span>
                    <span className="text-orange-600">Max 1 video</span>
                  </>
                )}
                
                {selectedImages.find((item) => item.isVideo) &&
                  selectedImages.find((item) => !item.isVideo) && (
                    <>
                      <span className="text-orange-500 ml-4">⚠</span>
                      <span className="text-orange-600">
                        Cannot mix videos and images
                      </span>
                    </>
                  )}
              </div>

              <div
                ref={container[0]}
                onClick={(e) => {
                  console.log("Containers:", container);
                  if (
                    e.target == container[0].current ||
                    e.target == container[1].current
                  ) {
                    console.log("Done!");
                    setIsMediaDialogOpen(true);
                  }
                }}
                className="border-2 border-dashed border-stone-300 dark:border-darkBorder rounded-lg p-8 text-center cursor-pointer hover:border-stone-400 transition-colors">
                {selectedImages.length > 0 ? (
                  <div
                    className="grid grid-cols-4 gap-2 mt-4"
                    ref={container[1]}>
                    {selectedImages.map((item) => (
                      <div key={item.url} className="relative group">
                        <div className="w-full aspect-square rounded-lg overflow-hidden">
                          {!item.isVideo ? (
                            <Image
                              src={item.url}
                              alt={item.name}
                              width={100}
                              height={100}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              {item.thumbnailUrl ? (
                                <Image
                                  src={item.thumbnailUrl}
                                  alt={item.name}
                                  width={100}
                                  height={100}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <>
                                  <video
                                    className="object-cover w-full h-full"
                                    preload="metadata">
                                    <source src={item.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <FaPlay className="text-white w-4 h-4" />
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        {item.isVideo && (
                          <button
                            onClick={() => {
                              setSelectedVideo(item);
                              setIsThumbnailPickerOpen(true);
                            }}
                            className="absolute bottom-1 left-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black">
                            <FiEdit2 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            handleImageSelect(item);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div onClick={() => setIsMediaDialogOpen(true)}>
                    <FiUpload className="mx-auto mb-3 w-8 h-8 text-stone-400" />
                    <p className="text-sm font-medium text-stone-600 dark:text-white/60">
                      Click to choose from your media
                    </p>
                    {/* <p className="text-xs text-stone-500 dark:text-white/50 mt-1">
                  Support for images and videos
                  </p> */}
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-stone-500 dark:text-white/50">
                      <div className="flex items-center gap-1">
                        <FiImage className="w-4 h-4" />
                        <span>Cannot mix videos and images</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FaPlay className="w-4 h-4" />
                        <span>Max 1 video</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Facebook Video Type Selection */}
            {selectedPlatforms.includes("facebook") &&
              selectedImages.length === 1 &&
              selectedImages[0].isVideo && (
                <div className="p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70 mb-2">
                    Facebook Video Type
                  </h3>
                  {videoDuration !== null && (
                    <div className="mb-2 text-xs text-stone-600 dark:text-white/60">
                      📹 Video duration: {videoDuration.toFixed(1)} seconds
                    </div>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label
                          className={`flex items-center gap-2 ${
                            videoValidationErrors.length > 0
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}>
                          <Checkbox
                            checked={facebookVideoType === "reel"}
                            disabled={videoValidationErrors.length > 0}
                            onCheckedChange={(checked: boolean) =>
                              setFacebookVideoType(checked ? "reel" : "default")
                            }
                          />
                          <span className="text-xs">
                            Post as <b>Reel</b> (uncheck for Video)
                            {videoValidationErrors.length > 0 && (
                              <span className="text-red-500 ml-1">
                                - Video does not meet Reel requirements
                              </span>
                            )}
                          </span>
                        </label>
                      </TooltipTrigger>
                      {videoValidationErrors.length > 0 && (
                        <TooltipContent>
                          <ul className="text-xs text-red-500 list-disc ml-4">
                            {videoValidationErrors.map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

            {/* Post Content */}
            <div className="space-y-3 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                Post Content
              </h3>
              <p className="text-xs text-stone-500 dark:text-white/60">
                Write your message
              </p>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What do you want to share?"
                className="w-full px-3 py-3 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                rows={6}
              />
              <div className="text-right text-xs text-stone-400 dark:text-white/50">
                {postText.length}/2200
              </div>
            </div>
          </div>

          {/* Right Column - Publishing Options */}
          <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <div className="space-y-4 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                Publishing Options
              </h3>
              <p className="text-xs text-stone-500 dark:text-white/60">
                Choose when to publish your content
              </p>

              {/* Publish Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-stone-200 dark:border-darkBorder rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-darkBorder">
                  <input
                    type="radio"
                    name="publishOption"
                    value="now"
                    checked={publishOption === "now"}
                    onChange={() => {
                      setPublishOption("now");
                      setDate("");
                    }}
                    className="w-4 h-4 text-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Post Now</span>
                      <FiUpload className="w-4 h-4 text-stone-400" />
                    </div>
                    <p className="text-xs text-stone-500 dark:text-white/60">
                      Publish immediately
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-stone-200 dark:border-darkBorder rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-darkBorder">
                  <input
                    type="radio"
                    name="publishOption"
                    value="schedule"
                    checked={publishOption === "schedule"}
                    onChange={() => setPublishOption("schedule")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Schedule</span>
                      <FiCalendar className="w-4 h-4 text-stone-400" />
                    </div>
                    <p className="text-xs text-stone-500 dark:text-white/60">
                      Choose date & time
                    </p>
                  </div>
                </label>
              </div>

              {/* Schedule Options */}
              {publishOption === "schedule" && (
                <div className="space-y-4 p-3 bg-stone-50 dark:bg-darkBorder rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-white/70 mb-2">
                        <FiCalendar className="w-4 h-4" />
                        Date
                      </label>
                      <input
                        type="datetime-local"
                        min={getMinScheduleDateTime(selectedTimeZone)}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border dark:bg-darkButtons dark:border-darkBorder border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>

                    {date && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <strong>Scheduled for:</strong>{" "}
                          {formatScheduledDateTime()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-stone-500 dark:text-white/60 space-y-1">
                    <p>
                      📅 Posts must be scheduled at least 3 minutes in advance
                    </p>
                    <p>
                      🌍 Time shown is in <strong>{selectedTimeZone}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Save Draft Button */}
              <button
                type="button"
                onClick={() => PostingHandler(false, true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-stone-300 dark:border-darkBorder text-stone-700 dark:text-white/70 hover:bg-stone-50 dark:hover:bg-darkBorder rounded-lg transition-colors">
                <FiRefreshCcw className="w-4 h-4" />
                Save Draft
              </button>

              {/* Main Action Button */}
              <div className="pt-2">
                {publishOption === "now" ? (
                  <button
                    onClick={() => PostingHandler(true, false)}
                    disabled={!canPostNow || isPosting}
                    className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg disabled:bg-blue-300 dark:disabled:bg-secondDarkBackground dark:disabled:border dark:disabled:border-darkBorder dark:disabled:cursor-not-allowed transition-colors">
                    {isPosting ? "Publishing..." : "Post Now"}
                  </button>
                ) : (
                  <button
                    onClick={() => PostingHandler(false, false)}
                    disabled={!canSchedule || isPosting}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-slate-300 dark:disabled:bg-secondDarkBackground dark:disabled:border dark:disabled:border-darkBorder dark:disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    {isPosting ? "Scheduling..." : "Schedule Post"}
                  </button>
                )}
              </div>
            </div>

            {/* Timezone Selection */}
            <div className="space-y-3 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <div className="flex items-center gap-2">
                <FiGlobe className="text-stone-400 flex-shrink-0" />
                <select
                  value={selectedTimeZone}
                  onChange={(e) => setSelectedTimeZone(e.target.value)}
                  className="text-sm text-stone-700 bg-white dark:bg-darkButtons outline-none dark:text-white border border-stone-200 dark:border-darkBorder rounded px-2 py-1 focus:ring-2 focus:ring-violet-500 focus:border-transparent min-w-0 flex-1">
                  {sortedTimezones.map(({ name, offset }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 ml-6">
                <FiClock className="text-stone-400" />
                <span>Current time: {currentTime}</span>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetForm}
              type="button"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 dark:hover:bg-red-900/20 hover:bg-red-50 rounded transition-colors text-sm border border-red-200 dark:border-red-800">
              <FiRefreshCcw size={16} />
              Reset Form
            </button>
          </div>
        </div>

        {/* Media Selection Dialog */}
        <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
          <DialogContent className="sm:max-w-[800px] dark:text-white dark:bg-darkBackground">
            <DialogHeader>
              <DialogTitle>Select Media</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4 dark:bg-secondDarkBackground dark:border-darkBorder">
              <div className="grid grid-cols-4 gap-4 p-2">
                {media
                  .filter((item) => !item.isVideo)
                  .map((item) => (
                    <div
                      key={item.url}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                        selectedImages.some((img) => img.url === item.url)
                          ? "ring-2 ring-violet-500"
                          : ""
                      }`}
                      onClick={() => handleImageSelect(item)}>
                      <Image
                        src={item.url}
                        alt={item.name}
                        width={200}
                        height={200}
                        className="object-cover w-full aspect-square"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                {media
                  .filter((item) => item.isVideo)
                  .map((item) => (
                    <div
                      key={item.url}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                        selectedImages.some((img) => img.url === item.url)
                          ? "ring-2 ring-violet-500"
                          : ""
                      }`}
                      onClick={() => handleImageSelect(item)}>
                      <video
                        className="object-cover w-full aspect-square"
                        preload="metadata">
                        <source src={item.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                          <FaPlay size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Thumbnail Picker Dialog */}
        <Dialog
          open={isThumbnailPickerOpen}
          onOpenChange={setIsThumbnailPickerOpen}>
          <DialogContent className="sm:max-w-[800px] dark:text-white dark:bg-darkBackground">
            <DialogHeader>
              <DialogTitle>Select Thumbnail</DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <VideoThumbnailPicker
                video={selectedVideo}
                onThumbnailCreated={(thumbnailUrl) => {
                  setSelectedImages((prev) =>
                    prev.map((item) =>
                      item.url === selectedVideo.url
                        ? { ...item, thumbnailUrl }
                        : item
                    )
                  );
                  setIsThumbnailPickerOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
