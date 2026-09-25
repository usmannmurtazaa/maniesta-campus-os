import { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
// Helpers
// ------------------------------------------------------------------

/**
 * Build a fallback user object from a Firebase auth user.
 * Used when the Firestore profile cannot be fetched (offline, missing
 * document, permission error). Guarantees a consistent user shape
 * across the app.
 */
function buildFallbackUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || '',
    orgId: null,
    role: null,
  };
}

/**
 * Fetch the Firestore user profile, retrying once on transient
 * `unavailable` errors (which Firebase throws when the client is
 * reconnecting). Falls back to `null` if the profile cannot be
 * retrieved after retries.
 */
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
      return buildFallbackUser(firebaseUser);
    } catch (error) {
      // Only retry on genuine network errors.
      if (error.code === 'unavailable' && attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      console.warn('Could not fetch Firestore profile:', error.code);
      return null;
    }
  }
  return null;
}

/**
 * Map a Firebase Auth error code to a user-friendly message.
 * Pure function — safe to call from anywhere.
 */
function translateError(code) {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Invalid password.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window closed.';
    default:
      return 'An unexpected error occurred.';
  }
}

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth listener — fires on sign-in, sign-out, and on first load.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        setAuthUser(fbUser);
        const profile = await fetchUserProfile(fbUser);
        setUser(profile || buildFallbackUser(fbUser));
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
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      // The auth listener will fetch and set the full profile.
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

      // Small delay to let Firestore reconnect before fetching the profile.
      await new Promise(r => setTimeout(r, 1200));

      const profile = await fetchUserProfile(result.user);
      const finalUser = profile || buildFallbackUser(result.user);
      setUser(finalUser);
      setAuthUser(result.user);
      return { success: true, user: finalUser };
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
