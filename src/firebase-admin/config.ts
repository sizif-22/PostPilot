import * as admin from "firebase-admin";
import { getAuth, Auth, DecodedIdToken } from "firebase-admin/auth";

let serverApp: admin.app.App;

if (admin.apps.length === 0) {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  const missingEnv = (name: string) =>
    `Environment variable ${name} is required to initialize Firebase Admin SDK`;

  if (!projectId) {
    throw new Error(missingEnv("NEXT_PUBLIC_PROJECT_ID"));
  }
  if (!clientEmail) {
    throw new Error(missingEnv("FIREBASE_CLIENT_EMAIL"));
  }
  if (!privateKey) {
    throw new Error(missingEnv("FIREBASE_PRIVATE_KEY"));
  }

  // Handle newline-escaped private key stored in env vars (common on platforms like Vercel)
  const parsedKey = privateKey.includes("\\n")
    ? privateKey.replace(/\\n/g, "\n")
    : privateKey;

  // Sanity check: warn if the key doesn't look like a PEM private key
  if (!parsedKey.includes("-----BEGIN PRIVATE KEY-----")) {
    console.warn(
      "FIREBASE_PRIVATE_KEY does not look like a PEM private key. If you stored the key in an environment variable, ensure it's the private_key value from the JSON service account key and that newlines are preserved.",
    );
  }

  try {
    serverApp = admin.initializeApp({
      projectId: projectId,
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: parsedKey,
      }),
    });
  } catch (initError) {
    // Improve error diagnostics for the common "invalid_grant: Invalid JWT" issue
    console.error("Failed to initialize Firebase Admin SDK:", initError);
    console.error(
      "Possible causes:\n" +
        " - Server time is out of sync. Ensure your server's clock is correct (use NTP/chrony). Time skew can cause 'invalid_grant: Invalid JWT' errors.\n" +
        " - The service account key has been revoked or is invalid. Check the service account in the Firebase/Google Cloud Console and re-create a key if needed.\n" +
        " - The PRIVATE_KEY environment variable is malformed (missing newlines or truncated). Ensure you set the exact 'private_key' value from the JSON key and that '\\n' sequences are properly unescaped.\n" +
        "Suggested actions:\n" +
        " 1) Re-sync server time (e.g. install and run ntpd/chronyd or use `sudo ntpdate pool.ntp.org`).\n" +
        " 2) Verify the service account and its keys in the Google Cloud Console (IAM & Admin -> Service Accounts -> Keys).\n" +
        " 3) Generate a new service account key from the Firebase Console and update your environment variables.\n",
    );
    throw initError;
  }
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
export const verifyIdToken = async (
  token: string,
): Promise<DecodedIdToken | null> => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return null;
  }
};

/**
 * Verifies a Firebase session cookie
 * @param sessionCookie - The Firebase session cookie to verify
 * @param checkRevoked - Whether to check if the token has been revoked
 * @returns Promise<DecodedIdToken | null> - The decoded token or null if verification fails
 */
export const verifySessionCookie = async (
  sessionCookie: string,
  checkRevoked: boolean = true,
): Promise<DecodedIdToken | null> => {
  try {
    const decodedToken = await auth.verifySessionCookie(
      sessionCookie,
      checkRevoked,
    );
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase session cookie:", error);
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
    console.error("Error fetching user by UID:", error);
    return null;
  }
};

/**
 * Updates user's email verification status
 * @param uid - User's unique identifier
 * @param emailVerified - Boolean indicating if email is verified
 */
export const updateEmailVerification = async (
  uid: string,
  emailVerified: boolean,
) => {
  try {
    await auth.updateUser(uid, { emailVerified });
    return true;
  } catch (error) {
    console.error("Error updating email verification:", error);
    return false;
  }
};

/**
 * Creates a custom token for a user
 * @param uid - User's unique identifier
 * @param additionalClaims - Optional additional claims to include
 */
export const createCustomToken = async (
  uid: string,
  additionalClaims?: object,
) => {
  try {
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error("Error creating custom token:", error);
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
    console.error("Error deleting user:", error);
    return false;
  }
};

export { serverApp, auth };
