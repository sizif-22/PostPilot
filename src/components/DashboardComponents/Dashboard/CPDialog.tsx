import React, { useState, useEffect } from "react";
import {
  FiFacebook,
  FiInstagram,
  FiImage,
  FiX,
  FiCalendar,
  FiClock,
  FiRefreshCcw,
  FiGlobe,
} from "react-icons/fi";

import { Checkbox } from "@/components/ui/checkbox";
import { useChannel } from "@/context/ChannelContext";
import { createPost } from "@/firebase/channel.firestore";
import { Post } from "@/interfaces/Channel";
import {
  convertLocalDateTimeToUnixTimestamp,
  getCurrentTimeInTimezone,
  getMinScheduleDateTime,
  getSortedTimezones,
} from "@/lib/utils";
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
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

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
  const [isPosting, setIsPosting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
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
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedTimeZone]);

  // Get video duration, resolution, and aspect ratio when a video is selected
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
            // Duration
            if (video.duration < 3 || video.duration > 90) {
              errors.push("Duration must be between 3 and 90 seconds.");
            }
            // Resolution
            if (video.videoWidth < 540 || video.videoHeight < 960) {
              errors.push("Resolution must be at least 540x960 pixels.");
            }
            // Aspect Ratio
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
    setScheduledDate("");
    setFacebookVideoType("default");
    setVideoDuration(null);
    setError(null);
  };

  const handleImageSelect = (image: MediaItem) => {
    console.log(image.url);
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

  const canSchedule = isFormValid && scheduledDate;

  const PostingHandler = async (postImmediately: boolean = true) => {
    console.log("is reel ?", facebookVideoType);
    setIsPosting(true);
    setError(null);
    try {
      // New: Block text-only posts if any non-Facebook platform is selected
      if (
        postText.trim() &&
        selectedImages.length === 0 &&
        (!isFacebookOrXOnly || selectedPlatforms.length === 0)
      ) {
        throw new Error(
          "Text-only posts are only allowed on Facebook. Please add an image or video to post to other platforms."
        );
      }

      // Validate media types
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

        // X (Twitter) validations
        if (selectedPlatforms.includes("x")) {
          // Image: < 30MB
          if (hasImages) {
            for (const img of selectedImages) {
              // 'size' may be undefined if not available
              if (typeof img.size === "number" && img.size > 30 * 1024 * 1024) {
                throw new Error(
                  "X: Each image must be less than 30MB. Please select a smaller image."
                );
              }
            }
          }
          // Video: < 2m20s and < 512MB
          if (hasVideos) {
            if (videoDuration !== null && videoDuration > 140) {
              throw new Error(
                "X: Video must be less than 2 minutes and 20 seconds (140 seconds)."
              );
            }
            for (const vid of selectedImages) {
              // 'size' may be undefined if not available
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

        // Validate video duration for Reels
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

        // Instagram: Block videos < 3 seconds
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
      if (!postImmediately && scheduledDate) {
        scheduledTimestamp = convertLocalDateTimeToUnixTimestamp(
          scheduledDate,
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

      console.log("is reel ?", facebookVideoType);
      const newPost: Post = {
        id: postId,
        message: postText,
        platforms: selectedPlatforms,
        imageUrls: selectedImages,
        facebookVideoType,
        published: !isScheduled,
        ...(isScheduled && {
          scheduledDate: scheduledTimestamp,
          clientTimeZone: selectedTimeZone,
        }),
      };
      if (channel?.id) {
        await createPost(newPost, channel.id);
      } else {
        throw new Error("Channel ID not found");
      }

      if (postImmediately) {
        // Immediately post
        await fetch("/api/platforms/createpost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId,
            channelId: channel.id,
          }),
        });
      } else {
        const date = scheduledTimestamp && scheduledTimestamp - 30;
        const lambdaData = {
          postId: postId,
          channelId: channel.id,
          scheduledDate: date,
        };
        await fetch("/api/lambda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lambdaData),
        });
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
      <DialogContent className="sm:max-w-[600px] dark:bg-secondDarkBackground dark:text-white">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-1/2  z-50 w-full max-w-md mx-auto">
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

        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-white/70">
            Select Platforms
          </label>
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder  ${
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder  ${
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder  ${
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

        <div className="py-4">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-3 py-2 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            rows={4}
          />

          <div className="flex gap-2 items-center mt-4">
            <button
              type="button"
              className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
              title="Select images"
              onClick={() => setIsMediaDialogOpen(true)}>
              <FiImage className="text-lg" />
            </button>
            <div className="flex gap-2 flex-wrap">
              {selectedImages.map((item) =>
                !item.isVideo ? (
                  <div key={item.url} className="relative group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.url}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      onClick={() => handleImageSelect(item)}
                      className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ) : (
                  <div key={item.url} className="relative group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <video
                        className="object-cover w-full aspect-square"
                        preload="metadata">
                        <source src={item.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/50  transition-all duration-300 flex items-center justify-center">
                        <div className="w-12 h-12  rounded-full flex  items-center justify-center">
                          <FaPlay size={12} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImageSelect(item)}
                      className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Media Selection Dialog */}
        <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
          <DialogContent className="sm:max-w-[800px] dark:text-white dark:bg-darkBackground">
            <DialogHeader>
              <DialogTitle>Select Images</DialogTitle>
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
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/50  transition-all duration-300 flex items-center justify-center">
                        <div className="w-12 h-12  rounded-full flex  items-center justify-center">
                          <FaPlay size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        {selectedPlatforms.includes("facebook") &&
          selectedImages.length === 1 &&
          selectedImages[0].isVideo && (
            <div className="mt-2">
              <label className="block text-xs text-stone-700 dark:text-white/70 mb-1">
                Facebook Video Type
              </label>
              {/* Video Validation Info */}
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
                      <ul className="mb-2 text-xs text-red-500 list-disc ml-4">
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

        {/* Schedule Options */}
        <div className="space-y-4 border-t border-stone-200 dark:border-darkBorder pt-4">
          <label className="block text-sm font-medium text-stone-700 dark:text-white/70">
            Schedule (Optional)
          </label>

          {/* Timezone Selection */}
          <div className="space-y-2">
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

          {/* Date and Time Input */}
          <div className="space-y-2">
            <label className="block text-xs text-stone-500">
              <span className="flex items-center gap-2">
                <FiCalendar className="text-stone-400" />
                Schedule Date and Time
              </span>
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={getMinScheduleDateTime(selectedTimeZone)}
              className="w-full px-3 py-2 border dark:bg-darkButtons dark:border-darkBorder border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="text-xs text-stone-500">
              📅 Posts must be scheduled at least 13 minutes in advance
              <br />
              🌐 Time shown above is in <strong>{selectedTimeZone}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-2 pt-4 border-t border-stone-200 dark:border-darkBorder">
          <button
            onClick={resetForm}
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-red-600 dark:hover:bg-transparent hover:bg-red-50 rounded transition-colors text-sm"
            title="Reset form">
            <FiRefreshCcw size={16} />
            Reset
          </button>

          <div className="flex gap-2">
            {/* Schedule Button - only show if date is selected */}
            {scheduledDate && (
              <button
                onClick={() => PostingHandler(false)}
                disabled={!canSchedule || isPosting}
                className="bg-stone-500 hover:bg-stone-600 text-white font-bold py-2 px-4 rounded disabled:bg-stone-300 dark:disabled:bg-secondDarkBackground dark:border-darkBorder dark:border dark:bg-darkButtons dark:hover:bg-darkBorder dark:disabled:cursor-not-allowed">
                {isPosting ? "Scheduling..." : "Schedule Post"}
              </button>
            )}

            {/* Post Now Button */}
            <button
              onClick={() => PostingHandler(true)}
              disabled={!isFormValid || isPosting}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300 dark:disabled:bg-secondDarkBackground dark:disabled:border dark:disabled:border-darkBorder dark:disabled:cursor-not-allowed">
              {isPosting ? "Posting..." : "Post Now"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
