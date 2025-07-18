"use server";
import { db } from "@/firebase/config";
import { addUser } from "@/firebase/user.firestore";
import { User } from "@/interfaces/User";
import { collection, getDocs, query, where } from "firebase/firestore";
import { createSession , deleteSession } from "../_lib/session";

export interface FormDate {
  name: string;
  email: string;
}

export async function signInServer(idToken: string, formDate: FormDate) {
  try {
    await createSession(idToken);

    const userQuery = query(
      collection(db, "Users"),
      where("email", "==", formDate.email)
    );
    const querySnapshot = await getDocs(userQuery);
    if (querySnapshot.empty) {
      const userData: User = {
        name: formDate.name || "",
        email: formDate.email || "",
        avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=5",
        channels: [],
      };
      // If no user exists, add a new document
      await addUser(userData);
      console.log("New user added to Firestore.");
    }
  } catch (error) {
    console.error(error);
  }
}

export async function logOut() {
  deleteSession();
}
