"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// Define the context type
interface NotificationContextType {
  notification: string | null;
  setNotification: (message: string | null) => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSetNotification = (message: string | null) => {
    setNotification(message);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Delay hiding the element to allow for fade-out animation
    setTimeout(() => {
      setNotification(null);
    }, 300);
  };

  return (
    <NotificationContext.Provider
      value={{ notification, setNotification: handleSetNotification }}>
      <div className="w-screen h-screen relative">
        {notification && (
          <div
            className={`Notification  ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
            <div className="flex justify-between items-center">
              <span>{notification}</span>
              <button
                onClick={handleClose}
                className="ml-4 text-white hover:text-gray-300 text-xl leading-none">
                &times;
              </button>
            </div>
          </div>
        )}
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
