import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: true }
);

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    merchant: { type: String, default: "Unknown Merchant" },
    date: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    category: {
      type: String,
      enum: [
        "food",
        "travel",
        "stationery",
        "rent",
        "subscriptions",
        "groceries",
        "entertainment",
        "utilities",
        "health",
        "other",
      ],
      default: "other",
    },
    items: [itemSchema],
    source: { type: String, enum: ["manual", "ocr", "voice"], default: "manual" },
    receiptImageUrl: { type: String, default: "" },
    receiptHash: { type: String, default: "", index: true },
    ocrConfidence: { type: Number, default: null },
    ocrRawText: { type: String, default: "" },
    wasManuallyCorrected: { type: Boolean, default: false },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
