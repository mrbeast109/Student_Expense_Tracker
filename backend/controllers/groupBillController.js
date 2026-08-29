import GroupBill from "../models/GroupBill.js";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import {
  calculateEqualSplit,
  calculateCustomSplit,
  calculatePercentageSplit,
  calculateItemizedSplit,
} from "../utils/splitCalculator.js";

export const createGroupBill = async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.groupId, members: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const memberIds = group.members.map((m) => m.toString());
    const {
      description,
      totalAmount,
      paidBy,
      splitType,
      customAmounts,
      percentages,
      items,
      tax,
      receiptImageUrl,
      receiptHash,
    } = req.body;

    const payer = paidBy || req.user._id.toString();
    if (!memberIds.includes(payer)) {
      return res.status(400).json({ message: "paidBy must be a group member" });
    }

    let splits;
    let linkedExpense = null;

    if (splitType === "equal" || splitType === "EQUAL") {
      splits = calculateEqualSplit(totalAmount, memberIds);
    } else if (splitType === "custom" || splitType === "CUSTOM") {
      splits = calculateCustomSplit(customAmounts);
    } else if (splitType === "percentage" || splitType === "PERCENTAGE") {
      splits = calculatePercentageSplit(totalAmount, percentages);
    } else if (splitType === "itemized" || splitType === "ITEMIZED") {
      splits = calculateItemizedSplit(items, tax || 0);

      linkedExpense = await Expense.create({
        user: req.user._id,
        merchant: description,
        totalAmount,
        tax: tax || 0,
        category: "food",
        items,
        source: "ocr",
        receiptImageUrl: receiptImageUrl || "",
        receiptHash: receiptHash || "",
        group: group._id,
      });
    } else {
      return res.status(400).json({ message: "Invalid splitType" });
    }

    const bill = await GroupBill.create({
      group: group._id,
      description,
      paidBy: payer,
      totalAmount,
      splitType,
      splits,
      expense: linkedExpense?._id || null,
      receiptHash: receiptHash || "",
    });

    res.status(201).json(await bill.populate("paidBy splits.user", "name email photoURL"));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getGroupBills = async (req, res) => {
  const group = await Group.findOne({ _id: req.params.groupId, members: req.user._id });
  if (!group) return res.status(404).json({ message: "Group not found" });

  const bills = await GroupBill.find({ group: group._id })
    .populate("paidBy", "name email photoURL")
    .populate("splits.user", "name email photoURL")
    .populate("expense")
    .sort({ date: -1 });

  res.json(bills);
};
