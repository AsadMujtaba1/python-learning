/**
 * Firebase Configuration
 * 
 * Complete Firebase setup with Authentication and Firestore
 * 
 * Setup instructions:
 * 1. Install Firebase: npm install firebase
 * 2. Create a Firebase project at https://console.firebase.google.com
 * 3. Enable Authentication (Email/Password and Anonymous)
 * 4. Enable Firestore Database
 * 5. Add your config to .env.local
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
  // Only initialize on client side
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    } catch (error) {
      console.warn('Firebase not initialized. Install with: npm install firebase');
    }
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  }
}

export { db, auth };
