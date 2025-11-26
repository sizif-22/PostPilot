import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiCalendar, FiClock } from "react-icons/fi";

export const UpcomingPosts = () => {
    // Mock data
    const posts = [
        {
            id: 1,
            title: "Product Launch Announcement",
            platforms: ["twitter", "linkedin"],
            date: "Apr 15",
            time: "10:00 AM",
            status: "scheduled",
        },
        {
            id: 2,
            title: "Weekly Team Update",
            platforms: ["facebook", "instagram"],
            date: "Apr 16",
            time: "02:30 PM",
            status: "scheduled",
        },
        {
            id: 3,
            title: "Tech Talk: AI in 2024",
            platforms: ["youtube"],
            date: "Apr 18",
            time: "11:00 AM",
            status: "scheduled",
        },
    ];

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Upcoming Posts</CardTitle>
                    <Badge variant="secondary">{posts.length} Scheduled</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] pr-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium leading-none">{post.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <FiCalendar className="w-3 h-3" />
                                            <span>{post.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            <span>{post.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {post.platforms.map((p) => (
                                        <Badge key={p} variant="outline" className="text-[10px] px-1.5 py-0 uppercase">
                                            {p[0]}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
