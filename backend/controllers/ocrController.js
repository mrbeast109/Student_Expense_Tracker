import { extractTextFromImage, parseReceiptText, hashReceiptImage } from "../utils/ocrService.js";
import { classifyExpense } from "../utils/categoryClassifier.js";
import Expense from "../models/Expense.js";
import GroupBill from "../models/GroupBill.js";

export const scanReceipt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No receipt image uploaded" });

    const imageBuffer = req.file.buffer;
    const receiptHash = hashReceiptImage(imageBuffer);

    const [duplicateExpense, duplicateGroupBill] = await Promise.all([
      Expense.findOne({ receiptHash, user: req.user._id }),
      req.body.groupId
        ? GroupBill.findOne({ receiptHash, group: req.body.groupId })
        : Promise.resolve(null),
    ]);

    const { text, confidence } = await extractTextFromImage(imageBuffer);
    console.log("--- RAW OCR TEXT ---\n", text, "\n--- END OCR TEXT ---");
    const parsed = parseReceiptText(text);
    console.log(`Parsed: merchant="${parsed.merchant}", items=${parsed.items.length}`, parsed.items);
    const category = classifyExpense(parsed.merchant, parsed.items.map((i) => i.name));

    res.json({
      ...parsed,
      category,
      ocrConfidence: confidence,
      receiptHash,
      isDuplicate: !!(duplicateExpense || duplicateGroupBill),
      duplicateWarning: duplicateExpense
        ? "You already logged this exact receipt as a personal expense."
        : duplicateGroupBill
        ? `This receipt was already added to this group by another member (bill: "${duplicateGroupBill.description}").`
        : null,
    });
  } catch (err) {
    console.error("OCR scan error:", err);
    res.status(500).json({ message: "Failed to process receipt", error: err.message });
  }
};
