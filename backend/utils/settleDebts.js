export function simplifyDebts(balances) {
  const EPSILON = 0.01;

  const creditors = [];
  const debtors = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance > EPSILON) creditors.push({ userId, amount: balance });
    else if (balance < -EPSILON) debtors.push({ userId, amount: -balance });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: Math.round(settledAmount * 100) / 100,
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < EPSILON) i++;
    if (creditor.amount < EPSILON) j++;
  }

  return transactions;
}

export function computeBalancesFromBills(bills) {
  const balances = {};

  const addBalance = (userId, delta) => {
    balances[userId] = (balances[userId] || 0) + delta;
  };

  for (const bill of bills) {
    const paidById = bill.paidBy.toString();
    addBalance(paidById, bill.totalAmount);

    for (const split of bill.splits) {
      const userId = split.user.toString();
      addBalance(userId, -split.amount);
    }
  }

  return balances;
}
