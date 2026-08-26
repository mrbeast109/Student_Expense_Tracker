import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAeWCUhIDZgDcxJhgQlAf8-d1qHEPhWrvY",
  authDomain: "expense-manager-c7384.firebaseapp.com",
  projectId: "expense-manager-c7384",
  storageBucket: "expense-manager-c7384.firebasestorage.app",
  messagingSenderId: "301863631064",
  appId: "1:301863631064:web:ef1c9a94c222d10ce7ffad",
  measurementId: "G-8V21L152SZ",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
