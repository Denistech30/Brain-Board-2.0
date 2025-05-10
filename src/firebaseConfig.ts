import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBbYAFiKF0yAX5WbscREJMI19kWP_dSLJ0",
  authDomain: "brainboard-wep.firebaseapp.com",
  projectId: "brainboard-wep",
  storageBucket: "brainboard-wep.firebasestorage.app",
  messagingSenderId: "188638634680",
  appId: "1:188638634680:web:3258a521097badb0dc0a4d",
  measurementId: "G-RYZDW1XBD9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;