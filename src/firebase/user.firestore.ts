import { db } from "@/firebase/config";
import * as fs from "firebase/firestore";
import { User, TMBrief, TeamMember, Authority } from "@/interfaces/User";
import { Notification } from "@/interfaces/User";
import { Channel } from "@/interfaces/Channel";

export const addUser = async (user: User) => {
  const userRef = fs.doc(fs.collection(db, "Users"), user.email);
  await fs.setDoc(userRef, { ...user, channels: [] });
};

export const getUser = (
  email: string,
  callback: (user: User | null) => void
): fs.Unsubscribe => {
  const userRef = fs.doc(fs.collection(db, "Users"), email);
  return fs.onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as User);
    } else {
      callback(null);
    }
  });
};

export const getTeamMembers = async (partOfEmail: string) => {
  if (partOfEmail.length == 0) return [];
  const usersRef = fs.collection(db, "Users");
  const snapshot = await fs.getDocs(usersRef);
  const result = snapshot.docs
    .filter((doc) => doc.id.toLowerCase().includes(partOfEmail.toLowerCase()))
    .map((doc) => {
      return {
        name: doc.data().name,
        email: doc.id,
      } as TMBrief;
    });
  return result;
};

export const acceptJoiningToAChannel = async (
  notification: Notification,
  user: User
) => {
  const channel = (
    await fs.getDoc(fs.doc(db, "Channels", notification.channelId))
  ).data() as Channel;
  const tm = channel.TeamMembers.find(
    (tm) => tm.email == user.email && tm.status == "pending"
  );
  if (tm) {
    await fs.updateDoc(fs.doc(db, "Channels", notification.channelId), {
      TeamMembers: fs.arrayRemove(tm),
    });
    tm.status = "active";
    await fs.updateDoc(fs.doc(db, "Channels", notification.channelId), {
      TeamMembers: fs.arrayUnion(tm),
    });
    await fs.updateDoc(fs.doc(db, "Users", user.email), {
      channels: fs.arrayUnion({
        authority: tm.role,
        id: notification.channelId,
      }),
    });
    await fs.updateDoc(fs.doc(db, "Users", user.email), {
      notifications: fs.arrayRemove(notification),
    });
  }
};
export const rejectJoiningToAChannel = async (
  notification: Notification,
  user: User
) => {
  const channel = (
    await fs.getDoc(fs.doc(db, "Channels", notification.channelId))
  ).data() as Channel;
  const tm = channel.TeamMembers.find(
    (tm) => tm.email == user.email && tm.status == "pending"
  );
  if (tm) {
    await fs.updateDoc(fs.doc(db, "Channels", notification.channelId), {
      TeamMembers: fs.arrayRemove(tm),
    });
    await fs.updateDoc(fs.doc(db, "Users", user.email), {
      notifications: fs.arrayRemove(notification),
    });
  }
};
