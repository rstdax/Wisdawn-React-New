import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ─── Separate Firebase App instance for Admin Auth ────────────────────────────
// This runs completely independently from the student-facing auth (firebase.ts).
// Admin login/logout does NOT affect the student's session at all.

const firebaseConfig = {
  apiKey: "AIzaSyBTlK9k9j4NGLcozwBzqiSkuTPlm5ZM4m8",
  authDomain: "wisdawn-official.firebaseapp.com",
  databaseURL: "https://wisdawn-official-default-rtdb.firebaseio.com",
  projectId: "wisdawn-official",
  storageBucket: "wisdawn-official.firebasestorage.app",
  messagingSenderId: "1009283394364",
  appId: "1:1009283394364:web:12de623dd94a0a2510cc39",
  measurementId: "G-WZZHRFPNRZ",
};

// Named "admin-app" so it stays separate from the default "" app used by students
const adminApp =
  getApps().find((a) => a.name === "admin-app") ??
  initializeApp(firebaseConfig, "admin-app");

// Dedicated auth instance — completely separate session from student auth
export const adminAuth = getAuth(adminApp);
