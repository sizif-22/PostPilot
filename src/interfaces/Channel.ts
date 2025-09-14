import { MediaItem } from "./Media";
import { Authority, TeamMember } from "./User";
import { Timestamp } from "firebase/firestore";

export interface ChannelBrief {
  id: string;
  name: string;
  description: string;
  authority: Authority;
  createdAt: Timestamp;
}
export interface Page {
  name: string;
  access_token: string;
  id: string;
  instagram_id?: string;
}
export interface facebookChannel {
  name: string;
  id: string;
  accessToken: string;
  tokenExpiry?: string;
  remainingTime?: number;
}
export interface instagramChannel {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramId: string;
  instagramUsername: string;
  instagramName: string;
  profilePictureUrl: string;
  tokenExpiry?: string;
  remainingTime?: number;
}
export interface tiktok {
  accessToken: string;
  name?: string;
  username: string;
  openId: string;
  tokenExpiry?: string;
  remainingTime?: number;
}
export interface LinkedinChannel {
  name: string;
  accountType: string;
  urn?: string; // Make urn optional since personal accounts don't have it
  accessToken: string;
  accountId: string;
  firstName?: string;
  lastName?: string;
  tokenExpiry?: string;
  remainingTime?: number;
  url: string;
}
export interface xChannel {
  name: string;
  username: string;
  accessToken: string;
  userId: string;
  isPersonal: boolean;
  refreshToken?: string;
  tokenExpiry?: string;
  remainingTime?: number;
}
export interface Channel extends ChannelBrief {
  socialMedia?: {
    facebook?: facebookChannel;
    instagram?: instagramChannel;
    tiktok?: tiktok;
    linkedin?: LinkedinChannel;
    x?: xChannel;
  };
  posts: { [postId: string]: Post };
  TeamMembers: TeamMember[];
}
export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";
export type IssuePriority = "low" | "medium" | "high" | "critical";
export interface Comment {
  postId: string;
  message: string;
  author: { email: string; name: string; avatar?: string };
  date: Timestamp;
}
export interface Issue {
  id: string;
  postId: string;
  message: string;
  status: "open" | "resolved";
  author: { email: string; name: string; avatar?: string };
  comments: Comment[];
  date: Timestamp;
}

export type Post = {
  id?: string;
  issues?: { [issueId: string]: Issue };
  comments?: Comment[];
  message?: string;
  platforms?: string[];
  media?: MediaItem[];
  videoUrls?: any[];
  date: Timestamp;
  isScheduled: boolean;
  status?: string;
  draft?: boolean;
  ruleName?: string;
  published?: boolean;
  facebookVideoType?: string;
  title?: string;
  clientTimeZone?: string;
  xText?: string;
};
