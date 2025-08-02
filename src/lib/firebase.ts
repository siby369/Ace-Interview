import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// This configuration is directly provided and is not sensitive.
// It's the recommended way to initialize Firebase on the client-side.
const firebaseConfig = {
  apiKey: "AIzaSyCAP0S2Pc-bvPTKvuQeQiUGgOExhBcf10w",
  authDomain: "ace-interview-omyob.firebaseapp.com",
  projectId: "ace-interview-omyob",
  storageBucket: "ace-interview-omyob.firebasestorage.app",
  messagingSenderId: "688484293087",
  appId: "1:688484293087:web:2fbb644ea9b5ce0fec0c6a",
};


// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
