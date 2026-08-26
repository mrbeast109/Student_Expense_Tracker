import multer from "multer";

// Receipts are processed in-memory (buffer) and never written to disk on
// the server — they go straight to the OCR engine. If you want to keep
// a copy of the receipt image for the user's records, upload it to
// Firebase Storage from the frontend and just pass the resulting URL
// (receiptImageUrl) alongside the parsed data.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});
