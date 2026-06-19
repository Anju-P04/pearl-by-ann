import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCO7OKFfKF8TjwXVYjptP0g1SISuDdJHt4",
  authDomain: "pearlbyann-32d78.firebaseapp.com",
  projectId: "pearlbyann-32d78",
  storageBucket: "pearlbyann-32d78.firebasestorage.app",
  messagingSenderId: "744891402199",
  appId: "1:744891402199:web:94d65146b09e95836dad92",
  measurementId: "G-MNVSMLV3K4",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;