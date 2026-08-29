export function buildUpiLink({ payeeUpiId, payeeName, amount, note, transactionRefId }) {
  if (!payeeUpiId) return null;
  
  const params = new URLSearchParams({
    pa: payeeUpiId,
    pn: payeeName || "Tally+ User",
    am: amount.toFixed(2),
    cu: "INR",
    tn: note || "Tally+ settlement",
  });
  if (transactionRefId) params.set("tr", transactionRefId);

  return `upi://pay?${params.toString()}`;
}
