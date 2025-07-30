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
import { Issue, Post ,Comment} from "@/interfaces/Channel";

const issuesCollection = collection(db, "Issues");

// export const getIssuesByChannel = async (channelId: string): Promise<Issue[]> => {
//   const q = query(issuesCollection, where("channelId", "==", channelId));
//   const snapshot = await getDocs(q);
//   return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Issue[];
// };

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
    [`posts.${post.id}.issues`]: arrayUnion(issue),
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
    [`posts.${post.id}.comments`]: arrayUnion(comment),
  });
};

// export const updateIssueStatus = async (issueId: string, status: IssueStatus) => {
//   const issueDoc = doc(db, "issues", issueId);
//   await updateDoc(issueDoc, { status, updatedAt: serverTimestamp() });
// };
