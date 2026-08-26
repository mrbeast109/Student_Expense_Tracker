import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : null;

    if (
      privateKey &&
      !privateKey.includes("YOUR_KEY_HERE") &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      !process.env.FIREBASE_CLIENT_EMAIL.includes("your-service-account")
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "expense-manager-c7384",
      });
    }
  } catch (err) {
    console.warn("Firebase Admin initialization warning:", err.message);
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "expense-manager-c7384",
    });
  }
}

export default admin;
