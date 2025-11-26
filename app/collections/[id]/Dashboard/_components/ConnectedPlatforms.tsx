import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiFacebook, FiInstagram } from "react-icons/fi";
import { FaTiktok, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";

const platforms = [
    { id: "facebook", name: "Facebook", icon: FiFacebook, color: "text-blue-600", connected: true, username: "@yourpage" },
    { id: "instagram", name: "Instagram", icon: FiInstagram, color: "text-pink-600", connected: true, username: "@yourhandle" },
    { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "text-foreground", connected: true, username: "@youruser" },
    { id: "youtube", name: "YouTube", icon: FaYoutube, color: "text-red-600", connected: false },
    { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, color: "text-blue-700", connected: false },
    { id: "x", name: "X", icon: FaXTwitter, color: "text-foreground", connected: false },
];

export const ConnectedPlatforms = () => {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg">Connected Platforms</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                {/* Mobile: Horizontal Scroll */}
                <div className="md:hidden flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                    {platforms.map((platform) => (
                        <div
                            key={platform.id}
                            className={`flex-shrink-0 w-[140px] p-3 border rounded-lg bg-car ${platform.connected && "border-green-500 border-2"}`}
                        >
                            <div className="flex flex-col items-center gap-2 text-center">
                                <platform.icon className={`w-8 h-8 ${platform.color}`} />
                                <div className="w-full">
                                    <p className="text-xs font-medium truncate">{platform.name}</p>
                                    {platform.connected ? (
                                        <>
                                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                {platform.username}
                                            </p>
                                            <Badge variant="secondary" className="mt-1.5 text-[10px] h-5">
                                                Connected
                                            </Badge>
                                        </>
                                    ) : (
                                        <Badge variant="outline" className="mt-1.5 text-[10px] h-5">
                                            Not Connected
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop: Grid */}
                <div className="hidden md:grid grid-cols-2 gap-3 p-2">
                    {platforms.map((platform) => (
                        <div
                            key={platform.id}
                            className={`p-4 border rounded-lg ${platform.connected && "border-white border-2"}hover:bg-muted/50 transition-colors`}
                        >
                            <div className="flex items-center gap-3">
                                <platform.icon className={`w-6 h-6 ${platform.color}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{platform.name}</p>
                                    {platform.connected ? (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {platform.username}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Not connected</p>
                                    )}
                                </div>
                                {/* {platform.connected && (
                                    <Badge variant="default" className="text-xs size-2 bg-green-500"></Badge>
                                )} */}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
