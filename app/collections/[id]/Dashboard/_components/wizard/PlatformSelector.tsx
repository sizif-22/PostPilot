import React from "react";
import {
    FiFacebook,
    FiInstagram,
    FiX,
} from "react-icons/fi";
import { FaTiktok, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";

interface PlatformSelectorProps {
    channel: any;
    selectedPlatforms: string[];
    onTogglePlatform: (platformId: string) => void;
}

export const PlatformSelector = ({
    channel,
    selectedPlatforms,
    onTogglePlatform,
}: PlatformSelectorProps) => {
    const platforms = [
        { id: "facebook", name: "Facebook", icon: FiFacebook, color: "text-blue-600", available: channel?.socialMedia?.facebook },
        { id: "instagram", name: "Instagram", icon: FiInstagram, color: "text-pink-600", available: channel?.socialMedia?.instagram },
        { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "text-foreground", available: channel?.socialMedia?.tiktok },
        { id: "youtube", name: "YouTube", icon: FaYoutube, color: "text-red-600", available: channel?.socialMedia?.youtube },
        { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, color: "text-blue-700", available: channel?.socialMedia?.linkedin },
        { id: "x", name: "X", icon: FaXTwitter, color: "text-foreground", available: channel?.socialMedia?.x },
    ];

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium">1. Select Platforms</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {platforms.filter(p => p.available).map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                        <div
                            key={platform.id}
                            onClick={() => onTogglePlatform(platform.id)}
                            className={`cursor-pointer relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${isSelected
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50"
                                }`}
                        >
                            <platform.icon className={`w-5 h-5 mb-1 ${platform.color}`} />
                            <span className="text-xs font-medium">{platform.name}</span>
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <FiX className="w-2.5 h-2.5 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
