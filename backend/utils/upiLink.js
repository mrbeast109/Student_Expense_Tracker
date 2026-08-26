export function buildUpiLink({ payeeUpiId, payeeName, amount, note, transactionRefId }) {
  const params = new URLSearchParams({
    pa: payeeUpiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note || "CampusPay settlement",
  });
  if (transactionRefId) params.set("tr", transactionRefId);

  return `upi://pay?${params.toString()}`;
}
