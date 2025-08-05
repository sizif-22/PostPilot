export type Authority = "Owner" | "Reviewer" | "Contributor";

export interface UserChannel {
  id: string;
  authority: Authority;
}
export interface User {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  channels: UserChannel[];
  isVerified: Boolean;
  notifications?: Notification[];
}
export interface TMBrief {
  name: string;
  email: string;
  avatar: string;
}
export interface TeamMember extends TMBrief {
  role: Authority;
  status: "active" | "pending";
}
export interface Notification {
  Type: "Message" | "Ask";
  owner: string;
  channelName: string;
  channelDescription: string;
  channelId: string;
}
