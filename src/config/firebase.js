// src/config/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDGxej-jKVfpDnrldy5iJIo1xpmcyXjzKc",
  authDomain: "upi-preloved-app.firebaseapp.com",
  projectId: "upi-preloved-app",
  storageBucket: "upi-preloved-app.firebasestorage.app",
  messagingSenderId: "996352318617",
  appId: "1:996352318617:web:eb01be026f6e2287a16c08"
};

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Auth dengan anti-error Fast Refresh
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}

// Initialize Firestore dengan anti-error Fast Refresh dan Long Polling
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true
  });
} catch (e) {
  db = getFirestore(app);
}

export { auth, db };
export default app;
