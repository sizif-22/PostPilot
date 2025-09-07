import { db } from "@/firebase/config";
import { ChannelBrief, Channel, Post } from "@/interfaces/Channel";
import {
  TeamMember,
  User,
  UserChannel,
  TMBrief,
  Authority,
  Notification,
} from "@/interfaces/User";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  documentId,
  onSnapshot,
  Timestamp,
  deleteField,
  arrayRemove,
  getDoc,
  setDoc,
} from "firebase/firestore";

export const addCommentToPost = async (
  postId: string,
  channelId: string,
  comment: any
) => {
  const postDoc = doc(db, `channels/${channelId}/posts`, postId);
  await updateDoc(postDoc, {
    comments: arrayUnion(comment),
  });
};
const channelRef = collection(db, "Channels");

const getChannelBriefs = async (channels: UserChannel[]) => {
  if (channels.length === 0) return [];
  const idList = channels.map((channel) => channel.id);
  const channelsQuery = query(channelRef, where(documentId(), "in", idList));
  const snapshot = await getDocs(channelsQuery);
  const channelBriefs = snapshot.docs.map((doc) => {
    return {
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      authority:
        channels.find((channel) => channel.id === doc.id)?.authority ||
        "Instructor",
      createdAt: doc.data().createdAt,
    } as ChannelBrief;
  });
  return channelBriefs;
};

import { checkTokenExpiration } from "@/utils/token-expiration";

const getChannel = (
  channel: UserChannel,
  callback: (channel: Channel | null) => void
) => {
  const channelRef = doc(db, "Channels", channel.id);
  return onSnapshot(channelRef, async (doc) => {
    if (doc.exists()) {
      const channelData = {
        ...doc.data(),
        id: doc.id,
        authority: channel.authority,
      } as Channel;
      const updatedChannel = await checkTokenExpiration(channelData);
      callback(updatedChannel);
    } else {
      callback(null);
    }
  });
};

const createPost = async (post: Post, channelId: string) => {
  const cleanPost = Object.fromEntries(
    Object.entries(post).filter(([_, value]) => value !== undefined)
  );

  const postId = post.id || Date.now().toString();
  await updateDoc(doc(db, "Channels", channelId), {
    [`posts.${postId}`]: cleanPost,
  });
};

const createChannel = async (channel: Channel, user: User) => {
  const { id, authority, ...channelWithoutIdAndAuthority } = channel;
  const newChannel = await addDoc(collection(db, "Channels"), {
    ...channelWithoutIdAndAuthority,
  } as Channel);
  await updateDoc(doc(db, "Users", user.email), {
    channels: arrayUnion({ id: newChannel.id, authority: "Owner" }),
  });
};

const deletePost = async (postId: string, channelId: string) => {
  await updateDoc(doc(db, "Channels", channelId), {
    [`posts.${postId}`]: deleteField(),
  });
};

const editPost = async (
  postId: string,
  channelId: string,
  updatedPost: Partial<Post>
) => {
  const channelDoc = await getDoc(doc(db, "Channels", channelId));
  if (!channelDoc.exists()) {
    throw new Error("Channel not found");
  }

  const channelData = channelDoc.data();
  const posts = channelData.posts || {};

  const existingPost = posts[postId];
  if (!existingPost) {
    throw new Error("Post not found");
  }

  const updatedPostData = { ...existingPost, ...updatedPost };

  await updateDoc(doc(db, "Channels", channelId), {
    [`posts.${postId}`]: updatedPostData,
  });
};

