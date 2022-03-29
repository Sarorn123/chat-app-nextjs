import React, { useEffect, useState } from "react";
import Chat from "../chat";
import { auth } from "../../firebase";
import Login from "./login";
import { db } from "../../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const Loading = () => {
  return <h1>Loading...</h1>;
};

function Auth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    return auth.onIdTokenChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userData = {
        username: user.displayName,
        email: user.email,
        avatar: user.photoURL,
        lastSeen: serverTimestamp(),
      };
      await setDoc(doc(db, "users", user.uid), userData);
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loading />;
  } else if (!currentUser) {
    return <Login />;
  } else if (currentUser) {
    return <Chat currentUser={currentUser} />;
  }
}
export default Auth;
