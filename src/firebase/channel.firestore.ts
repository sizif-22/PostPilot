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
import * as fs from "firebase/firestore";
const channelRef = fs.collection(db, "Channels");

const getChannelBriefs = async (channels: UserChannel[]) => {
  if (channels.length === 0) return [];
  const idList = channels.map((channel) => channel.id);
  const channelsQuery = fs.query(
    channelRef,
    fs.where(fs.documentId(), "in", idList)
  );
  const snapshot = await fs.getDocs(channelsQuery);
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
): fs.Unsubscribe => {
  const channelRef = fs.doc(db, "Channels", channel.id);
  return fs.onSnapshot(channelRef, (doc) => {
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
  // Create a clean post object for Firestore storage
  const firestorePost: Post = {
    id: post.id,
    message: post.message,
    published: post.published,
    platforms: post.platforms,
    imageUrls: post.imageUrls,
    facebookVideoType: post.facebookVideoType || "default",
    date: fs.Timestamp.now(),
  };

  // Add scheduling information if present
  if (post.scheduledDate) {
    // Ensure scheduledDate is stored as a Unix timestamp (number)
    firestorePost.scheduledDate =
      typeof post.scheduledDate === "number"
        ? post.scheduledDate
        : Math.floor(new Date(post.scheduledDate).getTime() / 1000);
  }

  // Add timezone information if present
  if (post.clientTimeZone) {
    firestorePost.clientTimeZone = post.clientTimeZone;
  }

  // Filter out undefined values
  const cleanPost = Object.fromEntries(
    Object.entries(firestorePost).filter(([_, value]) => value !== undefined)
  );

  // Use the post ID as the key in the posts map
  const postId = post.id || Date.now().toString();
  await fs.updateDoc(fs.doc(db, "Channels", channelId), {
    [`posts.${postId}`]: cleanPost,
  });
};

const createChannel = async (channel: Channel, user: User) => {
  const { id, authority, ...channelWithoutIdAndAuthority } = channel;
  const newChannel = await fs.addDoc(fs.collection(db, "Channels"), {
    ...channelWithoutIdAndAuthority,
  } as Channel);
  await fs.updateDoc(fs.doc(db, "Users", user.email), {
    channels: fs.arrayUnion({ id: newChannel.id, authority: "Owner" }),
  });
};

const deletePost = async (postId: string, channelId: string) => {
  // Update the channel by removing the specific post from the map
  await fs.updateDoc(fs.doc(db, "Channels", channelId), {
    [`posts.${postId}`]: fs.deleteField(),
  });
};

const editPost = async (
  postId: string,
  channelId: string,
  updatedPost: Partial<Post>
) => {
  // First, get the channel document to find the post
  const channelDoc = await fs.getDoc(fs.doc(db, "Channels", channelId));
  if (!channelDoc.exists()) {
    throw new Error("Channel not found");
  }

  const channelData = channelDoc.data();
  const posts = channelData.posts || {};

  // Check if the post exists
  const existingPost = posts[postId];
  if (!existingPost) {
    throw new Error("Post not found");
  }

  // Update the post with new data
  const updatedPostData = { ...existingPost, ...updatedPost };

  // Handle scheduledDate conversion if present
  if (updatedPost.scheduledDate) {
    updatedPostData.scheduledDate =
      typeof updatedPost.scheduledDate === "number"
        ? updatedPost.scheduledDate
        : Math.floor(new Date(updatedPost.scheduledDate).getTime() / 1000);
  }

  // Update the specific post in the map
  await fs.updateDoc(fs.doc(db, "Channels", channelId), {
    [`posts.${postId}`]: updatedPostData,
  });
};

export const sendNotification = async (
  tm: TMBrief,
  role: Authority,
  channel: Channel,
  user: User
) => {
  await fs.updateDoc(fs.doc(db, "Channels", channel.id), {
    TeamMembers: fs.arrayUnion({
      ...tm,
      role,
      status: "pending",
    } as TeamMember),
  });
  await fs.updateDoc(fs.doc(db, "Users", tm.email), {
    notifications: fs.arrayUnion({
      Type: "Ask",
      owner: user.email,
      channelName: channel.name,
      channelDescription: channel.description,
      channelId: channel.id,
    } as Notification),
  });
};

export const deleteTeamMember = async (tm: TeamMember, channel: Channel) => {
  await fs.updateDoc(fs.doc(db, "Channels", channel.id), {
    TeamMembers: fs.arrayRemove(tm),
  });
  await fs.updateDoc(fs.doc(db, "Users", tm.email), {
    channels: fs.arrayRemove({
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
  await fs.updateDoc(fs.doc(db, "Channels", channel.id), {
    TeamMembers: fs.arrayRemove(tm),
  });
  await fs.updateDoc(fs.doc(db, "Users", tm.email), {
    channels: fs.arrayRemove({
      authority: tm.role,
      id: channel.id,
    } as UserChannel),
  });
  tm.role = newRole;
  await fs.updateDoc(fs.doc(db, "Channels", channel.id), {
    TeamMembers: fs.arrayUnion(tm),
  });
  await fs.updateDoc(fs.doc(db, "Users", tm.email), {
    channels: fs.arrayUnion({
      authority: tm.role,
      id: channel.id,
    } as UserChannel),
  });
};

export const deleteChannel = async (
  users: { email: string; role: Authority }[],
  channelId: string
) => {
  await fs.deleteDoc(fs.doc(db, "Channels", channelId));
  for (const user of users) {
    await fs.updateDoc(fs.doc(db, "Users", user.email), {
      channels: fs.arrayRemove({ id: channelId, authority: user.role }),
    });
  }
};
export const updateChanneName = async (channelId: string, name: string) => {
  await fs.updateDoc(fs.doc(db, "Channels", channelId), { name });
};
export const updateChanneDescription = async (
  channelId: string,
  description: string
) => {
  await fs.updateDoc(fs.doc(db, "Channels", channelId), { description });
};
export {
  getChannelBriefs,
  getChannel,
  createPost,
  createChannel,
  deletePost,
  editPost,
};
