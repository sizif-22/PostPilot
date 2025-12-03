

export interface Comment {
    message: string;
    author: {
        email: string;
        name: string;
        avatar: string;
    };
    date: any; // Using any to support both Firestore Timestamp and other date formats if needed
}

export interface Issue {
    id: string;
    message: string;
    status: "open" | "resolved";
    author: {
        email: string;
        name: string;
        avatar: string;
    };
    comments: Comment[];
    date: any;
}

export interface Post {
    id: string;
    collectionId?: string;
    platforms: string[];
    content?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        x?: string;
        youtube?: {
            title: string;
            description: string;
        };
        tiktok?: {
            title: string;
            description: string;
            privacy: string;
            allowComment: boolean;
            allowDuet: boolean;
            allowStitch: boolean;
        };
    };
    media?: {
        url: string;
        name: string;
        isVideo: boolean;
        thumbnailUrl?: string;
    }[];
    scheduledDate?: number | string;
    date: any; // Firestore Timestamp
    status: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    issues?: Record<string, Issue>;
    comments?: Record<string, Comment>;
    draft?: boolean;
    published?: boolean;
    message?: string;
    imageUrls?: any[];
    ruleName?: string;
    xText?: string;
}
