import Group from "../models/Group.js";
import GroupBill from "../models/GroupBill.js";
import Settlement from "../models/Settlement.js";
import User from "../models/User.js";
import { computeBalancesFromBills, simplifyDebts } from "../utils/settleDebts.js";
import { buildUpiLink } from "../utils/upiLink.js";

export const getSimplifiedSettlements = async (req, res) => {
  const group = await Group.findOne({ _id: req.params.groupId, members: req.user._id }).populate(
    "members",
    "name email photoURL upiId"
  );
  if (!group) return res.status(404).json({ message: "Group not found" });

  const bills = await GroupBill.find({ group: group._id });
  const balances = computeBalancesFromBills(bills);

  const priorSettlements = await Settlement.find({ group: group._id, status: { $ne: "pending" } });
  for (const s of priorSettlements) {
    balances[s.from.toString()] = (balances[s.from.toString()] || 0) + s.amountPaid;
    balances[s.to.toString()] = (balances[s.to.toString()] || 0) - s.amountPaid;
  }

  const transactions = simplifyDebts(balances);

  const memberMap = Object.fromEntries(group.members.map((m) => [m._id.toString(), m]));

  const enriched = transactions.map((t) => ({
    from: memberMap[t.from],
    to: memberMap[t.to],
    amount: t.amount,
    upiLink: memberMap[t.to]?.upiId
      ? buildUpiLink({
          payeeUpiId: memberMap[t.to].upiId,
          payeeName: memberMap[t.to].name,
          amount: t.amount,
          note: `${group.name} settlement`,
        })
      : null,
  }));

  res.json({ balances, transactions: enriched });
};

export const recordSettlement = async (req, res) => {
  const group = await Group.findOne({ _id: req.params.groupId, members: req.user._id });
  if (!group) return res.status(404).json({ message: "Group not found" });

  const { from, to, amount, status } = req.body;

  const settlement = await Settlement.create({
    group: group._id,
    from,
    to,
    amount,
    amountPaid: amount,
    status: status || "paid",
    settledAt: status === "paid" ? new Date() : null,
  });

  res.status(201).json(settlement);
};

export const getSettlementHistory = async (req, res) => {
  const group = await Group.findOne({ _id: req.params.groupId, members: req.user._id });
  if (!group) return res.status(404).json({ message: "Group not found" });

  const settlements = await Settlement.find({ group: group._id })
    .populate("from to", "name email photoURL")
    .sort({ createdAt: -1 });

  res.json(settlements);
};
