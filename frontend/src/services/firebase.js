import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Validate keys
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missing = requiredKeys.filter(
  (key) => !firebaseConfig[key] || String(firebaseConfig[key]).trim() === ''
);
if (missing.length > 0) {
  throw new Error(
    `Firebase configuration error: missing or empty environment variables: ${missing.join(', ')}. Check your .env file or Netlify environment settings.`
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Temporarily no persistence – keeps the client online as much as possible
export const db = getFirestore(app);
export const storage = getStorage(app);

// Emulator support
if (process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('Firebase emulators connected.');
}

export default app;