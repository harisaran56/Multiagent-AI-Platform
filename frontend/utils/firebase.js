// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-fe1bd.firebaseapp.com",
  projectId: "cortexai-fe1bd",
  storageBucket: "cortexai-fe1bd.firebasestorage.app",
  messagingSenderId: "518372652666",
  appId: "1:518372652666:web:08ef54d533023fe98cedc3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize the Google Auth Provider
export const googleProvider = new GoogleAuthProvider();