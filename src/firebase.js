// src/firebase.js
import { initializeApp } from "firebase/app";

import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firestore (added, does NOT break RTDB)
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7BL1NzNnlBHUsKjgEdkbIryIIpeRcS8E",
  authDomain: "seb-s-6bc29.firebaseapp.com",
  projectId: "seb-s-6bc29",
  databaseURL:
    "https://seb-s-6bc29-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "seb-s-6bc29.firebasestorage.app",
  messagingSenderId: "1019755761930",
  appId: "1:1019755761930:web:08022bb45c5f8f4f34aaf3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);

// Realtime Database (THIS is your main DB)
export const db = getDatabase(app);

// Firestore (available for later, not required now)
export const firestore = getFirestore(app);

