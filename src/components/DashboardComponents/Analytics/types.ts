
export interface Post {
  id: string;
  platform: 'Facebook' | 'Instagram';
  type: 'Image' | 'Video' | 'Carousel';
  content: string;
  likes: number;
  comments: number;
  shares?: number;
  saves?: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  date: string;
  thumbnail: string;
}

export interface EngagementData {
  date: string;
  Facebook: number;
  Instagram: number;
}

export interface PlatformComparisonData {
  metric: string;
  Facebook: number;
  Instagram: number;
}

export interface AudienceDemographics {
  age: Record<string, number>;
  gender: Record<string, number>;
  location: Record<string, number>;
}

export interface AnalyticsData {
  totalReach: number;
  totalImpressions: number;
  totalEngagementRate: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  followerGrowth: {
    date: string;
    followers: number;
  }[];
  bestPerformingPosts: Post[];
  engagementByPostType: {
    type: string;
    Facebook: number;
    Instagram: number;
  }[];
  platformComparison: PlatformComparisonData[];
  optimalPostingTimes: {
    time: string;
    engagement: number;
  }[];
  audienceDemographics: AudienceDemographics;
  engagementTrends: EngagementData[];
}
