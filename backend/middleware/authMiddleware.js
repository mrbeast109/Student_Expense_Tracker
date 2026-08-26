import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "No auth token provided" });
    }

    let decoded;
    if (token.startsWith("demo-token-")) {
      const demoEmail = token.replace("demo-token-", "");
      decoded = {
        uid: "demo-" + Buffer.from(demoEmail).toString("hex"),
        email: demoEmail,
        name: demoEmail.split("@")[0],
      };
    } else {
      decoded = await admin.auth().verifyIdToken(token);
    }

    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || decoded.email?.split("@")[0] || "Student",
        email: decoded.email,
        photoURL: decoded.picture || "",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
