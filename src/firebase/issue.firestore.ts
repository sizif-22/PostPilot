import { db } from "./config";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { Issue, Post, Comment } from "@/interfaces/Channel";

const issuesCollection = collection(db, "Issues");

export const createIssue = async ({
  issue,
  post,
  channelId,
}: {
  issue: Issue;
  post: Post;
  channelId: string;
}) => {
  const docRef = await updateDoc(doc(db, "Channels", channelId), {
    [`posts.${post.id}.issues.${issue.id}`]: {
      ...issue,
      postId: post.id,
    } as Issue,
  });
};

export const createComment = async ({
  comment,
  post,
  channelId,
}: {
  comment: Comment;
  post: Post;
  channelId: string;
}) => {
  const docRef = await updateDoc(doc(db, "Channels", channelId), {
    [`posts.${post.id}.comments`]: arrayUnion({
      ...comment,
      postId: post.id,
      // date: serverTimestamp(),
    } as Comment),
  });
};

export const createIssueComment = async ({
  issue,
  comment,
  channelId,
}: {
  issue: Issue;
  comment: Comment;
  channelId: string;
}) => {
  try {
    const docRef = await updateDoc(doc(db, "Channels", channelId), {
      [`posts.${issue.postId}.issues.${issue.id}.comments`]: arrayUnion({
        ...comment,
        postId: issue.postId,
        // date: serverTimestamp(),
      } as Comment),
    });
    return docRef;
  } catch (error) {
    console.error("Error creating issue comment:", error);
    throw error;
  }
};