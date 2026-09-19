// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASZu8Xxpdv5PRRhkCIpsMqbuqoiVNL6ic",
  authDomain: "field-heatmap.firebaseapp.com",
  projectId: "field-heatmap",
  storageBucket: "field-heatmap.appspot.com", // Corrected field name
  messagingSenderId: "493975986036",
  appId: "1:493975986036:web:93b4abfff9cfa94eb31621",
  measurementId: "G-WBYBEJTY0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
// This is what your app will use to interact with the database
export const db = getFirestore(app);

// Same Firebase project as the mobile app, so signing in/up here creates or
// authenticates the exact same account (screens/LoginScreen.js uses this
// same email/password auth) — used by Crew.jsx's "Join Crew" flow so
// someone can accept an invite without leaving the browser.
export const auth = getAuth(app);
