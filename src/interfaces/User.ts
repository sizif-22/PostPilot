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
}