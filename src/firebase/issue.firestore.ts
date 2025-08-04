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
    } as Comment),
  });
};
