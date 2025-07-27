"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";

// Define the notification type
export interface NotificationConfig {
  messageOnProgress: string;
  func: Promise<any>[];
  successMessage: string;
  failMessage: string;
}

interface ActiveNotification {
  id: string;
  message: string;
  status: "progress" | "success" | "error";
  timestamp: number;
}

interface NotificationContextType {
  addNotification: (config: NotificationConfig) => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notificationPool, setNotificationPool] = useState<
    ActiveNotification[]
  >([]);

  const addNotification = async (config: NotificationConfig) => {
    const id = Math.random().toString(36).substr(2, 9);

    // Add progress notification
    const progressNotification: ActiveNotification = {
      id,
      message: config.messageOnProgress,
      status: "progress",
      timestamp: Date.now(),
    };

    setNotificationPool((prev) => {
      const updated = [progressNotification, ...prev];
      // Keep only the 3 most recent notifications
      return updated.slice(0, 3);
    });

    try {
      // Wait for the promise to resolve
      // await config.fun;
      await Promise.all(config.func);

      // Update to success notification
      setNotificationPool((prev) =>
        prev.map((notif) =>
          notif.id === id
            ? {
                ...notif,
                message: config.successMessage,
                status: "success" as const,
              }
            : notif
        )
      );

      // Auto-remove success notification after 3 seconds
      setTimeout(() => {
        setNotificationPool((prev) => prev.filter((notif) => notif.id !== id));
      }, 3000);
    } catch (error) {
      // Update to error notification
      setNotificationPool((prev) =>
        prev.map((notif) =>
          notif.id === id
            ? {
                ...notif,
                message: config.failMessage,
                status: "error" as const,
              }
            : notif
        )
      );

      // Auto-remove error notification after 5 seconds (longer for errors)
      setTimeout(() => {
        setNotificationPool((prev) => prev.filter((notif) => notif.id !== id));
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotificationPool((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      <div className="w-screen h-screen relative">
        {/* Notification Pool - Fixed position at bottom right */}
        <div className="Notification ">
          {notificationPool.map((notification) => (
            <div
              key={notification.id}
              className={`
                p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out 
                ${
                  notification.status === "progress"
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : notification.status === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "error"
                }
                transform translate-x-0 opacity-100
              `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Status Icon */}
                  {notification.status === "progress" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  )}
                  {notification.status === "success" && (
                    <FaRegCheckCircle className="w-4 text-green-600 h-full" />
                  )}
                  {notification.status === "error" && (
                    <RxCrossCircled className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {notification.message}
                  </span>
                </div>

                {/* Close button - only show for non-progress notifications */}
                {notification.status !== "progress" && (
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none">
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {children}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
