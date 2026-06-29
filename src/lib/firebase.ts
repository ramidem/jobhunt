import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import type { ResumeMessage } from "@/lib/resume-schema";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every(Boolean);
}

function getFirebaseApp(): FirebaseApp {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  return initializeApp(firebaseConfig);
}

export async function saveResumeMessage(message: ResumeMessage) {
  if (!isFirebaseConfigured()) {
    return { stored: false, reason: "firebase_not_configured" as const };
  }

  const db = getFirestore(getFirebaseApp());
  const docRef = await addDoc(collection(db, "resumeMessages"), {
    ...message,
    createdAt: serverTimestamp(),
    status: "new",
    source: "resume_site",
  });

  return { stored: true, id: docRef.id };
}
