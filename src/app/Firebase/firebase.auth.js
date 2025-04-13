import { auth, db } from "./firebase.config";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import Cookies from "js-cookie";

const addUser = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
    Cookies.set("postPilotUserCookie", token, { expires: 30 });

    // Check if the user already exists in Firestore
    const userQuery = query(
      collection(db, "user"),
      where("email", "==", user.email)
    );
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      // If no user exists, add a new document
      await addDoc(collection(db, "user"), {
        email: user.email,
        name: user.displayName,
        projects: [],
      });
      console.log("New user added to Firestore.");
    } else {
      console.log("User already exists in Firestore.");
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.error("Error during sign-in:", errorCode, errorMessage, email);
  }
};
const addUserWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
    Cookies.set("postPilotUserCookie", token, { expires: 30 });

    // Check if the user already exists in Firestore
    const userQuery = query(
      collection(db, "user"),
      where("email", "==", user.email)
    );
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      // If no user exists, add a new document
      await addDoc(collection(db, "user"), {
        email: user.email,
        name: user.displayName,
        projects: [],
      });
      console.log("New user added to Firestore.");
    } else {
      console.log("User already exists in Firestore.");
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = FacebookAuthProvider.credentialFromError(error);
    console.error(
      "Error during Facebook sign-in:",
      errorCode,
      errorMessage,
      email
    );
  }
};

const checkLoggedIn = async () => {
  const token = Cookies?.get("postPilotUserCookie");
  if (token) {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  } else {
    return false;
  }
};

export { addUser, checkLoggedIn, addUserWithFacebook };
