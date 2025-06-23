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

  // Add the current timestamp as the creation date
  firestorePost.date = new Date();

  // Filter out undefined values
  const cleanPost = Object.fromEntries(
    Object.entries(firestorePost).filter(([_, value]) => value !== undefined)
  );

  await fs.updateDoc(fs.doc(db, "Channels", channelId), {
    posts: fs.arrayUnion(cleanPost),
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
  // First, get the channel document to find the post
  const channelDoc = await fs.getDoc(fs.doc(db, "Channels", channelId));
  if (!channelDoc.exists()) {
    throw new Error("Channel not found");
  }

  const channelData = channelDoc.data();
  const posts = channelData.posts || [];

  // Find and remove the post with the matching ID
  const updatedPosts = posts.filter((post: Post) => post.id !== postId);

  // Update the channel with the new posts array
  await fs.updateDoc(fs.doc(db, "Channels", channelId), {
    posts: updatedPosts,
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
  const posts = channelData.posts || [];

  // Find the post index
  const postIndex = posts.findIndex((post: Post) => post.id === postId);
  if (postIndex === -1) {
    throw new Error("Post not found");
  }

  // Update the post with new data
  const existingPost = posts[postIndex];
  const updatedPostData = { ...existingPost, ...updatedPost };

  // Handle scheduledDate conversion if present
  if (updatedPost.scheduledDate) {
    updatedPostData.scheduledDate =
      typeof updatedPost.scheduledDate === "number"
        ? updatedPost.scheduledDate
        : Math.floor(new Date(updatedPost.scheduledDate).getTime() / 1000);
  }

  // Update the posts array
  const updatedPosts = [...posts];
  updatedPosts[postIndex] = updatedPostData;

  // Update the channel with the new posts array
  await fs.updateDoc(fs.doc(db, "Channels", channelId), {
    posts: updatedPosts,
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

export {
  getChannelBriefs,
  getChannel,
  createPost,
  createChannel,
  deletePost,
  editPost,
};
