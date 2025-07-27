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
}
export interface instagramChannel {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramId: string;
  instagramUsername: string;
  instagramName: string;
  profilePictureUrl: string;
}
export interface tiktok {
  accessToken: string;
  name?: string;
  username: string;
  openId: string;
}
export interface linkedinChannel {
  name: string;
  urn: string;
  accessToken: string;
  organizationId: string;
}
export interface xChannel {
  name: string;
  username: string;
  accessToken: string;
  userId: string;
  isPersonal: boolean;
  refreshToken?: string;
  tokenExpiry?: string;
}
export interface Channel extends ChannelBrief {
  socialMedia?: {
    facebook?: facebookChannel;
    instagram?: instagramChannel;
    tiktok?: tiktok;
    linkedin?: linkedinChannel;
    x?: xChannel;
  };
  posts: { [postId: string]: Post };
  TeamMembers: TeamMember[];
}
export type Post = {
  id?: string;
  // content?: string;
  message?: string;
  platforms?: string[];
  imageUrls?: any[];
  videoUrls?: any[];
  scheduledDate?: number;
  date?: any;
  status?: string;
  draft?: boolean;
  ruleName?: string;
  published?: boolean;
  comments?: any[];
  facebookVideoType?: string;
  title?: string;
  clientTimeZone?: string;

};
