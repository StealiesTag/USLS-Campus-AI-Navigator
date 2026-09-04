import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, onAuthStateChanged, signInWithGoogle, signOutUser, checkRedirectAuth } from "../lib/firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  rawUser: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawUser, setRawUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if redirected from sign in
    checkRedirectAuth().catch((err) => {
      console.error("Redirect auth check failure:", err);
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setRawUser(currentUser);
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Campus User",
            photoURL: currentUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Auth state listener error:", err);
        setError("Failed to establish authentication listener. Please refresh.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        console.error("Sign in error:", err);
        setError(err?.message || "Google sign-in failed. Please check your connection and popup permissions.");
      }
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOutUser();
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError(err?.message || "Failed to sign out.");
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, rawUser, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
