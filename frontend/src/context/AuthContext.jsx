import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        try {
          const { data } = await api.get("/users/me");
          setProfile(data);
        } catch (err) {
          console.error("Failed to load profile:", err);
        }
        setLoading(false);
      } else {
        const demoUserRaw = localStorage.getItem("campuspay_demo_user");
        if (demoUserRaw) {
          try {
            const demoUser = JSON.parse(demoUserRaw);
            const mockUser = {
              uid: "demo-" + btoa(demoUser.email),
              email: demoUser.email,
              displayName: demoUser.name || demoUser.email.split("@")[0],
              getIdToken: async () => "demo-token-" + demoUser.email,
            };
            setFirebaseUser(mockUser);
            const { data } = await api.get("/users/me", {
              headers: { Authorization: `Bearer demo-token-${demoUser.email}` },
            });
            setProfile(data);
          } catch (err) {
            console.error("Failed to load demo profile:", err);
            localStorage.removeItem("campuspay_demo_user");
            setProfile(null);
            setFirebaseUser(null);
          }
        } else {
          setProfile(null);
          setFirebaseUser(null);
        }
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const loginDemo = async (email, name) => {
    const userEmail = email || "student@campuspay.edu";
    const userName = name || userEmail.split("@")[0];
    const mockUser = {
      uid: "demo-" + btoa(userEmail),
      email: userEmail,
      displayName: userName,
      getIdToken: async () => "demo-token-" + userEmail,
    };
    localStorage.setItem("campuspay_demo_user", JSON.stringify({ name: userName, email: userEmail }));
    setFirebaseUser(mockUser);
    const { data } = await api.get("/users/me", {
      headers: { Authorization: `Bearer demo-token-${userEmail}` },
    });
    setProfile(data);
    return { user: mockUser };
  };

  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === "auth/configuration-not-found") {
        return await loginDemo(email);
      }
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      return cred;
    } catch (err) {
      if (err.code === "auth/configuration-not-found") {
        return await loginDemo(email, name);
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === "auth/configuration-not-found") {
        return await loginDemo("google-student@campuspay.edu", "Demo Student");
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("campuspay_demo_user");
    setProfile(null);
    setFirebaseUser(null);
    return signOut(auth);
  };

  const refreshProfile = async () => {
    const { data } = await api.get("/users/me");
    setProfile(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, profile, loading, login, signup, loginWithGoogle, loginDemo, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
