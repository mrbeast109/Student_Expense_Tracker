import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMe, updateMe } from "../controllers/userController.js";

const router = express.Router();

router.use(protect);
router.get("/me", getMe);
router.put("/me", updateMe);

export default router;
