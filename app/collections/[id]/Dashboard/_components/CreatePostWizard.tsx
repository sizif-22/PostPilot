import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import {
    Step1PlatformSelect,
    Step2Content,
    Step3Media,
    Step4ScheduleReview,
} from "./WizardSteps";

interface CreatePostWizardProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

// Mock channel data
const mockChannel = {
    id: "mock-channel-1",
    socialMedia: {
        facebook: { connected: true },
        instagram: { connected: true },
        linkedin: { connected: true },
        x: { connected: true },
        youtube: { connected: true },
        tiktok: { username: "@mockuser", connected: true },
    },
};

// Mock media data
const mockMedia = [
    {
        url: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba",
        name: "image1.jpg",
        isVideo: false,
    },
    {
        url: "https://images.unsplash.com/photo-1682687221038-404cb8830901",
        name: "image2.jpg",
        isVideo: false,
    },
    {
        url: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538",
        name: "image3.jpg",
        isVideo: false,
    },
];

export const CreatePostWizard = ({ open, setOpen }: CreatePostWizardProps) => {
    const [step, setStep] = useState(1);
    const [isPosting, setIsPosting] = useState(false);

    // Platform selection
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"facebook" | "instagram" | "linkedin" | "x" | "youtube" | "tiktok" | null>(null);

    // Content state
    const [facebookText, setFacebookText] = useState("");
    const [instagramText, setInstagramText] = useState("");
    const [linkedinText, setLinkedinText] = useState("");
    const [xText, setXText] = useState("");
    const [youtubeTitle, setYoutubeTitle] = useState("");
    const [youtubeDisc, setYoutubeDisc] = useState("");

    // TikTok state
    const [tiktokTitle, setTiktokTitle] = useState("");
    const [tiktokDescription, setTiktokDescription] = useState("");
    const [tiktokPrivacy, setTiktokPrivacy] = useState<string>("PUBLIC_TO_EVERYONE");
    const [tiktokAllowComment, setTiktokAllowComment] = useState(true);
    const [tiktokAllowDuet, setTiktokAllowDuet] = useState(true);
    const [tiktokAllowStitch, setTiktokAllowStitch] = useState(true);
    const [tiktokCommercialContent, setTiktokCommercialContent] = useState(false);
    const [tiktokBrandOrganic, setTiktokBrandOrganic] = useState(false);
    const [tiktokBrandedContent, setTiktokBrandedContent] = useState(false);

    // Media state
    const [selectedImages, setSelectedImages] = useState<any[]>([]);
    const [facebookVideoType, setFacebookVideoType] = useState<"default" | "reel">("default");
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const [videoValidationErrors, setVideoValidationErrors] = useState<string[]>([]);

    // Schedule state
    const [publishOption, setPublishOption] = useState<"now" | "schedule">("now");
    const [date, setDate] = useState("");
    const [selectedTimeZone] = useState<string>(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    const [currentTime, setCurrentTime] = useState<string>("");

    // Mock TikTok creator info
    const tiktokCreatorInfo = {
        creator_nickname: "Mock User",
        privacy_level_options: ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY", "FOLLOWER_OF_CREATOR"],
        comment_disabled: false,
        duet_disabled: false,
        stitch_disabled: false,
    };

    // Update current time display
    useEffect(() => {
        const updateCurrentTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        };
        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 60000);
        return () => clearInterval(interval);
    }, []);

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

    const resetForm = () => {
        setXText("");
        setFacebookText("");
        setInstagramText("");
        setLinkedinText("");
        setSelectedImages([]);
        setSelectedPlatforms([]);
        setDate("");
        setPublishOption("now");
        setFacebookVideoType("default");
        setVideoDuration(null);
        setTiktokTitle("");
        setTiktokDescription("");
        setTiktokPrivacy("PUBLIC_TO_EVERYONE");
        setTiktokAllowComment(true);
        setTiktokAllowDuet(true);
        setTiktokAllowStitch(true);
        setTiktokCommercialContent(false);
        setTiktokBrandOrganic(false);
        setTiktokBrandedContent(false);
        setStep(1);
    };

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        setIsPosting(true);

        // Mock submission - just log the data
        console.log("Post data:", {
            platforms: selectedPlatforms,
            content: {
                facebook: facebookText,
                instagram: instagramText,
                linkedin: linkedinText,
                x: xText,
                youtube: { title: youtubeTitle, description: youtubeDisc },
                tiktok: {
                    title: tiktokTitle,
                    description: tiktokDescription,
                    privacy: tiktokPrivacy,
                    allowComment: tiktokAllowComment,
                    allowDuet: tiktokAllowDuet,
                    allowStitch: tiktokAllowStitch,
                },
            },
            media: selectedImages,
            schedule: publishOption === "now" ? "immediate" : date,
        });

        // Simulate API call
        setTimeout(() => {
            setIsPosting(false);
            resetForm();
            setOpen(false);
            alert("Post created successfully! (This is a UI demo)");
        }, 1500);
    };

    const canProceed = () => {
        if (step === 1) return selectedPlatforms.length > 0;
        if (step === 2) return true;
        if (step === 3) return true;
        if (step === 4) return publishOption === "now" || (publishOption === "schedule" && date);
        return true;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[900px] h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-start gap-4">
                        <DialogTitle className="text-xl font-semibold">Create Post</DialogTitle>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative bg-muted/10">
                    <div className="absolute inset-0 p-6 overflow-y-auto">
                        {step === 1 && (
                            <Step1PlatformSelect
                                channel={mockChannel}
                                selectedPlatforms={selectedPlatforms}
                                onTogglePlatform={handlePlatformToggle}
                            />
                        )}
                        {step === 2 && (
                            <Step2Content
                                selectedPlatforms={selectedPlatforms}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                facebookText={facebookText}
                                setFacebookText={setFacebookText}
                                instagramText={instagramText}
                                setInstagramText={setInstagramText}
                                linkedinText={linkedinText}
                                setLinkedinText={setLinkedinText}
                                xText={xText}
                                setXText={setXText}
                                youtubeTitle={youtubeTitle}
                                setYoutubeTitle={setYoutubeTitle}
                                youtubeDisc={youtubeDisc}
                                setYoutubeDisc={setYoutubeDisc}
                                tiktokTitle={tiktokTitle}
                                setTiktokTitle={setTiktokTitle}
                                tiktokDescription={tiktokDescription}
                                setTiktokDescription={setTiktokDescription}
                                tiktokPrivacy={tiktokPrivacy}
                                setTiktokPrivacy={setTiktokPrivacy}
                                tiktokAllowComment={tiktokAllowComment}
                                setTiktokAllowComment={setTiktokAllowComment}
                                tiktokAllowDuet={tiktokAllowDuet}
                                setTiktokAllowDuet={setTiktokAllowDuet}
                                tiktokAllowStitch={tiktokAllowStitch}
                                setTiktokAllowStitch={setTiktokAllowStitch}
                                tiktokCommercialContent={tiktokCommercialContent}
                                setTiktokCommercialContent={setTiktokCommercialContent}
                                tiktokBrandOrganic={tiktokBrandOrganic}
                                setTiktokBrandOrganic={setTiktokBrandOrganic}
                                tiktokBrandedContent={tiktokBrandedContent}
                                setTiktokBrandedContent={setTiktokBrandedContent}
                                tiktokCreatorInfo={tiktokCreatorInfo}
                                tiktokLoading={false}
                                selectedImages={selectedImages}
                            />
                        )}
                        {step === 3 && (
                            <Step3Media
                                media={mockMedia}
                                selectedImages={selectedImages}
                                setSelectedImages={setSelectedImages}
                                selectedPlatforms={selectedPlatforms}
                                facebookVideoType={facebookVideoType}
                                setFacebookVideoType={setFacebookVideoType}
                                videoDuration={videoDuration}
                                videoValidationErrors={videoValidationErrors}
                            />
                        )}
                        {step === 4 && (
                            <Step4ScheduleReview
                                publishOption={publishOption}
                                setPublishOption={setPublishOption}
                                date={date}
                                setDate={setDate}
                                selectedTimeZone={selectedTimeZone}
                                currentTime={currentTime}
                                selectedPlatforms={selectedPlatforms}
                                selectedImages={selectedImages}
                                facebookText={facebookText}
                                instagramText={instagramText}
                                linkedinText={linkedinText}
                                xText={xText}
                            />
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t bg-background z-10 flex justify-between items-center">
                    <Button variant="ghost" onClick={handleBack} disabled={step === 1 || isPosting}>
                        <FiArrowLeft className="mr-2" /> Back
                    </Button>

                    {step < 4 ? (
                        <Button onClick={handleNext} disabled={!canProceed() || isPosting}>
                            Next <FiArrowRight className="ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={!canProceed() || isPosting}>
                            {isPosting ? "Publishing..." : "Publish Post"} <FiCheck className="ml-2" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
