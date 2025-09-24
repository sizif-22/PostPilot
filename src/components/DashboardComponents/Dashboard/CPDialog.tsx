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
  FiEdit2,
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
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import { useNotification } from "@/context/NotificationContext";
import VideoThumbnailPicker from "../Media/VideoThumbnailPicker";

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
  const [xText, setXText] = useState("");
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isThumbnailPickerOpen, setIsThumbnailPickerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [date, setDate] = useState("");
  const [publishOption, setPublishOption] = useState<"now" | "schedule">("now");
  const [activeTab, setActiveTab] = useState<"default" | "x">("default");
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
    setXText("");
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

  const isFormValid = (() => {
    if (selectedPlatforms.length === 0) {
      return false;
    }

    const hasMedia = selectedImages.length > 0;
    const hasVideo = selectedImages.some((item) => item.isVideo);
    const hasImage = selectedImages.some((item) => !item.isVideo);

    if (hasVideo && hasImage) {
      return false;
    }

    if (selectedImages.filter((item) => item.isVideo).length > 1) {
      return false;
    }

    if (hasMedia) {
      return true;
    }

    const textOnlyPlatforms = ["facebook", "linkedin", "x"];
    const allPlatformsAreTextOnly = selectedPlatforms.every((p) =>
      textOnlyPlatforms.includes(p)
    );

    if (!allPlatformsAreTextOnly) {
      return false;
    }

    if (selectedPlatforms.includes("x") && xText.trim() === "") {
      return false;
    }

    if (
      (selectedPlatforms.includes("facebook") ||
        selectedPlatforms.includes("linkedin")) &&
      postText.trim() === ""
    ) {
      return false;
    }

    return true;
  })();

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
      if (!isFormValid) {
        throw new Error("Invalid post data. Please check your inputs.");
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
        xText,
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
      <DialogContent className="w-full h-full max-w-none rounded-none p-0 sm:p-6 sm:rounded-lg sm:max-w-[90vw] lg:max-w-[80vw] sm:h-auto sm:max-h-[90vh] overflow-hidden dark:bg-secondDarkBackground dark:text-white">
        <DialogHeader className="sticky top-0 backdrop-blur border-b border-stone-200 dark:border-darkBorder px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-lg font-semibold">
            Create Post
          </DialogTitle>
        </DialogHeader>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-1/2 z-50 w-[calc(100%-2rem)] sm:w-full max-w-md mx-auto">
            <Alert
              variant="destructive"
              className=" shadow-lg dark:bg-darkBackground select-none shadow-black/50">
              <AlertCircleIcon className="h-5 w-5" />
              <AlertTitle>Unable to create post</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
              <button
                className="absolute top-2 right-2 hover:text-red-700"
                onClick={() => setError(null)}
                aria-label="Dismiss error">
                <FiX />
              </button>
            </Alert>
          </motion.div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-6 overflow-y-auto max-h-[calc(100vh-112px)] sm:max-h-[calc(90vh-120px)]">
          {/* Main Content - Full width on mobile, 2 columns on desktop */}
          <div className="space-y-4 lg:col-span-2 px-4 sm:px-6 lg:px-0 pb-4 sm:pb-6 lg:pb-0">
            {/* Platform Selection */}
            <div className="space-y-3 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                Select Platforms
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2">
                {channel?.socialMedia?.facebook && (
                  <button
                    onClick={() => handlePlatformToggle("facebook")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 rounded-lg border transition-colors text-sm dark:border-darkBorder ${
                      selectedPlatforms.includes("facebook")
                        ? "border-blue-300 bg-blue-50 text-blue-700 dark:bg-darkBorder dark:text-blue-300"
                        : "border-stone-200 hover:border-stone-300 dark:hover:border-stone-600"
                    }`}>
                    <FiFacebook className="text-lg text-blue-700 dark:text-blue-300" />
                    <span className="text-xs sm:text-sm">Facebook</span>
                  </button>
                )}
                {channel?.socialMedia?.instagram && (
                  <button
                    onClick={() => handlePlatformToggle("instagram")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 rounded-lg border transition-colors text-sm dark:border-darkBorder ${
                      selectedPlatforms.includes("instagram")
                        ? "border-pink-300 bg-pink-50 text-pink-700 dark:bg-darkBorder dark:text-pink-300"
                        : "border-stone-200 hover:border-stone-300 dark:hover:border-stone-600"
                    }`}>
                    <FiInstagram className="text-lg text-pink-700 dark:text-pink-300" />
                    <span className="text-xs sm:text-sm">Instagram</span>
                  </button>
                )}
                {channel?.socialMedia?.tiktok && (
                  <button
                    onClick={() => handlePlatformToggle("tiktok")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 rounded-lg border transition-colors text-sm dark:border-darkBorder ${
                      selectedPlatforms.includes("tiktok")
                        ? "border-stone-800 bg-stone-800 text-white dark:bg-stone-700"
                        : "border-stone-200 hover:border-stone-300 dark:hover:border-stone-600"
                    }`}>
                    <FaTiktok className="text-lg" />
                    <span className="text-xs sm:text-sm">TikTok</span>
                  </button>
                )}
                {channel?.socialMedia?.linkedin && (
                  <button
                    onClick={() => handlePlatformToggle("linkedin")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 rounded-lg border transition-colors text-sm dark:border-darkBorder ${
                      selectedPlatforms.includes("linkedin")
                        ? "border-blue-700 bg-blue-50 text-blue-700 dark:bg-darkBorder dark:text-blue-300"
                        : "border-stone-200 hover:border-stone-300 dark:hover:border-stone-600"
                    }`}>
                    <FaLinkedin className="text-lg text-blue-700 dark:text-blue-300" />
                    <span className="text-xs sm:text-sm">LinkedIn</span>
                  </button>
                )}
                {channel?.socialMedia?.x && (
                  <button
                    onClick={() => handlePlatformToggle("x")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 rounded-lg border transition-colors text-sm dark:border-darkBorder ${
                      selectedPlatforms.includes("x")
                        ? "border-stone-800 bg-stone-800 text-white dark:bg-stone-700"
                        : "border-stone-200 hover:border-stone-300 dark:hover:border-stone-600"
                    }`}>
                    <FaXTwitter className="text-lg" />
                    <span className="text-xs sm:text-sm">X</span>
                  </button>
                )}
              </div>
            </div>

            {/* Post Content - Custom Tab Implementation */}
            <div className="space-y-3 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              {/* Custom Tab Headers */}
              <div className="flex rounded-lg bg-stone-100 dark:bg-darkBorder p-1">
                <button
                  onClick={() => setActiveTab("default")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === "default"
                      ? "bg-white dark:bg-darkButtons shadow-sm text-stone-900 dark:text-white"
                      : "text-stone-600 dark:text-white/70 hover:text-stone-900 dark:hover:text-white"
                  }`}>
                  Default Message
                </button>
                <button
                  onClick={() => setActiveTab("x")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === "x"
                      ? "bg-white dark:bg-darkButtons shadow-sm text-stone-900 dark:text-white"
                      : "text-stone-600 dark:text-white/70 hover:text-stone-900 dark:hover:text-white"
                  }`}>
                  X Message
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "default" && (
                <div className="space-y-3">
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
                    className="w-full px-3 py-3 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={4}
                  />
                  <div className="text-right text-xs text-stone-400 dark:text-white/50">
                    {postText.length}/2200
                  </div>
                </div>
              )}

              {activeTab === "x" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                    X Post
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    Special text for X post
                  </p>
                  <textarea
                    value={xText}
                    onChange={(e) => setXText(e.target.value)}
                    placeholder="What do you want to share on X?"
                    className="w-full px-3 py-3 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={4}
                    maxLength={280}
                  />
                  <div className="text-right text-xs text-stone-400 dark:text-white/50">
                    {xText.length}/280
                  </div>
                </div>
              )}
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
            {/* Media Selection Dialog */}
            <Dialog
              open={isMediaDialogOpen}
              onOpenChange={setIsMediaDialogOpen}>
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

            {/* Facebook Video Type Selection */}
            {selectedPlatforms.includes("facebook") &&
              selectedImages.length === 1 &&
              selectedImages[0].isVideo && (
                <div className="p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70 mb-3">
                    Facebook Video Type
                  </h3>
                  {videoDuration !== null && (
                    <div className="mb-3 text-xs text-stone-600 dark:text-white/60 bg-stone-50 dark:bg-stone-800/50 p-2 rounded">
                      Video duration: {videoDuration.toFixed(1)} seconds
                    </div>
                  )}

                  <label
                    className={`flex items-center gap-3 ${
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
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        Post as <strong>Reel</strong>
                      </span>
                      <p className="text-xs text-stone-500 dark:text-white/60 mt-1">
                        Uncheck for regular video post
                      </p>
                      {videoValidationErrors.length > 0 && (
                        <div className="text-xs text-red-500 mt-1 space-y-1">
                          {videoValidationErrors.map((error, index) => (
                            <div key={index}>• {error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )}
          </div>

          {/* Action Buttons - Bottom on mobile, Right sidebar on desktop */}
          <div className="lg:col-span-1 px-4 sm:px-6 lg:px-0 pb-4 sm:pb-6 space-y-4">
            {/* Scheduling Section */}
            <div className="p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <h3 className="text-sm font-medium text-stone-700 dark:text-white/70 mb-3">
                Publishing Options
              </h3>

              {/* Publish Options */}
              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="publishOption"
                    value="now"
                    checked={publishOption === "now"}
                    onChange={(e) =>
                      setPublishOption(e.target.value as "now" | "schedule")
                    }
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <span className="text-sm font-medium">Publish now</span>
                    <p className="text-xs text-stone-500 dark:text-white/60">
                      Post immediately
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="publishOption"
                    value="schedule"
                    checked={publishOption === "schedule"}
                    onChange={(e) =>
                      setPublishOption(e.target.value as "now" | "schedule")
                    }
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <span className="text-sm font-medium">
                      Schedule for later
                    </span>
                    <p className="text-xs text-stone-500 dark:text-white/60">
                      Choose a specific date and time
                    </p>
                  </div>
                </label>
              </div>

              {/* Scheduling Controls */}
              {publishOption === "schedule" && (
                <div className="space-y-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                  {/* Current Time Display */}
                  <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-white/60">
                    <FiClock className="w-4 h-4" />
                    <span>Current time: {currentTime}</span>
                  </div>

                  {/* Timezone Selection */}
                  {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700 dark:text-white/70">
                      Timezone
                    </label>
                    <select
                      value={selectedTimeZone}
                      onChange={(e) => setSelectedTimeZone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-stone-200 dark:border-darkBorder dark:bg-darkButtons dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {sortedTimezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  {/* Date/Time Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700 dark:text-white/70">
                      Schedule Date & Time
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
                    <div className="text-xs text-stone-600 dark:text-white/60 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <strong>Scheduled for:</strong>{" "}
                      {formatScheduledDateTime()} ({selectedTimeZone})
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="sticky top-4 space-y-4">
              <div className="p-4 border border-stone-200 dark:border-darkBorder rounded-lg bg-stone-50 dark:bg-stone-800/50">
                <h3 className="text-sm font-medium text-stone-700 dark:text-white/70 mb-3">
                  Ready to publish?
                </h3>

                {/* Form Validation Summary */}
                <div className="space-y-2 mb-4 text-xs">
                  <div
                    className={`flex items-center gap-2 ${
                      selectedPlatforms.length > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-stone-500"
                    }`}>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedPlatforms.length > 0
                          ? "bg-green-500"
                          : "bg-stone-300"
                      }`}
                    />
                    Platform selected ({selectedPlatforms.length})
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      selectedImages.length > 0 ||
                      postText.trim() ||
                      xText.trim()
                        ? "text-green-600 dark:text-green-400"
                        : "text-stone-500"
                    }`}>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedImages.length > 0 ||
                        postText.trim() ||
                        xText.trim()
                          ? "bg-green-500"
                          : "bg-stone-300"
                      }`}
                    />
                    Content added
                  </div>

                  {publishOption === "schedule" && (
                    <div
                      className={`flex items-center gap-2 ${
                        date
                          ? "text-green-600 dark:text-green-400"
                          : "text-stone-500"
                      }`}>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          date ? "bg-green-500" : "bg-stone-300"
                        }`}
                      />
                      Schedule time set
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {publishOption === "now" ? (
                    <button
                      onClick={() => PostingHandler(true, false)}
                      disabled={!canPostNow || isPosting}
                      className="w-full px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-stone-300 dark:disabled:bg-stone-600 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                      {isPosting ? "Publishing..." : "Publish Now"}
                    </button>
                  ) : (
                    <button
                      onClick={() => PostingHandler(false, false)}
                      disabled={!canSchedule || isPosting}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-stone-300 dark:disabled:bg-stone-600 disabled:cursor-not-allowed transition-colors text-sm font-medium">
                      {isPosting ? "Scheduling..." : "Schedule Post"}
                    </button>
                  )}

                  <button
                    onClick={() => PostingHandler(false, true)}
                    disabled={!isFormValid || isPosting}
                    className="w-full px-4 py-2.5 border border-stone-300 dark:border-darkBorder text-stone-700 dark:text-white/70 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                    Save as Draft
                  </button>

                  <button
                    onClick={() => setOpen(false)}
                    className="w-full px-4 py-2.5 text-stone-500 dark:text-white/60 hover:text-stone-700 dark:hover:text-white/80 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
