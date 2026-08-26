import mongoose from "mongoose";

const splitEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const groupBillSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    description: { type: String, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalAmount: { type: Number, required: true },
    splitType: {
      type: String,
      enum: ["equal", "custom", "percentage", "itemized"],
      default: "equal",
    },
    splits: [splitEntrySchema],
    expense: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", default: null },
    receiptHash: { type: String, default: "", index: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("GroupBill", groupBillSchema);
