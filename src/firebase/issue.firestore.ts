
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
} from "firebase/firestore";
import { Issue, IssueStatus } from "@/interfaces/Issue";

const issuesCollection = collection(db, "Issues");

export const getIssuesByChannel = async (channelId: string): Promise<Issue[]> => {
  const q = query(issuesCollection, where("channelId", "==", channelId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Issue[];
};

export const createIssue = async (issue: Omit<Issue, "id" | "createdAt" | "updatedAt">) => {
  const newIssue = {
    ...issue,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(issuesCollection, newIssue);
  return docRef.id;
};

export const updateIssueStatus = async (issueId: string, status: IssueStatus) => {
  const issueDoc = doc(db, "issues", issueId);
  await updateDoc(issueDoc, { status, updatedAt: serverTimestamp() });
};
