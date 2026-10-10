/**
 * TenderAI Authentication Context
 * Manages Firebase Auth state, Google Sign-in, Email/Password login & registration, and user profiles
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  authErrorCode: string | null;
  setAuthError: (err: string | null, code?: string | null) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => {
    setAuthError(null);
    setAuthErrorCode(null);
  };

  const setExplicitError = (err: string | null, code: string | null = null) => {
    setAuthError(err);
    setAuthErrorCode(code);
  };

  const signInWithGoogle = async () => {
    clearAuthError();
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      const code = err.code || '';
      setAuthErrorCode(code);
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled: The Google popup window was closed before completing sign-in.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setAuthError(err.message || 'Failed to authenticate with Google.');
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    clearAuthError();
    const sanitizedEmail = email.trim();
    if (!sanitizedEmail) {
      setExplicitError('Please enter a valid email address.', 'validation/empty-email');
      return;
    }
    if (!pass) {
      setExplicitError('Please enter your password.', 'validation/empty-password');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, sanitizedEmail, pass);
    } catch (err: any) {
      console.error('Email login error:', err);
      const code = err.code || '';
      setAuthErrorCode(code);
      if (code === 'auth/operation-not-allowed') {
        setAuthError('Email/Password provider is not yet enabled in this Firebase project. You can enable it in the Firebase Console or continue with Google Sign-in.');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password. Please verify your credentials or use "Continue with Google".');
      } else if (code === 'auth/invalid-email') {
        setAuthError('The email address entered is not valid.');
      } else if (code === 'auth/too-many-requests') {
        setAuthError('Access temporarily blocked due to multiple failed attempts. Please wait a moment or sign in with Google.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    clearAuthError();
    const sanitizedEmail = email.trim();
    if (!sanitizedEmail) {
      setExplicitError('Please enter a valid email address.', 'validation/empty-email');
      return;
    }
    if (!pass || pass.length < 6) {
      setExplicitError('Password must be at least 6 characters long.', 'auth/weak-password');
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, sanitizedEmail, pass);
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName });
      }
    } catch (err: any) {
      console.error('Email registration error:', err);
      const code = err.code || '';
      setAuthErrorCode(code);
      if (code === 'auth/operation-not-allowed') {
        setAuthError('Email/Password provider is not yet enabled in this Firebase project. To enable it, turn on "Email/Password" in Firebase Console, or use "Continue with Google" for instant access.');
      } else if (code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists. Switch to "Sign In" tab or use "Continue with Google".');
      } else if (code === 'auth/weak-password') {
        setAuthError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setAuthError('The email address format is invalid.');
      } else {
        setAuthError(err.message || 'Registration failed. Please check the details and try again.');
      }
      throw err;
    }
  };

  const logout = async () => {
    clearAuthError();
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout error:', err);
      setExplicitError('Failed to sign out.', 'auth/logout-failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      authError,
      authErrorCode,
      setAuthError: setExplicitError,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
