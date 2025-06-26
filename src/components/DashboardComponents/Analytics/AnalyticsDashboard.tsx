"use client";

import { useChannel } from '@/context/ChannelContext';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, MoreVertical, Calendar as CalendarIcon, Users, BarChart, ThumbsUp, MessageSquare, Share2, Eye, TrendingUp, Image as ImageIcon, Video, Layers } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { emptyAnalyticsData, mockAnalyticsData } from './data';
import { AnalyticsData, Post } from './types';
import { EngagementTrendsChart, PlatformComparisonChart, AudienceDemographicsChart } from './charts';

const AnalyticsDashboard = () => {
  const { channel } = useChannel();
  const [data, setData] = useState<AnalyticsData>(emptyAnalyticsData);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!channel) return;

      try {
        const response = await fetch('/api/facebook/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            pageId: channel.socialMedia.facebook.id, 
            accessToken: channel.socialMedia.facebook.token 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error(error);
        setData(emptyAnalyticsData); // Reset to empty state on error
      }
    };

    fetchData();
  }, [channel, date]);

  if (!channel?.socialMedia?.facebook?.id || !channel?.socialMedia?.facebook?.token) {
    return <div className="flex items-center justify-center h-screen">Please connect your Facebook page to view analytics.</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Social Media Analytics</h1>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalReach.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalImpressions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalEngagementRate}%</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Follower Growth</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{data.followerGrowth[data.followerGrowth.length - 1].followers - data.followerGrowth[0].followers}</div>
                <p className="text-xs text-muted-foreground">In the last 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Facebook vs. Instagram Engagement Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <EngagementTrendsChart data={data.engagementTrends} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Platform Comparison</CardTitle>
                <CardDescription>Key metrics across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <PlatformComparisonChart data={data.platformComparison} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-8 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Performing Posts</CardTitle>
              <CardDescription>Your top posts by engagement rate</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reach</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Engagement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.bestPerformingPosts.map((post: Post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={post.thumbnail} />
                            <AvatarFallback>{post.platform.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="truncate max-w-xs">{post.content}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.platform === 'Facebook' ? 'default' : 'secondary'}>{post.platform}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {post.type === 'Image' && <ImageIcon className="h-4 w-4 mr-2" />}
                          {post.type === 'Video' && <Video className="h-4 w-4 mr-2" />}
                          {post.type === 'Carousel' && <Layers className="h-4 w-4 mr-2" />}
                          {post.type}
                        </div>
                      </TableCell>
                      <TableCell>{post.reach.toLocaleString()}</TableCell>
                      <TableCell>{post.likes.toLocaleString()}</TableCell>
                      <TableCell>{post.comments.toLocaleString()}</TableCell>
                      <TableCell>{post.engagementRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-8 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Audience Demographics</CardTitle>
                    <CardDescription>An overview of your audience</CardDescription>
                </CardHeader>
                <CardContent>
                    <AudienceDemographicsChart data={data.audienceDemographics} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
