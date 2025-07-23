"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged, User as FirebaseAuthUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { User, UserChannel, Notification } from "@/interfaces/User";

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "Users", firebaseUser.email!);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const customUser: User = {
            uid: firebaseUser.uid,
            name: userData.name || firebaseUser.displayName || "",
            email: firebaseUser.email!,
            avatar: userData.avatar || firebaseUser.photoURL || "",
            channels: userData.channels || [],
            notifications: userData.notifications || [],
          };
          setUser(customUser);
        } else {
          // If user document doesn't exist, create a basic one
          const customUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "",
            email: firebaseUser.email!,
            avatar: firebaseUser.photoURL || "",
            channels: [],
            notifications: [],
          };
          setUser(customUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
