import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

export const useCreatePost = (setOpen: (open: boolean) => void) => {
    const [step, setStep] = useState(1);
    const [isPosting, setIsPosting] = useState(false);
    const params = useParams();
    const collectionId = params.id as Id<"collection">;
    const createPost = useMutation(api.postFunctions.createPost);
    const { user } = useAuth();

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
    const [tiktokAllowComment, setTiktokAllowComment] = useState(false);
    const [tiktokAllowDuet, setTiktokAllowDuet] = useState(false);
    const [tiktokAllowStitch, setTiktokAllowStitch] = useState(false);
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
        setTiktokAllowComment(false);
        setTiktokAllowDuet(false);
        setTiktokAllowStitch(false);
        setTiktokCommercialContent(false);
        setTiktokBrandOrganic(false);
        setTiktokBrandedContent(false);
        setStep(1);
    };

    const handleNext = () => {
        if (step < 2) {
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

        try {
            await createPost({
                collectionId,
                platforms: selectedPlatforms,
                content: {
                    facebook: facebookText || undefined,
                    instagram: instagramText || undefined,
                    linkedin: linkedinText || undefined,
                    x: xText || undefined,
                    youtube: youtubeTitle ? { title: youtubeTitle, description: youtubeDisc } : undefined,
                    tiktok: tiktokTitle ? {
                        title: tiktokTitle,
                        description: tiktokDescription,
                        privacy: tiktokPrivacy,
                        allowComment: tiktokAllowComment,
                        allowDuet: tiktokAllowDuet,
                        allowStitch: tiktokAllowStitch,
                    } : undefined,
                },
                media: selectedImages.map(img => ({
                    url: img.url,
                    name: img.name,
                    isVideo: img.isVideo || false,
                })),
                scheduledDate: publishOption === "schedule" ? date : undefined,
                status: publishOption === "schedule" ? "scheduled" : "draft",
                createdBy: user?.id || "anonymous",
            });

            setIsPosting(false);
            resetForm();
            setOpen(false);
        } catch (error) {
            console.error("Failed to create post:", error);
            setIsPosting(false);
            alert("Failed to create post. Please try again.");
        }
    };

    const canProceed = () => {
        if (step === 1) return selectedPlatforms.length > 0;
        if (step === 2) return publishOption === "now" || (publishOption === "schedule" && date);
        return true;
    };

    return {
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
    };
};
