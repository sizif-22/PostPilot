"use client";
import store from "../Redux/store";
import { Provider } from "react-redux";
import { useState, useEffect } from "react";
import Loading from "./loading";
import { useDispatch } from "react-redux";
import { auth, db } from "./Firebase/firebase.config";
import { checkLoggedIn } from "./Firebase/firebase.auth";
import { handleUserState } from "../Redux/user.data";
import * as firestore from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const SubLayout = ({ child }) => {
  return (
    <Provider store={store}>
      <SubLayout2 child={child} />
    </Provider>
  );
};

const SubLayout2 = ({ child }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    const isLoggedIn = await checkLoggedIn();
    if (isLoggedIn && auth.currentUser) {
      try {
        const userRef = firestore.query(
          firestore.collection(db, "user"),
          firestore.where("email", "==", auth.currentUser.email)
        );

        const unsubscribeFirestore = firestore.onSnapshot(
          userRef,
          async (querySnapshot) => {
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const user = userDoc.data();
              const userObject = {
                isLoggedIn,
                email: user.email,
                userId: userDoc.id,
                name: user.name,
                projects: [...user.projects],
              };
              dispatch(handleUserState(userObject));
            } else {
              console.log("No user document found");
            }
            if (loading) setLoading(false);
          }
        );

        const unsubscribeAuth = onAuthStateChanged(getAuth(), (user) => {
          if (user) {
            dispatch(
              handleUserState({
                isLoggedIn: true,
                isVerified: user.emailVerified,
              })
            );
          }
        });

        return () => {
          unsubscribeFirestore();
          unsubscribeAuth();
        };
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        setLoading(false);
      }
    } else {
      dispatch(handleUserState({ isLoggedIn: false }));
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchUserData();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return loading ? <Loading /> : <>{child}</>;
};

export default SubLayout;
