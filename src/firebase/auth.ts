import { auth, db } from "./config";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import Cookies from "js-cookie";
import { addUser, User } from "@/firebase/user.firestore";

const addUserWithGoogle = async () => {
     const provider = new GoogleAuthProvider();
     try {
       const result = await signInWithPopup(auth, provider);
       const credential = GoogleAuthProvider.credentialFromResult(result);
       if (!credential) {
        throw new Error("No credential found");
       }
       const token:string | undefined = credential.accessToken;
       const user = result.user;
       if (!token) {
        throw new Error("No token found");
       }
       Cookies.set("postPilotUserCookie", token, { expires: 30 });
   
       // Check if the user already exists in Firestore
       const userQuery = query(
         collection(db, "Users"),
         where("email", "==", user.email)
       );
       const querySnapshot = await getDocs(userQuery);
       
       if (querySnapshot.empty) {
         const userData: User = {
           name: user.displayName || '',
           email: user.email || '',
           photoURL: user.photoURL || '',
           isLoggedIn: true,
           isVerified: user.emailVerified,
           channels: []
         };
         // If no user exists, add a new document
         await addUser(userData);
         console.log("New user added to Firestore.");
         window.location.reload();
       } else {
         console.log("User already exists in Firestore.");
       }
     } catch (error:any) {
       const errorCode = error.code;
       const errorMessage = error.message;
       const email = error.customData?.email;
       const credential = GoogleAuthProvider.credentialFromError(error);
       console.error("Error during sign-in:", errorCode, errorMessage, email);
     }  
     window.location.href = "/";
};

const addUserWithFacebook = async () => {
     const provider = new FacebookAuthProvider();
     try {
       const result = await signInWithPopup(auth, provider);
       const credential = FacebookAuthProvider.credentialFromResult(result);
       if(!credential){
          throw new Error("No credential found");
       }
       const token:string | undefined = credential.accessToken;
       const user = result.user;
       if(!token){
        throw new Error("No token found");
       }
       Cookies.set("postPilotUserCookie", token, { expires: 30 });
   
       // Check if the user already exists in Firestore
       const userQuery = query(
         collection(db, "Users"),
         where("email", "==", user.email)
       );
       const querySnapshot = await getDocs(userQuery);
   
       if (querySnapshot.empty) {
         // If no user exists, add a new document
         const userData: User = {
           name: user.displayName || '',
           email: user.email || '',
           photoURL: user.photoURL || '',
           isLoggedIn: true,
           isVerified: user.emailVerified,
           channels: []
         };
         await addUser(userData);
         console.log("New user added to Firestore.");
         window.location.reload();
       } else {
         console.log("User already exists in Firestore.");
       }
     } catch (error :any) {
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
     window.location.href = "/"; 
};

   const checkLoggedIn = async (): Promise<User | null> => {
     const token = Cookies?.get("postPilotUserCookie");
     if (token) {
       return new Promise((resolve) => {
         onAuthStateChanged(auth, (user) => {
           if (user) {
             resolve({
               name: user.displayName || '',
               email: user.email || '',
               photoURL: user.photoURL || '',
               isLoggedIn: true,
               isVerified: user.emailVerified,
               channels: []
             } as User);
           } else {
             resolve(null);
           }
         });
       });
     } else {
       return null;
     }
};
export { addUserWithGoogle, checkLoggedIn, addUserWithFacebook };
