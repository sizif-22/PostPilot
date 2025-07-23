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
} from "firebase/firestore";

export const addCommentToPost = async (postId: string, channelId: string, comment: any) => {
  const postDoc = doc(db, `channels/${channelId}/posts`, postId);
  await updateDoc(postDoc, {
    comments: arrayUnion(comment),
  });
};
const channelRef = collection(db, "Channels");

const getChannelBriefs = async (channels: UserChannel[]) => {
  if (channels.length === 0) return [];
  const idList = channels.map((channel) => channel.id);
  const channelsQuery = query(
    channelRef,
    where(documentId(), "in", idList)
  );
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

const getChannel = (
  channel: UserChannel,
  callback: (channel: Channel | null) => void
) => {
  const channelRef = doc(db, "Channels", channel.id);
  return onSnapshot(channelRef, (doc) => {
    if (doc.exists()) {
      callback({
        ...doc.data(),
        id: doc.id,
        authority: channel.authority,
      } as Channel);
    } else {
      callback(null);
    }
  });
};

const createPost = async (post: Post, channelId: string) => {
  const firestorePost: Post = {
    id: post.id,
    message: post.message,
    published: post.published,
    platforms: post.platforms,
    imageUrls: post.imageUrls,
    date: Timestamp.now(),
  };

  if (post.scheduledDate) {
    firestorePost.scheduledDate =
      typeof post.scheduledDate === "number"
        ? post.scheduledDate
        : Math.floor(new Date(post.scheduledDate).getTime() / 1000);
  }

  const cleanPost = Object.fromEntries(
    Object.entries(firestorePost).filter(([_, value]) => value !== undefined)
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

  if (updatedPost.scheduledDate) {
    updatedPostData.scheduledDate =
      typeof updatedPost.scheduledDate === "number"
        ? updatedPost.scheduledDate
        : Math.floor(new Date(updatedPost.scheduledDate).getTime() / 1000);
  }

  await updateDoc(doc(db, "Channels", channelId), {
    [`posts.${postId}`]: updatedPostData,
  });
};

export const sendNotification = async (
  tm: TMBrief,
  role: Authority,
  channel: Channel,
  user: User
) => {
  await updateDoc(doc(db, "Channels", channel.id), {
    TeamMembers: arrayUnion({
      ...tm,
      role,
      status: "pending",
    } as TeamMember),
  });
  await updateDoc(doc(db, "Users", tm.email), {
    notifications: arrayUnion({
      Type: "Ask",
      owner: user.email,
      channelName: channel.name,
      channelDescription: channel.description,
      channelId: channel.id,
    } as Notification),
  });
};

export const deleteTeamMember = async (tm: TeamMember, channel: Channel) => {
  await updateDoc(doc(db, "Channels", channel.id), {
    TeamMembers: arrayRemove(tm),
  });
  await updateDoc(doc(db, "Users", tm.email), {
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
  await updateDoc(doc(db, "Users", tm.email), {
    channels: arrayRemove({
      authority: tm.role,
      id: channel.id,
    } as UserChannel),
  });
  tm.role = newRole;
  await updateDoc(doc(db, "Channels", channel.id), {
    TeamMembers: arrayUnion(tm),
  });
  await updateDoc(doc(db, "Users", tm.email), {
    channels: arrayUnion({
      authority: tm.role,
      id: channel.id,
    } as UserChannel),
  });
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