export const sendNotification = async (
  tm: TMBrief,
  role: Authority,
  channel: Channel,
  user: User,
  action: "invite" | "add"
) => {
  await updateDoc(doc(db, "Channels", channel.id), {
    TeamMembers: arrayUnion({
      ...tm,
      role,
      status: "pending",
    } as TeamMember),
  });
  if (action == "add") {
    await updateDoc(doc(db, "Users", tm.email), {
      notifications: arrayUnion({
        Type: "Ask",
        owner: user.email,
        channelName: channel.name,
        channelDescription: channel.description,
        channelId: channel.id,
      } as Notification),
    });
  } else if (action == "invite") {
    const userQuery = query(
      collection(db, "Invitations"),
      where("email", "==", tm.email)
    );
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      await updateDoc(doc(db, "Invitations", tm.email), {
        notifications: arrayUnion({
          Type: "Ask",
          owner: user.email,
          channelName: channel.name,
          channelDescription: channel.description,
          channelId: channel.id,
        } as Notification),
      });
    } else {
      await setDoc(doc(db, "Invitations", tm.email), {
        notifications: arrayUnion({
          Type: "Ask",
          owner: user.email,
          channelName: channel.name,
          channelDescription: channel.description,
          channelId: channel.id,
        } as Notification),
      });
    }
  }
};

export const deleteTeamMember = async (tm: TeamMember, channel: Channel) => {
  await updateDoc(doc(db, "Channels", channel.id), {
    TeamMembers: arrayRemove(tm),
  });
  const userQuery = query(
    collection(db, "Users"),
    where("email", "==", tm.email)
  );
  const querySnapshot = await getDocs(userQuery);
  if (!querySnapshot.empty)
    await updateDoc(doc(db, "Users", tm.email), {
      channels: arrayRemove({
        authority: tm.role,
        id: channel.id,
      } as UserChannel),
    });
  const userQuery2 = query(
    collection(db, "Invitations"),
    where("email", "==", tm.email)
  );
  const querySnapshot2 = await getDocs(userQuery2);
  if (!querySnapshot2.empty)
    await updateDoc(doc(db, "Invitations", tm.email), {
      channels: arrayRemove({
        authority: tm.role,
        id: channel.id,
      } as UserChannel),
    });
};

export const updateRole = async (
  tm: TeamMember,
  newRole: Authority,
  channel: Channel
) => {
  await updateDoc(doc(db, "Channels", channel.id), {
    TeamMembers: arrayRemove(tm),
  });
  await updateDoc(doc(db, "Channels", channel.id), {
    TeamMembers: arrayUnion({...tm,role:newRole}),
  });
  const userQuery = query(
    collection(db, "Users"),
    where("email", "==", tm.email)
  );
  const querySnapshot = await getDocs(userQuery);
  if (!querySnapshot.empty) {
    await updateDoc(doc(db, "Users", tm.email), {
      channels: arrayRemove({
        authority: tm.role,
        id: channel.id,
      } as UserChannel),
    });
    await updateDoc(doc(db, "Users", tm.email), {
      channels: arrayUnion({
        authority: newRole,
        id: channel.id,
      } as UserChannel),
    });
  }
  const userQuery2 = query(
    collection(db, "Invitations"),
    where("email", "==", tm.email)
  );
  const querySnapshot2 = await getDocs(userQuery2);
  if (!querySnapshot2.empty) {
    await updateDoc(doc(db, "Invitations", tm.email), {
      channels: arrayRemove({
        authority: tm.role,
        id: channel.id,
      } as UserChannel),
    });
    await updateDoc(doc(db, "Invitations", tm.email), {
      channels: arrayUnion({
        authority: newRole,
        id: channel.id,
      } as UserChannel),
    });
  }
};

export const deleteChannel = async (
  users: { email: string; role: Authority }[],
  channelId: string
) => {
  await deleteDoc(doc(db, "Channels", channelId));
  for (const user of users) {
    await updateDoc(doc(db, "Users", user.email), {
      channels: arrayRemove({ id: channelId, authority: user.role }),
    });
  }
};
export const updateChanneName = async (channelId: string, name: string) => {
  await updateDoc(doc(db, "Channels", channelId), { name });
};
export const updateChanneDescription = async (
  channelId: string,
  description: string
) => {
  await updateDoc(doc(db, "Channels", channelId), { description });
};
export {
  getChannelBriefs,
  getChannel,
  createPost,
  createChannel,
  deletePost,
  editPost,
};
