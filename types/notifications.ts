export type NotificationType = 'invitation' | 'announcement';

export interface BaseNotification {
  id: string;
  type: NotificationType;
  createdAt: Date;
  isRead: boolean;
}

export interface InvitationNotification extends BaseNotification {
  type: 'invitation';
  senderName: string;
  senderEmail: string;
  collectionId: string;
  collectionName: string;
  role: string;
}

export interface AnnouncementNotification extends BaseNotification {
  type: 'announcement';
  title: string;
  message: string;
}

export type Notification = InvitationNotification | AnnouncementNotification;