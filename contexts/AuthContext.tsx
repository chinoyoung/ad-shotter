"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  Auth,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setCookie, deleteCookie } from "cookies-next";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // Only allow @goabroad.com emails
        if (authUser.email?.endsWith("@goabroad.com")) {
          setUser(authUser);

          // Set cookies for middleware authentication check
          setCookie("firebase-auth-token", true, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          });

          // Set user email in cookie for domain check in middleware
          if (authUser.email) {
            setCookie("user-email", authUser.email, {
              maxAge: 30 * 24 * 60 * 60,
              path: "/",
            });
          }
        } else {
          // Sign out users with non-goabroad emails
          firebaseSignOut(auth).then(() => {
            setUser(null);
            deleteCookie("firebase-auth-token");
            deleteCookie("user-email");
          });
        }
      } else {
        setUser(null);
        // Clean up cookies on sign out
        deleteCookie("firebase-auth-token");
        deleteCookie("user-email");
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      // Force account selection to avoid silent sign-in with cached account
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verify email domain
      if (!user.email?.endsWith("@goabroad.com")) {
        await firebaseSignOut(auth);
        alert("Only @goabroad.com email addresses are allowed.");
        setUser(null);
        deleteCookie("firebase-auth-token");
        deleteCookie("user-email");
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clean up cookies on sign out
      deleteCookie("firebase-auth-token");
      deleteCookie("user-email");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
