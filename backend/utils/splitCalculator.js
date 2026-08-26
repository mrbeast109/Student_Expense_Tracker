export function calculateEqualSplit(totalAmount, memberIds) {
  const n = memberIds.length;
  const base = Math.floor((totalAmount / n) * 100) / 100;
  const splits = memberIds.map((user) => ({ user, amount: base }));
  const remainder = Math.round((totalAmount - base * n) * 100) / 100;
  if (remainder !== 0) splits[0].amount = Math.round((splits[0].amount + remainder) * 100) / 100;
  return splits;
}

export function calculateCustomSplit(customAmounts) {
  return customAmounts.map((s) => ({ user: s.user, amount: Math.round(s.amount * 100) / 100 }));
}

export function calculatePercentageSplit(totalAmount, percentages) {
  const totalPercent = percentages.reduce((sum, p) => sum + p.percent, 0);
  if (Math.abs(totalPercent - 100) > 0.5) {
    throw new Error(`Percentages must sum to 100 (got ${totalPercent})`);
  }
  const splits = percentages.map((p) => ({
    user: p.user,
    amount: Math.round(((totalAmount * p.percent) / 100) * 100) / 100,
  }));
  const sum = splits.reduce((s, x) => s + x.amount, 0);
  const remainder = Math.round((totalAmount - sum) * 100) / 100;
  if (remainder !== 0) splits[0].amount = Math.round((splits[0].amount + remainder) * 100) / 100;
  return splits;
}

export function calculateItemizedSplit(items, tax = 0) {
  const memberSubtotals = {};

  for (const item of items) {
    const claimants = item.claimedBy && item.claimedBy.length ? item.claimedBy : [];
    if (claimants.length === 0) continue;
    const itemTotal = item.price * (item.quantity || 1);
    const perPerson = itemTotal / claimants.length;
    for (const userId of claimants) {
      const key = userId.toString();
      memberSubtotals[key] = (memberSubtotals[key] || 0) + perPerson;
    }
  }

  const subtotalSum = Object.values(memberSubtotals).reduce((a, b) => a + b, 0);

  const splits = Object.entries(memberSubtotals).map(([user, subtotal]) => {
    const taxShare = subtotalSum > 0 ? (subtotal / subtotalSum) * tax : 0;
    return { user, amount: Math.round((subtotal + taxShare) * 100) / 100 };
  });

  return splits;
}
