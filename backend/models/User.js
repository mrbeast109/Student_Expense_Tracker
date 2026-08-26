import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    photoURL: { type: String, default: "" },
    upiId: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    monthlyBudget: { type: Number, default: 0 },
    categoryBudgets: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
