"use client";
import React, { useState, useEffect } from "react";
import {
  FiFacebook,
  FiInstagram,
  FiImage,
  FiX,
  FiRefreshCcw,
} from "react-icons/fi";
import { FaTiktok, FaLinkedin, FaTwitter } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";
import { useChannel } from "@/context/ChannelContext";
import { editPost } from "@/firebase/channel.firestore";
import { MediaItem } from "@/interfaces/Media";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Define the shape of a Post
interface Post {
  id: string;
  message: string;
  platforms: string[];
  media: MediaItem[];
}

interface EditPostDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post: Post | null;
  media?: MediaItem[]; // Available media items for selection
}

export function EditPostDialog({
  isOpen,
  setIsOpen,
  post,
  media = [],
}: EditPostDialogProps) {
  const { channel } = useChannel();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facebookVideoType, setFacebookVideoType] = useState<
    "default" | "reel"
  >("default");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoValidationErrors, setVideoValidationErrors] = useState<string[]>(
    []
  );

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setPostText(post.message || "");
      setSelectedPlatforms(post.platforms || []);
      setSelectedImages(post.media || []);
      setOriginalPost(post);
      setError(null);
    }
  }, [post]);

  // Video validation effect (duration, resolution, aspect ratio)
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
    if (originalPost) {
      setPostText(originalPost.message || "");
      setSelectedPlatforms(originalPost.platforms || []);
      setSelectedImages(originalPost.media || []);
    }
  };

  const handleImageSelect = (image: MediaItem) => {
    setSelectedImages((prev) => {
      if (prev.some((img) => img.url === image.url)) {
        return prev.filter((img) => img.url !== image.url);
      }
      return [...prev, image];
    });
  };

  const handleUpdatePost = async () => {
    if (!post || !channel?.id) return;
    setIsUpdating(true);
    setError(null);
    try {
      // Platform-specific text-only post rule
      if (
        postText.trim() &&
        selectedImages.length === 0 &&
        (!selectedPlatforms.includes("facebook") ||
          selectedPlatforms.length === 0)
      ) {
        throw new Error(
          "Text-only posts are only allowed on Facebook. Please add an image or video to post to other platforms."
        );
      }
      // Media validation
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
        // Facebook Reel validation
        if (
          hasVideos &&
          selectedPlatforms.includes("facebook") &&
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
      const updatedPost = {
        id: post.id,
        message: postText,
        platforms: selectedPlatforms,
        imageUrls: selectedImages,
        facebookVideoType,
      };
      await editPost(post.id, channel.id, updatedPost);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error updating post:", error);
      setError(error.message || "Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const isTextOnly = postText.trim() && selectedImages.length === 0;
  const isFacebookOnly =
    selectedPlatforms.length === 1 && selectedPlatforms[0] === "facebook";
  const isFormValid =
    ((postText.trim() && selectedImages.length === 0 && isFacebookOnly) ||
      selectedImages.length > 0) &&
    selectedPlatforms.length > 0;

  const hasChanges =
    postText !== (originalPost?.message || "") ||
    JSON.stringify(selectedPlatforms.sort()) !==
      JSON.stringify((originalPost?.platforms || []).sort()) ||
    JSON.stringify(selectedImages.map((img) => img.url).sort()) !==
      JSON.stringify((originalPost?.media || []).map((img) => img.url).sort());

  if (!isOpen || !post) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] dark:bg-secondDarkBackground dark:text-white">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
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
              <AlertCircleIcon className="h-5 w-5 text-red-500" />
              <AlertTitle>Unable to update post</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
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
                <FaTwitter className="text-lg" />
                <span className="text-sm">X</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Text Area */}
        <div className="py-4">
          <Textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            // placeholder="What's on your mind?"
            className=" resize-none"
            rows={4}
          />
          {/* Media Selection */}
          <div className="flex gap-2 items-center mt-4">
            <button
              type="button"
              className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
              title="Select media"
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
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
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

        {/* Facebook Video Type (Reel/Default) */}
        {selectedPlatforms.includes("facebook") &&
          selectedImages.length === 1 &&
          selectedImages[0].isVideo && (
            <div className="mt-2">
              <label className="block text-xs text-stone-700 dark:text-white/70 mb-1">
                Facebook Video Type
              </label>
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
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-darkBorder rounded transition-colors">
              Cancel
            </button>
            <button
              onClick={handleUpdatePost}
              disabled={!isFormValid || !hasChanges || isUpdating}
              className="bg-violet-500 hover:bg-violet-600 dark:bg-violet-800 text-white font-bold py-2 px-4 rounded disabled:bg-violet-300 dark:disabled:bg-secondDarkBackground dark:disabled:border dark:disabled:border-darkBorder dark:disabled:cursor-not-allowed">
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
