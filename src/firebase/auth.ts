import { auth } from "./config";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { signInServer } from "@/app/home/action";

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
      name: result.user.displayName,
      email: result.user.email,
    });
  } catch (error) {
    console.error(error);
  }
};




export { signInWithGoogle };
