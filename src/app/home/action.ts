"use server";
import { db } from "@/firebase/config";
import { addUser } from "@/firebase/user.firestore";
import { User } from "@/interfaces/User";
import { collection, getDocs, query, where } from "firebase/firestore";
import { login, logout } from "../_lib/session";

export interface FormDate {
  avatar?:string;
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
      const userData: User = {
        uid: "",
        name: formDate.name || "",
        email: formDate.email || "",
        avatar: formDate.avatar || "https://api.dicebear.com/9.x/notionists/svg?seed=5",
        channels: [],
      };
      await addUser(userData);
      console.log("New user added to Firestore.");
    }
  } catch (error) {
    console.error(error);
  }
}

export async function logOut() {
  await logout();
}
