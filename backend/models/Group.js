import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["roommates", "trip", "project", "mess", "other"],
      default: "other",
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    defaultCurrency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);
