import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getSummary,
  getSavingsSuggestions,
} from "../controllers/expenseController.js";

const router = express.Router();

router.use(protect);
router.get("/summary", getSummary);
router.get("/savings-suggestions", getSavingsSuggestions);
router.route("/").get(getExpenses).post(createExpense);
router.route("/:id").put(updateExpense).delete(deleteExpense);

export default router;
