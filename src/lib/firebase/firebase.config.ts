// firebase.config.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: "mind-merge-ecfae.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: "https://mind-merge-ecfae-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
