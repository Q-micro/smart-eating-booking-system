// src/firebase.js
import { initializeApp } from "firebase/app";

import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firestore (added, does NOT break RTDB)
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  databaseURL:
    "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);

// Realtime Database (THIS is your main DB)
export const db = getDatabase(app);

// Firestore (available for later, not required now)
export const firestore = getFirestore(app);

