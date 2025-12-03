import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ContentEditorProps {
    selectedPlatforms: string[];
    activeTab: string | null;
    setActiveTab: (tab: any) => void;
    facebookText: string;
    setFacebookText: (text: string) => void;
    instagramText: string;
    setInstagramText: (text: string) => void;
    linkedinText: string;
    setLinkedinText: (text: string) => void;
    xText: string;
    setXText: (text: string) => void;
    youtubeTitle: string;
    setYoutubeTitle: (text: string) => void;
    youtubeDisc: string;
    setYoutubeDisc: (text: string) => void;
    tiktokTitle: string;
    setTiktokTitle: (text: string) => void;
    tiktokDescription: string;
    setTiktokDescription: (text: string) => void;
    tiktokPrivacy: string;
    setTiktokPrivacy: (val: string) => void;
    tiktokAllowComment: boolean;
    setTiktokAllowComment: (val: boolean) => void;
    tiktokAllowDuet: boolean;
    setTiktokAllowDuet: (val: boolean) => void;
    tiktokAllowStitch: boolean;
    setTiktokAllowStitch: (val: boolean) => void;
    tiktokCreatorInfo: any;
    tiktokLoading: boolean;
}

export const ContentEditor = ({
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
    tiktokCreatorInfo,
    tiktokLoading,
}: ContentEditorProps) => {
    if (selectedPlatforms.length === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium">2. Add Content</h4>

            {/* Mobile: Dropdown */}
            <div className="sm:hidden">
                <Select value={activeTab || ""} onValueChange={(value) => setActiveTab(value as any)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select platform to edit" />
                    </SelectTrigger>
                    <SelectContent>
                        {selectedPlatforms.includes("facebook") && <SelectItem value="facebook">Facebook</SelectItem>}
                        {selectedPlatforms.includes("instagram") && <SelectItem value="instagram">Instagram</SelectItem>}
                        {selectedPlatforms.includes("linkedin") && <SelectItem value="linkedin">LinkedIn</SelectItem>}
                        {selectedPlatforms.includes("x") && <SelectItem value="x">X</SelectItem>}
                        {selectedPlatforms.includes("youtube") && <SelectItem value="youtube">YouTube</SelectItem>}
                        {selectedPlatforms.includes("tiktok") && <SelectItem value="tiktok">TikTok</SelectItem>}
                    </SelectContent>
                </Select>
            </div>

            {/* Desktop: Tabs */}
            <div className="hidden sm:flex rounded-lg bg-muted p-1 overflow-x-auto">
                {selectedPlatforms.includes("facebook") && (
                    <button
                        onClick={() => setActiveTab("facebook")}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "facebook" ? "bg-background shadow-sm" : "hover:text-foreground"}`}
                    >
                        Facebook
                    </button>
                )}
                {selectedPlatforms.includes("instagram") && (
                    <button
                        onClick={() => setActiveTab("instagram")}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "instagram" ? "bg-background shadow-sm" : "hover:text-foreground"}`}
                    >
                        Instagram
                    </button>
                )}
                {selectedPlatforms.includes("linkedin") && (
                    <button
                        onClick={() => setActiveTab("linkedin")}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "linkedin" ? "bg-background shadow-sm" : "hover:text-foreground"}`}
                    >
                        LinkedIn
                    </button>
                )}
                {selectedPlatforms.includes("x") && (
                    <button
                        onClick={() => setActiveTab("x")}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "x" ? "bg-background shadow-sm" : "hover:text-foreground"}`}
                    >
                        X
                    </button>
                )}
                {selectedPlatforms.includes("youtube") && (
                    <button
                        onClick={() => setActiveTab("youtube")}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "youtube" ? "bg-background shadow-sm" : "hover:text-foreground"}`}
                    >
                        YouTube
                    </button>
                )}
                {selectedPlatforms.includes("tiktok") && (
                    <button
                        onClick={() => setActiveTab("tiktok")}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === "tiktok" ? "bg-background shadow-sm" : "hover:text-foreground"}`}
                    >
                        TikTok
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px] p-4 border rounded-lg bg-background">
                {!activeTab && (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-[120px] w-full" />
                    </div>
                )}

                {activeTab === "facebook" && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">Facebook Post</h3>
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
                                    <SelectItem value="PUBLIC_TO_EVERYONE">Public to Everyone</SelectItem>
                                    <SelectItem value="MUTUAL_FOLLOW_FRIENDS">Mutual Follow Friends</SelectItem>
                                    <SelectItem value="SELF_ONLY">Self Only</SelectItem>
                                    <SelectItem value="FOLLOWER_OF_CREATOR">Follower of Creator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Label className="text-xs font-medium text-muted-foreground">Interaction Settings</Label>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="tiktok-comments" className="text-sm">Allow Comments</Label>
                                <Switch
                                    id="tiktok-comments"
                                    checked={tiktokAllowComment}
                                    onCheckedChange={setTiktokAllowComment}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="tiktok-duet" className="text-sm">Allow Duet</Label>
                                <Switch
                                    id="tiktok-duet"
                                    checked={tiktokAllowDuet}
                                    onCheckedChange={setTiktokAllowDuet}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="tiktok-stitch" className="text-sm">Allow Stitch</Label>
                                <Switch
                                    id="tiktok-stitch"
                                    checked={tiktokAllowStitch}
                                    onCheckedChange={setTiktokAllowStitch}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
