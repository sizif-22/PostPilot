'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Notification } from '@/types/notifications';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@workos-inc/authkit-nextjs/components';

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  // acceptInvitation: (notificationId: string) => void;
  // rejectInvitation: (notificationId: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from the backend
  const allNotifications = useQuery(api.collectionFuncs.getNotifications, {
    userId: user?.id || '',
    paginationOpts: { numItems: 50, cursor: null } // Get up to 50 notifications
  });

  // Fetch invitations from the backend
  const myInvitations = useQuery(api.invitations.getMyInvitations,
    user?.email ? { email: user.email } : "skip"
  );

  // Define types for the backend data
  type BackendNotification = {
    _id: string;
    userId: string;
    type: 'invitation' | 'announcement';
    senderName?: string;
    senderEmail?: string;
    collectionId?: string;
    collectionName?: string;
    role?: string;
    title?: string;
    message?: string;
    isRead: boolean;
    createdAt: string;
  };

  // Convert the backend data to our frontend format
  useEffect(() => {
    let mergedNotifications: Notification[] = [];

    // Process regular notifications
    if (allNotifications && user?.id) {
      const convertedNotifications = allNotifications.page.map((notification: BackendNotification) => {
        if (notification.type === 'invitation') {
          return {
            id: notification._id,
            type: 'invitation' as const,
            senderName: notification.senderName || '',
            senderEmail: notification.senderEmail || '',
            collectionId: notification.collectionId || '',
            collectionName: notification.collectionName || '',
            role: notification.role || '',
            createdAt: new Date(notification.createdAt),
            isRead: notification.isRead,
          };
        } else if (notification.type === 'announcement') {
          return {
            id: notification._id,
            type: 'announcement' as const,
            title: notification.title || '',
            message: notification.message || '',
            createdAt: new Date(notification.createdAt),
            isRead: notification.isRead,
          };
        }
        return null;
      }).filter(Boolean) as Notification[];
      mergedNotifications = [...mergedNotifications, ...convertedNotifications];
    }

    // Process invitations (treat as notifications)
    if (myInvitations) {
      const invitationNotifications = myInvitations.map((inv) => ({
        id: inv._id,
        type: 'invitation' as const,
        senderName: inv.senderName,
        senderEmail: inv.senderEmail,
        collectionId: inv.collectionId,
        collectionName: inv.collectionName,
        role: inv.role,
        createdAt: new Date(inv.createdAt),
        isRead: false, // Invitations are always unread until acted upon
      }));
      // Prepend invitations
      mergedNotifications = [...invitationNotifications, ...mergedNotifications];
    }

    // Deduplicate by ID (in case an invitation is also in notifications table)
    const uniqueNotifications = Array.from(new Map(mergedNotifications.map(item => [item.id, item])).values());

    // Sort by date desc
    uniqueNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    setNotifications(uniqueNotifications);
  }, [allNotifications, myInvitations, user?.id]);

  const updateNotification = useMutation(api.collectionFuncs.updateNotification);
  const deleteNotification = useMutation(api.collectionFuncs.deleteNotification);
  const markAllAsReadMutation = useMutation(api.collectionFuncs.markAllNotificationsAsRead);
  const acceptInvitation = useMutation(api.invitations.acceptInvitation);
  const rejectInvitation = useMutation(api.invitations.rejectInvitation);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));

    // Only delete from backend if it's a notification ID (not an invitation ID)
    // We can guess based on the ID format or by checking our local list
    // But since we don't have the type here easily, we'll try-catch or check if it exists in myInvitations

    const isInvitation = myInvitations?.some(inv => inv._id === id);

    if (!isInvitation) {
      deleteNotification({ notificationId: id as Id<"notifications"> }).catch(() => { });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );

    const isInvitation = myInvitations?.some(inv => inv._id === id);
    if (!isInvitation) {
      updateNotification({ notificationId: id as Id<"notifications">, isRead: true }).catch(() => { });
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    // Also update on backend
    if (user?.id) {
      markAllAsReadMutation({ userId: user.id });
    }
  };

  // const acceptInvitation = async (notificationId: string) => {
  //   if (!user?.id) return;
  //   try {
  //     await acceptInvitationMutation({ invitationId: notificationId as Id<"invitations"> | Id<"notifications">, userId: user.id });
  //     // Remove the notification after accepting
  //     removeNotification(notificationId);
  //   } catch (error) {
  //     console.error('Error accepting invitation:', error);
  //   }
  // };

  // const rejectInvitation = async (notificationId: string) => {
  //   if (!user?.id) return;
  //   try {
  //     await rejectInvitationMutation({ invitationId: notificationId as Id<"invitations"> | Id<"notifications">, userId: user.id });
  //     // Remove the notification after rejecting
  //     removeNotification(notificationId);
  //   } catch (error) {
  //     console.error('Error rejecting invitation:', error);
  //   }
  // };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        // acceptInvitation,
        // rejectInvitation,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};