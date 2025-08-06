import { auth } from "./config";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { signInServer } from "@/app/signin/action";
import { FirebaseError } from "firebase/app";

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);

    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      throw new Error("No credential found");
    }
    const idToken = await result.user.getIdToken();
    if (!idToken) {
      throw new Error("No idToken found");
    }
    if (!result.user.displayName || !result.user.email)
      throw new Error("Name or Email not found");
    await signInServer(idToken, {
      avatar: result.user.photoURL || undefined,
      name: result.user.displayName,
      email: result.user.email,
    });
  } catch (error) {
    console.error(error);
  }
};

const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await result.user.getIdToken();
  if (result.user.emailVerified != true) {
    new Promise(async (resolve, reject) => {
      try {
        await sendEmailVerification(result.user);
        resolve(true);
      } catch {
        reject(false);
      }
    });
  }
  if (!idToken) {
    throw new Error("No idToken found");
  }
  await signInServer(idToken, {
    avatar: result.user.photoURL || undefined,
    name: result.user.displayName || "",
    email: result.user.email || "",
  });
};

const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    new Promise(async (resolve, reject) => {
      try {
        await sendEmailVerification(result.user);
        resolve(true);
      } catch {
        reject(false);
      }
    });
    if (!idToken) {
      throw new Error("No idToken found");
    }
    await signInServer(idToken, {
      avatar: result.user.photoURL || undefined,
      name: name || "",
      email: result.user.email || "",
    });
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Email already in use");
      }
    }
  }
};

const sendVerificationLink = async () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          try {
            await sendEmailVerification(user);
            resolve(true);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
};

const checkVerified = async (): Promise<Boolean> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
};

export {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  checkVerified,
  sendVerificationLink,
};
