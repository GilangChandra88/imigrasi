import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA8k9rhWPu8_2RDwUeACnniC1Tkk60K5D0",
  authDomain: "imigrasi-database.firebaseapp.com",
  projectId: "imigrasi-database",
  storageBucket: "imigrasi-database.firebasestorage.app",
  messagingSenderId: "177344942207",
  appId: "1:177344942207:web:0a97982caf92652e42ef4a",
  measurementId: "G-ZXFMJMD6MX"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "imigrasi");
console.log("Firebase DB Initialized with ID:", db.type === 'firestore' ? db._databaseId?.database : "unknown", "or", "imigrasi");
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
