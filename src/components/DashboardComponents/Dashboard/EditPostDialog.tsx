"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FiFacebook,
  FiInstagram,
  FiImage,
  FiX,
  FiRefreshCcw,
  FiUpload,
  FiEdit2,
} from "react-icons/fi";
import { FaTiktok, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { FaPlay, FaYoutube } from "react-icons/fa";
import { useChannel } from "@/context/ChannelContext";
import { useUser } from "@/context/UserContext";
import { editPost } from "@/firebase/channel.firestore";
import { MediaItem } from "@/interfaces/Media";
import { Post } from "@/interfaces/Channel";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import VideoThumbnailPicker from "../Media/VideoThumbnailPicker";

interface EditPostDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post: Post | null;
  media?: MediaItem[];
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${mb.toFixed(1)} MB`;
};

export function EditPostDialog({
  isOpen,
  setIsOpen,
  post,
  media = [],
}: EditPostDialogProps) {
  const { channel } = useChannel();
  const { user } = useUser();
  // Core Post State
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postText, setPostText] = useState(""); // General/Fallback text

  // Platform Specific Text
  const [facebookText, setFacebookText] = useState("");
  const [instagramText, setInstagramText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [xText, setXText] = useState("");

  // YouTube State
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeDisc, setYoutubeDisc] = useState("");
  const [youtubeTags, setYoutubeTags] = useState("");
  const [youtubePrivacy, setYoutubePrivacy] = useState("public");
  const [youtubeMadeForKids, setYoutubeMadeForKids] = useState<boolean | null>(null);
  const [youtubeCategory, setYoutubeCategory] = useState("22");

  // TikTok State
  const [tiktokDescription, setTiktokDescription] = useState("");
  const [tiktokPrivacy, setTiktokPrivacy] = useState<string>("");
  const [tiktokAllowComment, setTiktokAllowComment] = useState(false);
  const [tiktokAllowDuet, setTiktokAllowDuet] = useState(false);
  const [tiktokAllowStitch, setTiktokAllowStitch] = useState(false);
  const [tiktokCommercialContent, setTiktokCommercialContent] = useState(false);
  const [tiktokBrandOrganic, setTiktokBrandOrganic] = useState(false);
  const [tiktokBrandedContent, setTiktokBrandedContent] = useState(false);
  // We'll mimic fetching creator info if available or just use local state for now.
  // Ideally we replicate the fetch logic from CPDialog if we want validation against creator limits.
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [tiktokCreatorInfo, setTiktokCreatorInfo] = useState<any>(null);

  // Media State
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isThumbnailPickerOpen, setIsThumbnailPickerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [facebookVideoType, setFacebookVideoType] = useState<"default" | "reel">("default");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoValidationErrors, setVideoValidationErrors] = useState<string[]>([]);

  // UI State
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"facebook" | "instagram" | "linkedin" | "x" | "youtube" | "tiktok" | null>(null);

  const container = [useRef(null), useRef(null)];

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setOriginalPost(post);
      setSelectedPlatforms(post.platforms || []);
      setSelectedImages(post.media || []);

      setPostText(post.message || "");
      setFacebookText(post.facebookText || "");
      setInstagramText(post.instagramText || "");
      setLinkedinText(post.linkedinText || "");
      setXText(post.xText || "");

      setYoutubeTitle(post.youtubeTitle || "");
      setYoutubeDisc(post.youtubeDisc || "");
      setYoutubeTags(post.youtubeTags ? post.youtubeTags.join(", ") : "");
      setYoutubePrivacy(post.youtubePrivacy || "public");
      setYoutubeMadeForKids(post.youtubeMadeForKids ?? null);
      setYoutubeCategory(post.youtubeCategory || "22");

      setTiktokDescription(post.tiktokDescription || "");
      setTiktokPrivacy(post.tiktokPrivacy || "");
      setTiktokAllowComment(post.tiktokAllowComment || false);
      setTiktokAllowDuet(post.tiktokAllowDuet || false);
      setTiktokAllowStitch(post.tiktokAllowStitch || false);
      setTiktokCommercialContent(post.tiktokCommercialContent || false);
      setTiktokBrandOrganic(post.tiktokBrandOrganic || false);
      setTiktokBrandedContent(post.tiktokBrandedContent || false);

      setFacebookVideoType((post.facebookVideoType as "default" | "reel") || "default");
      setError(null);

      // Set initial active tab logic
      if (post.platforms && post.platforms.length > 0) {
        setActiveTab(post.platforms[0] as any);
      }
    }
  }, [post]);

  // Fetch TikTok Creator Info (Simplified version for Edit)
  useEffect(() => {
    if (selectedPlatforms.includes("tiktok") && channel?.id && !tiktokCreatorInfo) {
      const fetchCreatorInfo = async () => {
        setTiktokLoading(true);
        try {
          const response = await fetch("/api/tiktok/creator_info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelId: channel.id }),
          });
          if (response.ok) {
            const data = await response.json();
            setTiktokCreatorInfo(data.data);
          }
        } catch (error) {
          // Silent failure ok for edit dialog
        } finally {
          setTiktokLoading(false);
        }
      };
      fetchCreatorInfo();
    }
  }, [selectedPlatforms, channel?.id, tiktokCreatorInfo]);

  // Video validation effect
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
            // Basic basic validation, can expand if needed
            if (video.duration < 3 && facebookVideoType === "reel") {
              errors.push("Reels must be > 3s");
            }
            resolve({
              duration: video.duration,
              width: video.videoWidth,
              height: video.videoHeight,
              errors,
            });
          };
          video.onerror = () => resolve({ duration: 0, width: 0, height: 0, errors: [] });
        });
      }
      return { duration: 0, width: 0, height: 0, errors: [] };
    };
    validateVideoFile().then(({ duration, errors }) => {
      setVideoDuration(duration);
      setVideoValidationErrors(errors);
    });
  }, [selectedImages, facebookVideoType]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) => {
      const newPlatforms = prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId];

      if (newPlatforms.length === 0) {
        setActiveTab(null);
      } else if (!prev.includes(platformId)) {
        setActiveTab(platformId as any);
      } else if (activeTab === platformId) {
        const remaining = newPlatforms[0];
        setActiveTab(remaining ? (remaining as any) : null);
      }
      return newPlatforms;
    });
  };

  const handleImageSelect = (image: MediaItem) => {
    setSelectedImages((prev) => {
      if (prev.some((img) => img.url === image.url)) {
        return prev.filter((img) => img.url !== image.url);
      }
      return [...prev, image];
    });
  };

  const resetForm = () => {
    if (originalPost) {
      // Re-run the useEffect logic effectively
      setOriginalPost({ ...originalPost });
    }
  };

  const isFormValid = (() => {
    if (selectedPlatforms.length === 0) return false;

    const hasMedia = selectedImages.length > 0;
    const hasVideo = selectedImages.some((item) => item.isVideo);
    const hasImage = selectedImages.some((item) => !item.isVideo);
    const videoCount = selectedImages.filter((item) => item.isVideo).length;

    if (hasVideo && hasImage) return false;
    if (videoCount > 1) return false;

    for (const platform of selectedPlatforms) {
      switch (platform) {
        case "youtube":
          if (!hasVideo) return false;
          if (!youtubeTitle.trim()) return false;
          if (youtubeMadeForKids === null) return false;
          break;
        case "instagram":
          if (!hasMedia) return false;
          break;
        case "tiktok":
          if (!hasVideo) return false;
          if (!tiktokPrivacy) return false; // Basic check
          break;
        case "facebook":
          if (!hasMedia && !facebookText.trim() && !postText.trim()) return false;
          break;
        case "linkedin":
          if (!hasMedia && !linkedinText.trim() && !postText.trim()) return false;
          break;
        case "x":
          if (!hasMedia && !xText.trim() && !postText.trim()) return false;
          break;
      }
    }
    return true;
  })();

  const handleUpdatePost = async () => {
    if (!post || !channel?.id) return;
    setIsUpdating(true);
    setError(null);
    try {
      // Only partial validation here as isFormValid covers basics
      if (!isFormValid) throw new Error("Please check all required fields.");

      const updatedPost: Partial<Post> = {
        id: post.id,
        platforms: selectedPlatforms,
        message: postText,
        media: selectedImages,

        // Platform specific strings
        facebookText,
        instagramText,
        linkedinText,
        xText,

        // YouTube
        youtubeTitle,
        youtubeDisc,
        youtubeTags: youtubeTags.split(",").map(t => t.trim()).filter(Boolean),
        youtubePrivacy,
        youtubeMadeForKids: youtubeMadeForKids ?? false,
        youtubeCategory,

        // TikTok
        tiktokDescription,
        tiktokPrivacy,
        tiktokAllowComment,
        tiktokAllowDuet,
        tiktokAllowStitch,
        tiktokCommercialContent,
        tiktokBrandOrganic,
        tiktokBrandedContent,

        facebookVideoType,
      };

      await editPost(post.id as string, channel.id, updatedPost);

      // Send email notification
      try {
        await fetch("/api/notifications/post-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelId: channel.id,
            postId: post.id,
            postMessage: postText || "No text content",
            editorName: user?.name || user?.email || "Unknown Editor",
          }),
        });
      } catch (notifyError) {
        console.error("Failed to send edit notification:", notifyError);
        // Don't block the UI flow for notification failure
      }

      setIsOpen(false);
    } catch (error: any) {
      console.error("Error updating post:", error);
      setError(error.message || "Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = true; // Simplified for now, or implement deep comparison if strictly needed

  if (!isOpen || !post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-hidden dark:bg-secondDarkBackground dark:text-white">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
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
              <AlertTitle>Unable to update post</AlertTitle>
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${selectedPlatforms.includes("facebook")
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${selectedPlatforms.includes("instagram")
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${selectedPlatforms.includes("tiktok")
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${selectedPlatforms.includes("linkedin")
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${selectedPlatforms.includes("x")
                      ? "border-black bg-black text-white dark:bg-darkBorder"
                      : "border-stone-200 hover:border-stone-300"
                      }`}>
                    <FaXTwitter className="text-lg" />
                    <span className="text-sm">X</span>
                  </button>
                )}
                {channel?.socialMedia?.youtube && (
                  <button
                    onClick={() => handlePlatformToggle("youtube")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors dark:border-darkBorder ${selectedPlatforms.includes("youtube")
                      ? "border-red-600 bg-red-50 text-red-700 dark:bg-darkBorder"
                      : "border-stone-200 hover:border-stone-300"
                      }`}>
                    <FaYoutube className="text-lg text-red-600" />
                    <span className="text-sm">YouTube</span>
                  </button>
                )}
              </div>
            </div>

            {/* Post Content - Tabbed Interface */}
            <div className="space-y-3 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              {/* Tab Headers */}
              <div className="flex rounded-lg bg-stone-100 dark:bg-darkBorder p-1 overflow-x-auto">
                {selectedPlatforms.length === 0 && (
                  <div className="flex-1 px-3 py-2 text-sm font-medium text-stone-400 text-center">
                    Select a platform to start
                  </div>
                )}
                {selectedPlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => setActiveTab(platform as any)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap capitalize ${activeTab === platform
                      ? "bg-white dark:bg-darkButtons shadow-sm text-stone-900 dark:text-white"
                      : "text-stone-600 dark:text-white/70 hover:text-stone-900 dark:hover:text-white"
                      }`}
                  >
                    {platform === 'x' ? 'X Message' : platform}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {!activeTab && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                    General Post Content
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-white/60">
                    Content for platforms without specific tabs
                  </p>
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="What do you want to share?"
                    className="w-full px-3 py-3 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>
              )}

              {activeTab === "facebook" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">Facebook Post</h3>
                  <textarea
                    value={facebookText}
                    onChange={(e) => setFacebookText(e.target.value)}
                    placeholder="What do you want to share on Facebook?"
                    className="w-full px-3 py-3 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={4}
                    maxLength={2200}
                  />
                </div>
              )}

              {activeTab === "instagram" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">Instagram Caption</h3>
                  <textarea
                    value={instagramText}
                    onChange={(e) => setInstagramText(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full px-3 py-3 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={4}
                    maxLength={2200}
                  />
                </div>
              )}

              {activeTab === "linkedin" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">LinkedIn Post</h3>
                  <textarea
                    value={linkedinText}
                    onChange={(e) => setLinkedinText(e.target.value)}
                    placeholder="What do you want to share on LinkedIn?"
                    className="w-full px-3 py-3 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={4}
                    maxLength={3000}
                  />
                </div>
              )}

              {activeTab === "x" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">X Post</h3>
                  <textarea
                    value={xText}
                    onChange={(e) => setXText(e.target.value)}
                    placeholder="What do you want to share on X?"
                    className="w-full px-3 py-3 border dark:border-darkBorder dark:text-white dark:bg-darkButtons border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={4}
                    maxLength={280}
                  />
                  <div className="text-right text-xs text-stone-400 dark:text-white/50">{xText.length}/280</div>
                </div>
              )}

              {activeTab === "youtube" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">YouTube Details</h3>
                  <div className="space-y-2">
                    <Label className="text-xs text-stone-500 dark:text-white/60">Title <span className="text-red-500">*</span></Label>
                    <textarea value={youtubeTitle} onChange={(e) => setYoutubeTitle(e.target.value)} className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm dark:bg-darkButtons dark:border-darkBorder" rows={2} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-stone-500 dark:text-white/60">Description</Label>
                    <textarea value={youtubeDisc} onChange={(e) => setYoutubeDisc(e.target.value)} className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm dark:bg-darkButtons dark:border-darkBorder" rows={5} maxLength={5000} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-stone-500 dark:text-white/60">Visibility</Label>
                    <Select value={youtubePrivacy} onValueChange={setYoutubePrivacy}>
                      <SelectTrigger className="w-full dark:bg-darkButtons dark:border-darkBorder"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-stone-500 dark:text-white/60">Audience <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2"><input type="radio" checked={youtubeMadeForKids === true} onChange={() => setYoutubeMadeForKids(true)} /> Yes, for kids</label>
                      <label className="flex items-center gap-2"><input type="radio" checked={youtubeMadeForKids === false} onChange={() => setYoutubeMadeForKids(false)} /> No, not for kids</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "tiktok" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">TikTok Details</h3>
                  <div className="space-y-2">
                    <Label className="text-xs text-stone-500 dark:text-white/60">Description</Label>
                    <textarea value={tiktokDescription} onChange={(e) => setTiktokDescription(e.target.value)} className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm dark:bg-darkButtons dark:border-darkBorder" rows={3} maxLength={2200} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-stone-500 dark:text-white/60">Privacy <span className="text-red-500">*</span></Label>
                    <Select value={tiktokPrivacy} onValueChange={setTiktokPrivacy}>
                      <SelectTrigger className="w-full dark:bg-darkButtons dark:border-darkBorder"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC_TO_EVERYONE">Public</SelectItem>
                        <SelectItem value="MUTUAL_FOLLOW_FRIENDS">Friends</SelectItem>
                        <SelectItem value="SELF_ONLY">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-stone-500 dark:text-white/60">Interactions</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2"><Checkbox checked={tiktokAllowComment} onCheckedChange={(c) => setTiktokAllowComment(!!c)} /> Comment</label>
                      <label className="flex items-center gap-2"><Checkbox checked={tiktokAllowDuet} onCheckedChange={(c) => setTiktokAllowDuet(!!c)} /> Duet</label>
                      <label className="flex items-center gap-2"><Checkbox checked={tiktokAllowStitch} onCheckedChange={(c) => setTiktokAllowStitch(!!c)} /> Stitch</label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Media Section */}
            <div className="space-y-3 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                Media
              </h3>
              <div
                ref={container[0]}
                onClick={(e) => {
                  if (
                    e.target == container[0].current ||
                    e.target == container[1].current
                  ) {
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
          </div>

          {/* Right Column - Action Buttons */}
          <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <div className="space-y-4 p-4 border border-stone-200 dark:border-darkBorder rounded-lg">
              <h3 className="text-sm font-medium text-stone-700 dark:text-white/70">
                Actions
              </h3>

              {/* Reset Button */}
              <button
                onClick={resetForm}
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-stone-300 dark:border-darkBorder text-stone-700 dark:text-white/70 hover:bg-stone-50 dark:hover:bg-darkBorder rounded-lg transition-colors">
                <FiRefreshCcw className="w-4 h-4" />
                Reset Form
              </button>

              {/* Main Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleUpdatePost}
                  disabled={!isFormValid || !hasChanges || isUpdating}
                  className="w-full bg-violet-500 hover:bg-violet-600 dark:bg-violet-800 text-white font-medium py-3 px-4 rounded-lg disabled:bg-violet-300 dark:disabled:bg-secondDarkBackground dark:disabled:border dark:disabled:border-darkBorder dark:disabled:cursor-not-allowed transition-colors">
                  {isUpdating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </div>
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
                      className={`relative group cursor-pointer rounded-lg overflow-hidden ${selectedImages.some((img) => img.url === item.url)
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
                      className={`relative group cursor-pointer rounded-lg overflow-hidden ${selectedImages.some((img) => img.url === item.url)
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
}