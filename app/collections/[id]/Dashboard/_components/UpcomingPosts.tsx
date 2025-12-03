import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaYoutube,
    FaTiktok,
    FaXTwitter,
} from "react-icons/fa6";

export const UpcomingPosts = () => {
    const params = useParams();
    const collectionId = params.id as Id<"collection">;
    const allPosts = useQuery(api.postFunctions.getPosts, { collectionId });

    // Filter and sort scheduled posts
    const scheduledPosts = allPosts
        ?.filter((post) => post.status === "scheduled" && post.scheduledDate)
        .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
        .slice(0, 5); // Show top 5 upcoming

    const getPlatformIcon = (platformId: string) => {
        switch (platformId) {
            case "facebook": return <FaFacebook className="text-blue-600" />;
            case "instagram": return <FaInstagram className="text-pink-600" />;
            case "linkedin": return <FaLinkedin className="text-blue-700" />;
            case "x": return <FaXTwitter />;
            case "youtube": return <FaYoutube className="text-red-600" />;
            case "tiktok": return <FaTiktok />;
            default: return null;
        }
    };

    const getPostTitle = (post: any) => {
        if (post.content.youtube?.title) return post.content.youtube.title;
        if (post.content.tiktok?.title) return post.content.tiktok.title;

        // Try to find text content from other platforms
        const textContent =
            post.content.facebook ||
            post.content.instagram ||
            post.content.linkedin ||
            post.content.x;

        if (textContent) {
            return textContent.length > 50
                ? textContent.substring(0, 50) + "..."
                : textContent;
        }

        return "Untitled Post";
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (!scheduledPosts || scheduledPosts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No upcoming posts scheduled
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Posts</CardTitle>
                    <Badge variant="secondary">{scheduledPosts.length} Scheduled</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {scheduledPosts.map((post) => {
                        const { date, time } = formatDateTime(post.scheduledDate!);
                        return (
                            <div
                                key={post._id}
                                className="p-4 border rounded-lg hover:bg-accent transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 flex-1">
                                        <h4 className="text-sm font-medium line-clamp-1">{getPostTitle(post)}</h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {post.platforms.map((platform) => (
                                            <div key={platform} className="p-1.5 bg-background rounded-full border text-xs">
                                                {getPlatformIcon(platform)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
