/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoFDF9UO-ftUWKRndy8-G8GF7Oqstb8G0",
  authDomain: "asynclangai.firebaseapp.com",
  projectId: "asynclangai",
  storageBucket: "asynclangai.firebasestorage.app",
  messagingSenderId: "311447053729",
  appId: "1:311447053729:web:529ad69f42f5c6d07397e0",
  measurementId: "G-MWQ4XWD6YE"
};

// Initialize Firebase
const app = !getApps.length? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);