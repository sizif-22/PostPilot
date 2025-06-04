import { Authority } from "./User";
import { Timestamp } from "firebase/firestore";

export interface ChannelBrief {
     id: string;
     name: string;
     description: string;
     authority: Authority;
     createdAt: Timestamp;    
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
 }