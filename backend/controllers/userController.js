import User from "../models/User.js";

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const updateMe = async (req, res) => {
  const { name, upiId, currency, monthlyBudget, categoryBudgets } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = name;
  if (upiId !== undefined) user.upiId = upiId;
  if (currency !== undefined) user.currency = currency;
  if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
  if (categoryBudgets !== undefined) {
    user.categoryBudgets = new Map(Object.entries(categoryBudgets));
  }

  await user.save();
  res.json(user);
};
