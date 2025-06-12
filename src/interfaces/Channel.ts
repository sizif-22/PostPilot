import { Authority } from "./User";
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
}
export interface facebookChannel{
     name: string;
     id: string;
     accessToken: string;
}
export interface Channel extends ChannelBrief {
     socialMedia: {
         facebook: facebookChannel;
         instagram: string;
     }
    posts: Post[];
}
export interface Post {
    id: string;
    title: string;
    date: Date;
    platforms: string[];
    content: string;
    imageUrl?: string[];
    published: boolean;
    scheduledDate?: number;
}