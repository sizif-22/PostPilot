import * as admin from "firebase-admin";
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';

let serverApp: admin.app.App;

if (admin.apps.length === 0) {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_PROJECT_ID environment variable is required");
  }
  if (!clientEmail) {
    throw new Error("FIREBASE_CLIENT_EMAIL environment variable is required");
  }
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is required");
  }

  serverApp = admin.initializeApp({
    projectId: projectId,
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
} else {
  serverApp = admin.app();
}

// Get Auth instance
const auth: Auth = getAuth(serverApp);

/**
 * Verifies a Firebase ID token
 * @param token - The Firebase ID token to verify
 * @returns Promise<DecodedIdToken | null> - The decoded token or null if verification fails
 */
export const verifyIdToken = async (token: string): Promise<DecodedIdToken | null> => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
};

/**
 * Verifies a Firebase session cookie
 * @param sessionCookie - The Firebase session cookie to verify
 * @param checkRevoked - Whether to check if the token has been revoked
 * @returns Promise<DecodedIdToken | null> - The decoded token or null if verification fails
 */
export const verifySessionCookie = async (sessionCookie: string, checkRevoked: boolean = true): Promise<DecodedIdToken | null> => {
  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, checkRevoked);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase session cookie:', error);
    return null;
  }
};

/**
 * Gets user by UID
 * @param uid - User's unique identifier
 * @returns Promise with user record
 */
export const getUserByUid = async (uid: string) => {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error fetching user by UID:', error);
    return null;
  }
};

/**
 * Updates user's email verification status
 * @param uid - User's unique identifier
 * @param emailVerified - Boolean indicating if email is verified
 */
export const updateEmailVerification = async (uid: string, emailVerified: boolean) => {
  try {
    await auth.updateUser(uid, { emailVerified });
    return true;
  } catch (error) {
    console.error('Error updating email verification:', error);
    return false;
  }
};

/**
 * Creates a custom token for a user
 * @param uid - User's unique identifier
 * @param additionalClaims - Optional additional claims to include
 */
export const createCustomToken = async (uid: string, additionalClaims?: object) => {
  try {
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    return null;
  }
};

/**
 * Deletes a user account
 * @param uid - User's unique identifier
 */
export const deleteUser = async (uid: string) => {
  try {
    await auth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export { serverApp, auth };