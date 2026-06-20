import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ------------------------------------------------------------------
// Helper: fetch Firestore profile – retries once if “unavailable”
// ------------------------------------------------------------------
async function fetchUserProfile(firebaseUser, retries = 2) {
  if (!firebaseUser) return null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (snap.exists()) {
        const p = snap.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || p.displayName || '',
          photoURL: firebaseUser.photoURL || p.avatarURL || '',
          orgId: p.orgId || null,
          role: p.role || null,
        };
      }
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        orgId: null,
        role: null,
      };
    } catch (error) {
      // Only retry on genuine network errors
      if (error.code === 'unavailable' && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      console.warn('Could not fetch Firestore profile:', error.code);
      return null;
    }
  }
  return null;
}

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setAuthUser(fbUser);
        const profile = await fetchUserProfile(fbUser);
        if (profile) {
          setUser(profile);
        } else {
          // Fallback – use raw auth user
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || '',
            photoURL: fbUser.photoURL || '',
            orgId: null,
            role: null,
          });
        }
      } else {
        setAuthUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      // Let the auth listener fetch the profile
      return { success: true, user: auth.currentUser };
    } catch (error) {
      const msg = translateError(error.code);
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success('Signed in with Google!');

      // Small delay for Firestore reconnection
      await new Promise((r) => setTimeout(r, 1200));

      const profile = await fetchUserProfile(result.user);
      if (profile) {
        setUser(profile);
        setAuthUser(result.user);
        return { success: true, user: profile };
      }

      // Fallback
      const basicUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        orgId: null,
        role: null,
      };
      setUser(basicUser);
      setAuthUser(result.user);
      return { success: true, user: basicUser };
    } catch (error) {
      const msg = translateError(error.code);
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created!');
      return { success: true, user: auth.currentUser };
    } catch (error) {
      const msg = translateError(error.code);
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    const profile = await fetchUserProfile(auth.currentUser);
    if (profile) setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  function translateError(code) {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Invalid password.';
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/email-already-in-use': return 'An account with this email already exists.';
      case 'auth/weak-password': return 'Password should be at least 6 characters.';
      case 'auth/popup-closed-by-user': return 'Sign‑in window closed.';
      default: return 'An unexpected error occurred.';
    }
  }

  const value = {
    user,
    authUser,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};