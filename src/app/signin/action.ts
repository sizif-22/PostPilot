"use server";
import { db } from "@/firebase/config";
import { addUser } from "@/firebase/user.firestore";
import { Notification, User } from "@/interfaces/User";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import { login, logout } from "../_lib/session";

export interface FormDate {
  avatar?: string;
  name: string;
  email: string;
}

export async function signInServer(idToken: string, formDate: FormDate) {
  try {
    await login(idToken);

    const userQuery = query(
      collection(db, "Users"),
      where("email", "==", formDate.email)
    );
    const querySnapshot = await getDocs(userQuery);
    if (querySnapshot.empty) {
    let notifications: Notification[] | undefined = undefined;
    const invitationDoc = await getDoc(doc(db, "Invitations", formDate.email));
    if (invitationDoc.exists()) {
      const data = invitationDoc.data();
      notifications = data?.notifications;
    }
      const userData: Partial<User> = {
        uid: "",
        name: formDate.name || "",
        email: formDate.email || "",
        avatar:
          formDate.avatar ||
          "https://api.dicebear.com/9.x/notionists/svg?seed=5",
        channels: [],
        notifications,
      };
      await addUser(userData);
      if (invitationDoc.exists()) {
      await deleteDoc(doc(db, "Invitations", formDate.email));
    }
      console.log("New user added to Firestore.");
    }
  } catch (error) {
    console.error(error);
  }
}

export async function logOut() {
await logout();
}


