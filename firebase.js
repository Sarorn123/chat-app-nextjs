import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbIQX12wSCETQRnxMN7BNp2bplEDjSeUY",
  authDomain: "chat-app-next-ec874.firebaseapp.com",
  projectId: "chat-app-next-ec874",
  storageBucket: "chat-app-next-ec874.appspot.com",
  messagingSenderId: "337754918337",
  appId: "1:337754918337:web:45246b70b10d50c80ab340",
  measurementId: "G-HP4HN5CE2M",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider();
export { db, auth, provider };
