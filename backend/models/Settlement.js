import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "partial", "paid"], default: "pending" },
    amountPaid: { type: Number, default: 0 },
    settledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Settlement", settlementSchema);
