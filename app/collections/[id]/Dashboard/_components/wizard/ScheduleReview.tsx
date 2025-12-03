import React from "react";
import { FiClock } from "react-icons/fi";

interface ScheduleReviewProps {
    publishOption: "now" | "schedule";
    setPublishOption: (option: "now" | "schedule") => void;
    date: string;
    setDate: (date: string) => void;
    selectedTimeZone: string;
    currentTime: string;
    selectedPlatforms: string[];
    selectedImages: any[];
    facebookText: string;
    instagramText: string;
    linkedinText: string;
    xText: string;
}

export const ScheduleReview = ({
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
}: ScheduleReviewProps) => {
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
