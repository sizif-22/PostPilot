"use client";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useState, useContext, useEffect } from "react";
import { checkLoggedIn } from "@/firebase/auth";
import { getUser, User } from "@/firebase/user.firestore";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const checkAuth = async () => {
      const authUser = await checkLoggedIn();
      if (authUser) {
        // Start real-time listener for user data
        unsubscribe = getUser(authUser.email, (userData) => {
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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
