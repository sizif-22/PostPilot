import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { useCreatePost } from "./wizard/useCreatePost";
import { PlatformSelector } from "./wizard/PlatformSelector";
import { ContentEditor } from "./wizard/ContentEditor";
import { MediaUploader } from "./wizard/MediaUploader";
import { ScheduleReview } from "./wizard/ScheduleReview";

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
    const {
        step,
        isPosting,
        selectedPlatforms,
        activeTab,
        setActiveTab,
        facebookText, setFacebookText,
        instagramText, setInstagramText,
        linkedinText, setLinkedinText,
        xText, setXText,
        youtubeTitle, setYoutubeTitle,
        youtubeDisc, setYoutubeDisc,
        tiktokTitle, setTiktokTitle,
        tiktokDescription, setTiktokDescription,
        tiktokPrivacy, setTiktokPrivacy,
        tiktokAllowComment, setTiktokAllowComment,
        tiktokAllowDuet, setTiktokAllowDuet,
        tiktokAllowStitch, setTiktokAllowStitch,
        tiktokCommercialContent, setTiktokCommercialContent,
        tiktokBrandOrganic, setTiktokBrandOrganic,
        tiktokBrandedContent, setTiktokBrandedContent,
        selectedImages, setSelectedImages,
        facebookVideoType, setFacebookVideoType,
        videoDuration, setVideoDuration,
        videoValidationErrors, setVideoValidationErrors,
        publishOption, setPublishOption,
        date, setDate,
        selectedTimeZone,
        currentTime,
        handlePlatformToggle,
        handleNext,
        handleBack,
        handleSubmit,
        canProceed,
    } = useCreatePost(setOpen);

    // Mock TikTok creator info
    const tiktokCreatorInfo = {
        creator_nickname: "Mock User",
        privacy_level_options: ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY", "FOLLOWER_OF_CREATOR"],
        comment_disabled: false,
        duet_disabled: false,
        stitch_disabled: false,
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[900px] h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-start gap-4">
                        <DialogTitle className="text-xl font-semibold">Create Post</DialogTitle>
                        <div className="flex gap-1">
                            {[1, 2].map((i) => (
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
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-medium">Create Your Post</h3>
                                    <p className="text-sm text-muted-foreground">Select platforms, add content, and choose media</p>
                                </div>

                                <PlatformSelector
                                    channel={mockChannel}
                                    selectedPlatforms={selectedPlatforms}
                                    onTogglePlatform={handlePlatformToggle}
                                />

                                <ContentEditor
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
                                    tiktokCreatorInfo={tiktokCreatorInfo}
                                    tiktokLoading={false}
                                />

                                <MediaUploader
                                    media={mockMedia}
                                    selectedImages={selectedImages}
                                    setSelectedImages={setSelectedImages}
                                />
                            </div>
                        )}
                        {step === 2 && (
                            <ScheduleReview
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

                    {step < 2 ? (
                        <Button onClick={handleNext} disabled={!canProceed() || isPosting}>
                            Next <FiArrowLeft className="ml-2 rotate-180" />
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
