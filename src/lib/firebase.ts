import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "ace-interview-omyob",
  "appId": "1:688484293087:web:2fbb644ea9b5ce0fec0c6a",
  "storageBucket": "ace-interview-omyob.firebasestorage.app",
  "apiKey": "AIzaSyCAP0S2Pc-bvPTKvuQeQiUGgOExhBcf10w",
  "authDomain": "ace-interview-omyob.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "688484293087"
};


// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
