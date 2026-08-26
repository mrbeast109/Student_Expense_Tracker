import { CATEGORY_LABELS } from "./CategoryBadge";

export default function BudgetAlert({ alert }) {
  const severe = alert.pctUsed >= 100;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 9,
        background: severe ? "#fde8e3" : "#fef0d6",
        border: `1px solid ${severe ? "var(--coral)" : "var(--marigold)"}`,
        color: severe ? "var(--coral)" : "var(--marigold-ink)",
        fontSize: "0.82rem",
        fontWeight: 600,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", flexShrink: 0, display: "inline-block" }} />
      <p style={{ margin: 0 }}>
        You've used{" "}
        <span className="amount" style={{ fontWeight: 700 }}>{alert.pctUsed}%</span> of your{" "}
        <span style={{ fontWeight: 700 }}>{CATEGORY_LABELS[alert.category] || alert.category}</span> budget
        {severe ? " — over limit." : "."}
      </p>
    </div>
  );
}
