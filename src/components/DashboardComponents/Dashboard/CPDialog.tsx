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
import { useUser } from "@/context/UserContext";
import { useChannel } from "@/context/ChannelContext";
import { createPost, editPost } from "@/firebase/channel.firestore";
import { Post } from "@/interfaces/Channel";
import {
  convertLocalDateTimeToUnixTimestamp,
  getCurrentTimeInTimezone,
  getMinScheduleDateTime,
  getSortedTimezones,
  isValidScheduleTime,
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
import { platform } from "os";

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

  const PostingHandler = async (postImmediately: boolean = true) => {
    setIsPosting(true);
    try {
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
      }

      let scheduledTimestamp: number | undefined;
      if (!postImmediately && scheduledDate) {
        scheduledTimestamp = convertLocalDateTimeToUnixTimestamp(
          scheduledDate,
          selectedTimeZone
        );

        // Facebook: 13 min, Instagram: 3 min
        const now = Math.floor(Date.now() / 1000);
        const minFbTime = now + 13 * 60;
        const minIgTime = now + 3 * 60;

        if (
          selectedPlatforms.includes("facebook") &&
          scheduledTimestamp < minFbTime
        ) {
          throw new Error(
            "Scheduled time must be at least 13 minutes in the future for Facebook"
          );
        } else if (
          selectedPlatforms.includes("instagram") &&
          scheduledTimestamp < minIgTime
        ) {
          throw new Error(
            "Scheduled time must be at least 3 minutes in the future for Instagram"
          );
        }
      }

      const isScheduled = Boolean(scheduledTimestamp) && !postImmediately;
      const postId = `${new Date().getTime()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const newPost: Post = {
        id: postId,
        message: postText,
        platforms: selectedPlatforms,
        imageUrls: selectedImages,
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

      for (const platform of selectedPlatforms) {
        if (postImmediately) {
          // Immediately post
          if (platform === "facebook" && channel?.socialMedia?.facebook) {
            const fbPostData = {
              ...newPost,
              accessToken: channel.socialMedia.facebook.accessToken,
              pageId: channel.socialMedia.facebook.id,
            };
            const response = await fetch("/api/facebook/createpost", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(fbPostData),
            });
            const data = await response.json();
            if (!response.ok)
              throw new Error(data.error || "Failed to post on Facebook");
            await editPost(postId, channel.id, {
              id: data.id,
              published: true,
            });
          } else if (
            platform === "instagram" &&
            channel?.socialMedia?.instagram
          ) {
            const igPostData = {
              ...newPost,
              accessToken: channel.socialMedia.instagram.pageAccessToken,
              pageId: channel.socialMedia.instagram.instagramId,
            };
            const response = await fetch("/api/instagram/createpost", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(igPostData),
            });
            const data = await response.json();
            if (!response.ok)
              throw new Error(data.error || "Failed to post on Instagram");
            await editPost(postId, channel.id, {
              fid: data.id,
              published: true,
            });
          }
        } else {
          // Schedule post
          if (platform === "facebook" && channel?.socialMedia?.facebook) {
            const fbPostData = {
              ...newPost,
              accessToken: channel.socialMedia.facebook.accessToken,
              pageId: channel.socialMedia.facebook.id,
              scheduledDate: scheduledTimestamp,
            };
            const response = await fetch("/api/facebook/createpost", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(fbPostData),
            });
            const data = await response.json();
            if (!response.ok)
              throw new Error(
                data.error || "Failed to schedule post on Facebook"
              );
            await editPost(postId, channel.id, { fid: data.id });
          } else if (
            platform === "instagram" &&
            channel?.socialMedia?.instagram
          ) {
            const lambdaData = {
              postId: postId,
              channelId: channel.id,
              scheduledDate: scheduledTimestamp,
            };
            await fetch("/api/lambda", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(lambdaData),
            });
          }
        }
      }

      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error("Error posting:", error);
      alert(error.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const isFormValid =
    (postText.trim() || selectedImages.length > 0) &&
    selectedPlatforms.length > 0;
  const canSchedule = isFormValid && scheduledDate;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Select Platforms
          </label>
          <div className="flex gap-2 flex-wrap">
            {channel?.socialMedia?.facebook && (
              <button
                onClick={() => handlePlatformToggle("facebook")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                  selectedPlatforms.includes("facebook")
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-stone-200 hover:border-stone-300"
                }`}>
                <FiFacebook className="text-lg" />
                <span className="text-sm">
                  {channel?.socialMedia.facebook.name}
                </span>
              </button>
            )}
            {channel?.socialMedia?.instagram && (
              <button
                onClick={() => handlePlatformToggle("instagram")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                  selectedPlatforms.includes("instagram")
                    ? "border-pink-300 bg-pink-50 text-pink-700"
                    : "border-stone-200 hover:border-stone-300"
                }`}>
                <FiInstagram className="text-lg" />
                <span className="text-sm">Instagram</span>
              </button>
            )}
          </div>
        </div>

        <div className="py-4">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
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
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Select Images</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="grid grid-cols-4 gap-4">
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

        {/* Schedule Options */}
        <div className="space-y-4 border-t border-stone-200 pt-4">
          <label className="block text-sm font-medium text-stone-700">
            Schedule (Optional)
          </label>

          {/* Timezone Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiGlobe className="text-stone-400 flex-shrink-0" />
              <select
                value={selectedTimeZone}
                onChange={(e) => setSelectedTimeZone(e.target.value)}
                className="text-sm text-stone-700 bg-white border border-stone-200 rounded px-2 py-1 focus:ring-2 focus:ring-violet-500 focus:border-transparent min-w-0 flex-1">
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
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="text-xs text-stone-500">
              📅 Posts must be scheduled at least 13 minutes in advance
              <br />
              🌐 Time shown above is in <strong>{selectedTimeZone}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-2 pt-4 border-t border-stone-200">
          <button
            onClick={resetForm}
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
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
                className="bg-stone-500 hover:bg-stone-600 text-white font-bold py-2 px-4 rounded disabled:bg-stone-300">
                {isPosting ? "Scheduling..." : "Schedule Post"}
              </button>
            )}

            {/* Post Now Button */}
            <button
              onClick={() => PostingHandler(true)}
              disabled={!isFormValid || isPosting}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300">
              {isPosting ? "Posting..." : "Post Now"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
