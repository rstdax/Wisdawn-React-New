import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBTlK9k9j4NGLcozwBzqiSkuTPlm5ZM4m8",
  authDomain: "wisdawn-official.firebaseapp.com",
  projectId: "wisdawn-official",
  storageBucket: "wisdawn-official.firebasestorage.app",
  messagingSenderId: "1009283394364",
  appId: "1:1009283394364:web:12de623dd94a0a2510cc39",
  measurementId: "G-WZZHRFPNRZ",
};

// Prevent duplicate app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
