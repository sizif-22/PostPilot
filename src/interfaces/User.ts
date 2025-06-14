export type Authority = "Owner" | "Inspector" | "Contributor";

export interface UserChannel {
    id: string;
    authority: Authority;
}
export interface User {
    name: string;
    email: string;
    photoURL: string;
    isLoggedIn: boolean;
    isVerified: boolean;
    channels: UserChannel[];
    notifications?:Notification[];
}
export interface TMBrief{
    name: string;
    email: string;
}
export interface TeamMember extends TMBrief {
    role: Authority;
    status: "active" | "pending";
}
export interface Notification {
    Type:"Message"|"Ask",
    owner:string;
    channelName:string;
    channelDescription: string;
    channelId:string;
}