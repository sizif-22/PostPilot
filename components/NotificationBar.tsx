'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/components/NotificationsProvider';
import { Notification } from '@/types/notifications';
import { Bell, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
interface NotificationItemProps {
  notification: Notification;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onClose?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onAccept, onReject, onClose }) => {
  const { user } = useAuth();
  const { removeNotification, markAsRead } = useNotifications();
  const acceptInvitation = useMutation(api.invitations.acceptInvitation);
  const rejectInvitation = useMutation(api.invitations.rejectInvitation);

  const handleAccept = () => {
    if (onAccept) onAccept(notification.id);
    // For invitations, we call the specific accept function
    if (notification.type === 'invitation') {
      acceptInvitation({ invitationId: notification.id as Id<"invitations">, userId: user?.id as string });
    } else {
      removeNotification(notification.id);
    }
  };

  const handleReject = () => {
    if (onReject) onReject(notification.id);
    // For invitations, we call the specific reject function
    if (notification.type === 'invitation') {
      rejectInvitation({ invitationId: notification.id as Id<"invitations">, userId: user?.id as string });
    } else {
      removeNotification(notification.id);
    }
  };

  const handleClose = () => {
    if (onClose) onClose(notification.id);
    // For announcements, just mark as read. For invitations, remove regardless of accept/reject
    if (notification.type === 'announcement') {
      markAsRead(notification.id);
    } else {
      removeNotification(notification.id);
    }
  };

  // Mark as read if it's unread
  useEffect(() => {
    if (!notification.isRead) {
      const timer = setTimeout(() => {
        markAsRead(notification.id);
      }, 3000); // Mark as read after 3 seconds to avoid race conditions
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.isRead, markAsRead]);

  if (notification.type === 'invitation') {
    return (
      <div className={`p-4 border-b border-border last:border-0 ${!notification.isRead ? 'bg-accent/30' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{notification.senderName}</span> invites you to be
              <span className="font-medium"> {notification.role} </span>
              in their collection
              <span className="font-medium"> &quot;{notification.collectionName}&quot;</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{notification.senderEmail}</p>
          </div>
          {/* <Button variant="outline" size="sm" className="h-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button> */}
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" className="flex-1" onClick={handleAccept}>
            Accept
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={handleReject}>
            Reject
          </Button>
        </div>
      </div>
    );
  }

  if (notification.type === 'announcement') {
    return (
      <div className={`p-4 border-b border-border last:border-0 ${!notification.isRead ? 'bg-accent/30' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 className="font-medium">{notification.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

const NotificationBar: React.FC = () => {
  const { notifications, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const prevNotificationIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    // Initialize ID set on first load
    if (isFirstLoadRef.current) {
      prevNotificationIdsRef.current = new Set(notifications.map(n => n.id));
      isFirstLoadRef.current = false;
      return;
    }

    // Check for new notifications
    notifications.forEach(n => {
      if (!prevNotificationIdsRef.current.has(n.id)) {
        // New notification found
        if (n.type === 'invitation') {
          toast.info(`New invitation from ${n.senderName}`, {
            description: `Invited to ${n.collectionName} as ${n.role}`,
            action: {
              label: 'View',
              onClick: () => setIsOpen(true)
            }
          });
        } else {
          toast.info(n.title, {
            description: n.message,
            action: {
              label: 'View',
              onClick: () => setIsOpen(true)
            }
          });
        }
      }
    });

    // Update the set of known IDs
    prevNotificationIdsRef.current = new Set(notifications.map(n => n.id));
  }, [notifications]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-8 w-8">
          <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto p-0">
        <div className="p-4 border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs">
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBar;
