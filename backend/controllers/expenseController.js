import Expense from "../models/Expense.js";
import { classifyExpense } from "../utils/categoryClassifier.js";
import { generateSavingsSuggestions } from "../utils/savingsSuggestions.js";

export const createExpense = async (req, res) => {
  try {
    const { merchant, date, totalAmount, tax, category, items, source, receiptImageUrl, wasManuallyCorrected } =
      req.body;

    const finalCategory =
      category || classifyExpense(merchant, (items || []).map((i) => i.name));

    const expense = await Expense.create({
      user: req.user._id,
      merchant,
      date: date || Date.now(),
      totalAmount,
      tax: tax || 0,
      category: finalCategory,
      items: items || [],
      source: source || "manual",
      receiptImageUrl: receiptImageUrl || "",
      wasManuallyCorrected: !!wasManuallyCorrected,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getExpenses = async (req, res) => {
  const { from, to, category } = req.query;
  const filter = { user: req.user._id };
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json(expenses);
};

export const updateExpense = async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  Object.assign(expense, req.body, { wasManuallyCorrected: true });
  await expense.save();
  res.json(expense);
};

export const deleteExpense = async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  res.json({ message: "Expense deleted" });
};

export const getSummary = async (req, res) => {
  const { period = "monthly" } = req.query;
  const now = new Date();
  let startDate;

  if (period === "daily") {
    startDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (period === "weekly") {
    startDate = new Date(now.setDate(now.getDate() - 7));
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const expenses = await Expense.find({ user: req.user._id, date: { $gte: startDate } });

  const byCategory = {};
  let total = 0;
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.totalAmount;
    total += e.totalAmount;
  }

  const alerts = [];
  const categoryBudgets = req.user.categoryBudgets || new Map();
  for (const [cat, spent] of Object.entries(byCategory)) {
    const budget = categoryBudgets.get ? categoryBudgets.get(cat) : categoryBudgets[cat];
    if (budget && budget > 0) {
      const pctUsed = Math.round((spent / budget) * 100);
      if (pctUsed >= 80) {
        alerts.push({
          category: cat,
          pctUsed,
          message: `You've used ${pctUsed}% of your ${cat} budget`,
        });
      }
    }
  }

  res.json({ period, startDate, total, byCategory, alerts });
};

export const getSavingsSuggestions = async (req, res) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLast3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const thisMonthExpenses = await Expense.find({
    user: req.user._id,
    date: { $gte: startOfThisMonth },
  });
  const historicalExpenses = await Expense.find({
    user: req.user._id,
    date: { $gte: startOfLast3Months, $lt: startOfThisMonth },
  });

  const sumByCategory = (list) => {
    const map = {};
    for (const e of list) map[e.category] = (map[e.category] || 0) + e.totalAmount;
    return map;
  };

  const currentMonthByCategory = sumByCategory(thisMonthExpenses);
  const historicalTotals = sumByCategory(historicalExpenses);
  const historicalAvgByCategory = Object.fromEntries(
    Object.entries(historicalTotals).map(([k, v]) => [k, v / 3])
  );

  const subscriptionCount = thisMonthExpenses.filter((e) => e.category === "subscriptions").length;

  const suggestions = generateSavingsSuggestions(
    currentMonthByCategory,
    historicalAvgByCategory,
    subscriptionCount
  );

  res.json({ suggestions });
};
