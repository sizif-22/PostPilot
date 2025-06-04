import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { User } from "@/interfaces/User";


const addUser = async (user: User) => {
  const userRef = fs.doc(fs.collection(db, "Users"), user.email);
  await fs.setDoc(userRef, user);
};

const getUser = (email: string, callback: (user: User | null) => void): fs.Unsubscribe => {
  const userRef = fs.doc(fs.collection(db, "Users"), email);
  return fs.onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as User);
    } else {
      callback(null);
    }
  });
};

export { addUser, getUser };
