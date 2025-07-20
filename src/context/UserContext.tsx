"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
// import { checkLoggedIn } from "@/firebase/auth";
import { getUser } from "@/firebase/user.firestore";
import { User } from "@/interfaces/User";
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string | null;
}) => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const checkAuth = async () => {
      if (email) {
        // Start real-time listener for user data
        unsubscribe = getUser(email, (userData) => {
          setUser(userData);
        });
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = ():UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
