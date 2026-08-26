import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createGroup, getMyGroups, getGroup, addMember, deleteGroup } from "../controllers/groupController.js";
import { createGroupBill, getGroupBills } from "../controllers/groupBillController.js";
import {
  getSimplifiedSettlements,
  recordSettlement,
  getSettlementHistory,
} from "../controllers/settlementController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getMyGroups).post(createGroup);
router.route("/:id").get(getGroup).delete(deleteGroup);
router.post("/:id/members", addMember);

router.route("/:groupId/bills").get(getGroupBills).post(createGroupBill);

router.get("/:groupId/settlements", getSimplifiedSettlements);
router.post("/:groupId/settlements", recordSettlement);
router.get("/:groupId/settlements/history", getSettlementHistory);

export default router;
