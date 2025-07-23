
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  id: string;
  postId: string;
  postContent: string;
  postScheduledDate?: number;
  postPlatforms: string[];
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  reportedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: number;
  updatedAt: number;
  comments: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: number;
  }[];
}
