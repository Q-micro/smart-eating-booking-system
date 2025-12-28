// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get, onValue } from "firebase/database";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { uid, email, name, role, ... }
  const [initializing, setInitializing] = useState(true);

  // Optional manual refresh (useful for debugging)
  const refreshUser = async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) {
      setUser(null);
      return;
    }

    try {
      const snap = await get(ref(db
, `users/${fbUser.uid}`));
      const profile = snap.val() || {};

      // Spread profile first, then override with safe defaults
      setUser({
        ...profile,
        uid: fbUser.uid,
        email: fbUser.email,
        name: profile.name ?? fbUser.displayName ?? "",
        role: profile.role ?? "customer",
      });
    } catch (err) {
      console.error("Error refreshing user profile:", err);
    }
  };

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean old listener when user changes/logs out
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setInitializing(false);
        return;
      }

      // Live listen to RTDB user profile so role updates instantly
      const userRef = ref(db
, `users/${firebaseUser.uid}`);
      unsubscribeProfile = onValue(
        userRef,
        (snap) => {
          const profile = snap.val() || {};

          setUser({
            ...profile, // put first so our computed fields win
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile.name ?? firebaseUser.displayName ?? "",
            role: profile.role ?? "customer",
          });

          setInitializing(false);
        },
        (err) => {
          console.error("Error listening to user profile:", err);
          // Fallback if RTDB read fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName ?? "",
            role: "customer",
          });
          setInitializing(false);
        }
      );
    });

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, initializing, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
