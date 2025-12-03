import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { FaTiktok } from "react-icons/fa6";

const platforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, connected: true, username: "@yourpage" },
    { id: "instagram", name: "Instagram", icon: Instagram, connected: true, username: "@yourhandle" },
    { id: "tiktok", name: "TikTok", icon: FaTiktok, connected: true, username: "@youruser" },
    { id: "youtube", name: "YouTube", icon: Youtube, connected: false },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, connected: false },
    { id: "x", name: "X", icon: Twitter, connected: false },
];

export const ConnectedPlatforms = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform) => (
                        <div
                            key={platform.id}
                            className="p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <platform.icon className="h-5 w-5" />
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
                                {platform.connected && (
                                    <Badge variant="secondary" className="text-xs">
                                        Connected
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
