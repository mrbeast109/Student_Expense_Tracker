import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { scanReceipt } from "../controllers/ocrController.js";

const router = express.Router();

router.use(protect);
router.post("/scan", upload.single("receipt"), scanReceipt);

export default router;
