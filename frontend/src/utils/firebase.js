import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "multi-ai-e4031.firebaseapp.com",
  projectId: "multi-ai-e4031",
  storageBucket: "multi-ai-e4031.firebasestorage.app",
  messagingSenderId: "355978485261",
  appId: "1:355978485261:web:bbf9f6a38d648642227f44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth, provider}