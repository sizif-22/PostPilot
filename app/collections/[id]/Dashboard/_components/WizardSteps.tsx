import React, { useState, useRef } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FiFacebook,
    FiInstagram,
    FiImage,
    FiUpload,
    FiClock,
    FiCalendar,
    FiEdit2,
    FiX,
} from "react-icons/fi";
import { FaTiktok, FaLinkedin, FaXTwitter, FaYoutube, FaPlay } from "react-icons/fa6";

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

const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => resolve(0);
    });
};

// Step 1: Platform Selection
export const Step1PlatformSelect = ({
    channel,
    selectedPlatforms,
    onTogglePlatform,
}: {
    channel: any;
    selectedPlatforms: string[];
    onTogglePlatform: (id: string) => void;
}) => {
    const platforms = [
        { id: "facebook", name: "Facebook", icon: FiFacebook, color: "text-blue-600", available: channel?.socialMedia?.facebook },
        { id: "instagram", name: "Instagram", icon: FiInstagram, color: "text-pink-600", available: channel?.socialMedia?.instagram },
        { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "text-foreground", available: channel?.socialMedia?.tiktok },
        { id: "youtube", name: "YouTube", icon: FaYoutube, color: "text-red-600", available: channel?.socialMedia?.youtube },
        { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, color: "text-blue-700", available: channel?.socialMedia?.linkedin },
        { id: "x", name: "X", icon: FaXTwitter, color: "text-foreground", available: channel?.socialMedia?.x },
    ];

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Select Platforms</h3>
                <p className="text-sm text-muted-foreground">Choose where you want to publish your post</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {platforms.filter(p => p.available).map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                        <div
                            key={platform.id}
                            onClick={() => onTogglePlatform(platform.id)}
                            className={`cursor-pointer relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${isSelected
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50"
                                }`}
                        >
                            <platform.icon className={`w-8 h-8 mb-3 ${platform.color}`} />
                            <span className="text-sm font-medium">{platform.name}</span>
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <FiX className="w-3 h-3 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Step 2: Content
export const Step2Content = ({
    selectedPlatforms,
    activeTab,
    setActiveTab,
    facebookText,
    setFacebookText,
    instagramText,
    setInstagramText,
    linkedinText,
    setLinkedinText,
    xText,
    setXText,
    youtubeTitle,
    setYoutubeTitle,
    youtubeDisc,
    setYoutubeDisc,
    tiktokTitle,
    setTiktokTitle,
    tiktokDescription,
    setTiktokDescription,
    tiktokPrivacy,
    setTiktokPrivacy,
    tiktokAllowComment,
    setTiktokAllowComment,
    tiktokAllowDuet,
    setTiktokAllowDuet,
    tiktokAllowStitch,
    setTiktokAllowStitch,
    tiktokCommercialContent,
    setTiktokCommercialContent,
    tiktokBrandOrganic,
    setTiktokBrandOrganic,
    tiktokBrandedContent,
    setTiktokBrandedContent,
    tiktokCreatorInfo,
    tiktokLoading,
    selectedImages,
}: any) => {
    return (
        <div className="space-y-4">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Create Content</h3>
                <p className="text-sm text-muted-foreground">Customize your message for each platform</p>
            </div>

            {/* Platform Selector - Dropdown on mobile, Tabs on desktop */}
            {selectedPlatforms.length === 0 ? (
                <div className="flex rounded-lg bg-muted p-1">
                    <div className="flex-1 px-3 py-2 text-sm font-medium text-muted-foreground text-center">
                        Select a platform to start
                    </div>
                </div>
            ) : (
                <>
                    {/* Mobile: Dropdown */}
                    <div className="sm:hidden">
                        <Select value={activeTab || ""} onValueChange={(value) => setActiveTab(value as any)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select platform to edit" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedPlatforms.includes("facebook") && (
                                    <SelectItem value="facebook">
                                        <div className="flex items-center gap-2">
                                            <FiFacebook className="w-4 h-4" />
                                            <span>Facebook</span>
                                        </div>
                                    </SelectItem>
                                )}
                                {selectedPlatforms.includes("instagram") && (
                                    <SelectItem value="instagram">
                                        <div className="flex items-center gap-2">
                                            <FiInstagram className="w-4 h-4" />
                                            <span>Instagram</span>
                                        </div>
                                    </SelectItem>
                                )}
                                {selectedPlatforms.includes("linkedin") && (
                                    <SelectItem value="linkedin">
                                        <div className="flex items-center gap-2">
                                            <FaLinkedin className="w-4 h-4" />
                                            <span>LinkedIn</span>
                                        </div>
                                    </SelectItem>
                                )}
                                {selectedPlatforms.includes("x") && (
                                    <SelectItem value="x">
                                        <div className="flex items-center gap-2">
                                            <FaXTwitter className="w-4 h-4" />
                                            <span>X</span>
                                        </div>
                                    </SelectItem>
                                )}
                                {selectedPlatforms.includes("youtube") && (
                                    <SelectItem value="youtube">
                                        <div className="flex items-center gap-2">
                                            <FaYoutube className="w-4 h-4" />
                                            <span>YouTube</span>
                                        </div>
                                    </SelectItem>
                                )}
                                {selectedPlatforms.includes("tiktok") && (
                                    <SelectItem value="tiktok">
                                        <div className="flex items-center gap-2">
                                            <FaTiktok className="w-4 h-4" />
                                            <span>TikTok</span>
                                        </div>
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Desktop: Tabs */}
                    <div className="hidden sm:flex rounded-lg bg-muted p-1 overflow-x-auto">
                        {selectedPlatforms.includes("facebook") && (
                            <button
                                onClick={() => setActiveTab("facebook")}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "facebook"
                                        ? "bg-background shadow-sm"
                                        : "hover:text-foreground"
                                    }`}
                            >
                                Facebook
                            </button>
                        )}
                        {selectedPlatforms.includes("instagram") && (
                            <button
                                onClick={() => setActiveTab("instagram")}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "instagram"
                                        ? "bg-background shadow-sm"
                                        : "hover:text-foreground"
                                    }`}
                            >
                                Instagram
                            </button>
                        )}
                        {selectedPlatforms.includes("linkedin") && (
                            <button
                                onClick={() => setActiveTab("linkedin")}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "linkedin"
                                        ? "bg-background shadow-sm"
                                        : "hover:text-foreground"
                                    }`}
                            >
                                LinkedIn
                            </button>
                        )}
                        {selectedPlatforms.includes("x") && (
                            <button
                                onClick={() => setActiveTab("x")}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "x"
                                        ? "bg-background shadow-sm"
                                        : "hover:text-foreground"
                                    }`}
                            >
                                X
                            </button>
                        )}
                        {selectedPlatforms.includes("youtube") && (
                            <button
                                onClick={() => setActiveTab("youtube")}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "youtube"
                                        ? "bg-background shadow-sm"
                                        : "hover:text-foreground"
                                    }`}
                            >
                                YouTube
                            </button>
                        )}
                        {selectedPlatforms.includes("tiktok") && (
                            <button
                                onClick={() => setActiveTab("tiktok")}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "tiktok"
                                        ? "bg-background shadow-sm"
                                        : "hover:text-foreground"
                                    }`}
                            >
                                TikTok
                            </button>
                        )}
                    </div>
                </>
            )}
            {/* Tab Content */}
            <div className="min-h-[300px]">
                {!activeTab && (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-[120px] w-full" />
                    </div>
                )}

                {activeTab === "facebook" && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">Facebook Post</h3>
                        <p className="text-xs text-muted-foreground">Write your message for Facebook</p>
                        <textarea
                            value={facebookText}
                            onChange={(e) => setFacebookText(e.target.value)}
                            placeholder="What do you want to share on Facebook?"
                            className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            rows={4}
                            maxLength={2200}
                        />
                        <div className="text-right text-xs text-muted-foreground">
                            {facebookText.length} / 2200
                        </div>
                    </div>
                )}

                {activeTab === "instagram" && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">Instagram Caption</h3>
                        <p className="text-xs text-muted-foreground">Write your caption for Instagram</p>
                        <textarea
                            value={instagramText}
                            onChange={(e) => setInstagramText(e.target.value)}
                            placeholder="Write a caption..."
                            className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            rows={4}
                            maxLength={2200}
                        />
                        <div className="text-right text-xs text-muted-foreground">
                            {instagramText.length} / 2200
                        </div>
                    </div>
                )}

                {activeTab === "linkedin" && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">LinkedIn Post</h3>
                        <p className="text-xs text-muted-foreground">Write your message for LinkedIn</p>
                        <textarea
                            value={linkedinText}
                            onChange={(e) => setLinkedinText(e.target.value)}
                            placeholder="What do you want to share on LinkedIn?"
                            className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            rows={4}
                            maxLength={3000}
                        />
                        <div className="text-right text-xs text-muted-foreground">
                            {linkedinText.length} / 3000
                        </div>
                    </div>
                )}

                {activeTab === "x" && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">X Post</h3>
                        <p className="text-xs text-muted-foreground">Special text for X post</p>
                        <textarea
                            value={xText}
                            onChange={(e) => setXText(e.target.value)}
                            placeholder="What do you want to share on X?"
                            className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            rows={4}
                            maxLength={280}
                        />
                        <div className="text-right text-xs text-muted-foreground">
                            {xText.length} / 280
                        </div>
                    </div>
                )}

                {activeTab === "youtube" && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">YouTube Post</h3>
                        <p className="text-xs text-muted-foreground">Title:</p>
                        <textarea
                            value={youtubeTitle}
                            onChange={(e) => setYoutubeTitle(e.target.value)}
                            placeholder="Your Title?"
                            className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            rows={1}
                            maxLength={280}
                        />
                        <p className="text-xs text-muted-foreground">Description:</p>
                        <textarea
                            value={youtubeDisc}
                            onChange={(e) => setYoutubeDisc(e.target.value)}
                            placeholder="Description?"
                            className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            rows={4}
                            maxLength={280}
                        />
                    </div>
                )}

                {activeTab === "tiktok" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">TikTok Post Details</h3>
                            {tiktokLoading && <span className="text-xs text-muted-foreground">Loading info...</span>}
                            {!tiktokLoading && tiktokCreatorInfo && (
                                <span className="text-xs text-muted-foreground">
                                    Posting as: <span className="font-semibold">{tiktokCreatorInfo.creator_nickname || "Unknown"}</span>
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Title (Optional)</Label>
                            <textarea
                                value={tiktokTitle}
                                onChange={(e) => setTiktokTitle(e.target.value)}
                                placeholder="Enter video title..."
                                className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                                rows={1}
                                maxLength={150}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Description (Optional)</Label>
                            <textarea
                                value={tiktokDescription}
                                onChange={(e) => setTiktokDescription(e.target.value)}
                                placeholder="Enter video description..."
                                className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                                rows={3}
                                maxLength={2200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                                Privacy Status <span className="text-red-500">*</span>
                            </Label>
                            <Select value={tiktokPrivacy} onValueChange={setTiktokPrivacy}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select privacy level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiktokCreatorInfo?.privacy_level_options?.map((option: string) => (
                                        <SelectItem key={option} value={option}>
                                            {option.replace(/_/g, " ")}
                                        </SelectItem>
                                    )) || (
                                            <>
                                                <SelectItem value="PUBLIC_TO_EVERYONE">Public to Everyone</SelectItem>
                                                <SelectItem value="MUTUAL_FOLLOW_FRIENDS">Mutual Follow Friends</SelectItem>
                                                <SelectItem value="SELF_ONLY" disabled={tiktokBrandedContent}>
                                                    Self Only {tiktokBrandedContent && "(Disabled for Branded Content)"}
                                                </SelectItem>
                                                <SelectItem value="FOLLOWER_OF_CREATOR">Follower of Creator</SelectItem>
                                            </>
                                        )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Allow Interactions</Label>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="allow-comment"
                                        checked={tiktokAllowComment}
                                        onCheckedChange={(checked) => setTiktokAllowComment(checked as boolean)}
                                        disabled={tiktokCreatorInfo?.comment_disabled}
                                    />
                                    <label htmlFor="allow-comment" className="text-sm">Comment</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="allow-duet"
                                        checked={tiktokAllowDuet}
                                        onCheckedChange={(checked) => setTiktokAllowDuet(checked as boolean)}
                                        disabled={tiktokCreatorInfo?.duet_disabled || (selectedImages.length > 0 && !selectedImages[0].isVideo)}
                                    />
                                    <label htmlFor="allow-duet" className="text-sm">Duet</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="allow-stitch"
                                        checked={tiktokAllowStitch}
                                        onCheckedChange={(checked) => setTiktokAllowStitch(checked as boolean)}
                                        disabled={tiktokCreatorInfo?.stitch_disabled || (selectedImages.length > 0 && !selectedImages[0].isVideo)}
                                    />
                                    <label htmlFor="allow-stitch" className="text-sm">Stitch</label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="commercial-content"
                                    checked={tiktokCommercialContent}
                                    onCheckedChange={(checked) => {
                                        setTiktokCommercialContent(checked as boolean);
                                        if (!checked) {
                                            setTiktokBrandOrganic(false);
                                            setTiktokBrandedContent(false);
                                        }
                                    }}
                                />
                                <label htmlFor="commercial-content" className="text-sm font-medium">
                                    Disclose Commercial Content
                                </label>
                            </div>

                            {tiktokCommercialContent && (
                                <div className="pl-6 space-y-3">
                                    <p className="text-xs text-muted-foreground">
                                        You need to indicate if your content promotes yourself, a third party, or both.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="your-brand"
                                                checked={tiktokBrandOrganic}
                                                onCheckedChange={(checked) => setTiktokBrandOrganic(checked as boolean)}
                                            />
                                            <label htmlFor="your-brand" className="text-sm">Your Brand</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="branded-content"
                                                checked={tiktokBrandedContent}
                                                onCheckedChange={(checked) => {
                                                    const isChecked = checked as boolean;
                                                    setTiktokBrandedContent(isChecked);
                                                    if (isChecked && tiktokPrivacy === "SELF_ONLY") {
                                                        setTiktokPrivacy("PUBLIC_TO_EVERYONE");
                                                    }
                                                }}
                                            />
                                            <label htmlFor="branded-content" className="text-sm">Branded Content</label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Step 3: Media
export const Step3Media = ({
    media,
    selectedImages,
    setSelectedImages,
    selectedPlatforms,
    facebookVideoType,
    setFacebookVideoType,
    videoDuration,
    videoValidationErrors,
}: any) => {
    const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
    const container = [useRef(null), useRef(null)];

    const handleImageSelect = (image: any) => {
        const isSelected = selectedImages.some((img: any) => img.url === image.url);
        if (isSelected) {
            setSelectedImages((prev: any[]) => prev.filter((img) => img.url !== image.url));
        } else {
            setSelectedImages((prev: any[]) => [...prev, image]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Add Media</h3>
                <p className="text-sm text-muted-foreground">Upload images or videos for your post (optional)</p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {selectedImages.filter((item: any) => item.isVideo).length > 1 && (
                        <>
                            <span className="text-orange-500">⚠</span>
                            <span className="text-orange-600">Max 1 video</span>
                        </>
                    )}
                    {selectedImages.find((item: any) => item.isVideo) &&
                        selectedImages.find((item: any) => !item.isVideo) && (
                            <>
                                <span className="text-orange-500">⚠</span>
                                <span className="text-orange-600">Cannot mix videos and images</span>
                            </>
                        )}
                </div>

                <div
                    ref={container[0]}
                    onClick={(e) => {
                        if (e.target == container[0].current || e.target == container[1].current) {
                            setIsMediaDialogOpen(true);
                        }
                    }}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                    {selectedImages.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 mt-4" ref={container[1]}>
                            {selectedImages.map((item: any) => (
                                <div key={item.url} className="relative group">
                                    <div className="w-full aspect-square rounded-lg overflow-hidden">
                                        <Image
                                            src={item.url}
                                            alt={item.name}
                                            width={100}
                                            height={100}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleImageSelect(item);
                                        }}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div onClick={() => setIsMediaDialogOpen(true)}>
                            <FiUpload className="mx-auto mb-3 w-8 h-8 text-muted-foreground" />
                            <p className="text-sm font-medium">Click to choose from your media</p>
                            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <FiImage className="w-4 h-4" />
                                    <span>Images and videos supported</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Facebook Video Type */}
            {selectedPlatforms.includes("facebook") &&
                selectedImages.length === 1 &&
                selectedImages[0].isVideo && (
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium mb-3">Facebook Video Type</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                                checked={facebookVideoType === "reel"}
                                onCheckedChange={(checked: boolean) =>
                                    setFacebookVideoType(checked ? "reel" : "default")
                                }
                            />
                            <div className="flex-1">
                                <span className="text-sm font-medium">
                                    Post as <strong>Reel</strong>
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">Uncheck for regular video post</p>
                            </div>
                        </label>
                    </div>
                )}

            {/* Media Selection Dialog */}
            <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Select Media</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                        <div className="grid grid-cols-4 gap-4 p-2">
                            {media.map((item: any) => (
                                <div
                                    key={item.url}
                                    className={`relative group cursor-pointer rounded-lg overflow-hidden ${selectedImages.some((img: any) => img.url === item.url)
                                        ? "ring-2 ring-primary"
                                        : ""
                                        }`}
                                    onClick={() => handleImageSelect(item)}
                                >
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
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Step 4: Schedule & Review
export const Step4ScheduleReview = ({
    publishOption,
    setPublishOption,
    date,
    setDate,
    selectedTimeZone,
    currentTime,
    selectedPlatforms,
    selectedImages,
    facebookText,
    instagramText,
    linkedinText,
    xText,
}: any) => {
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

    // Get minimum datetime (3 minutes from now)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 3);
        return now.toISOString().slice(0, 16);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Schedule & Review</h3>
                <p className="text-sm text-muted-foreground">Choose when to publish your post</p>
            </div>

            {/* Publishing Options */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <input
                        type="radio"
                        name="publishOption"
                        value="now"
                        checked={publishOption === "now"}
                        onChange={(e) => setPublishOption(e.target.value as "now" | "schedule")}
                        className="text-primary focus:ring-primary"
                    />
                    <div>
                        <span className="text-sm font-medium">Publish now</span>
                        <p className="text-xs text-muted-foreground">Post immediately</p>
                    </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <input
                        type="radio"
                        name="publishOption"
                        value="schedule"
                        checked={publishOption === "schedule"}
                        onChange={(e) => setPublishOption(e.target.value as "now" | "schedule")}
                        className="text-primary focus:ring-primary"
                    />
                    <div>
                        <span className="text-sm font-medium">Schedule for later</span>
                        <p className="text-xs text-muted-foreground">Choose a specific date and time</p>
                    </div>
                </label>
            </div>

            {/* Scheduling Controls */}
            {publishOption === "schedule" && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FiClock className="w-4 h-4" />
                        <span>Current time: {currentTime}</span>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Schedule Date & Time</label>
                        <input
                            type="datetime-local"
                            min={getMinDateTime()}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    {date && (
                        <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <strong>Scheduled for:</strong> {formatScheduledDateTime()} ({selectedTimeZone})
                        </div>
                    )}
                </div>
            )}

            {/* Review Summary */}
            <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-4">Post Summary</h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b">
                        <span className="text-muted-foreground">Platforms</span>
                        <span className="font-medium">
                            {selectedPlatforms.length > 0 ? selectedPlatforms.join(", ") : "None selected"}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b">
                        <span className="text-muted-foreground">Media</span>
                        <span className="font-medium">{selectedImages.length} file(s)</span>
                    </div>
                    <div className="flex justify-between text-sm py-2">
                        <span className="text-muted-foreground">Schedule</span>
                        <span className="font-medium text-primary">
                            {publishOption === "now" ? "Immediately" : date || "Pending..."}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
