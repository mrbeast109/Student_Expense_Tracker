export const CAT_ICON = {};

export const CATEGORY_LABELS = {
  food:          "Food",
  travel:        "Travel",
  stationery:    "Stationery",
  rent:          "Rent",
  subscriptions: "Subscriptions",
  groceries:     "Groceries",
  entertainment: "Entertainment",
  utilities:     "Utilities",
  health:        "Health",
  other:         "Other",
};

const CAT_CHIP_STYLE = {
  food:          { bg: "#d4f0e8", color: "var(--teal)" },
  travel:        { bg: "#fef0d6", color: "var(--marigold-ink)" },
  stationery:    { bg: "var(--paper-2)", color: "var(--muted)" },
  rent:          { bg: "#fde8e3", color: "var(--coral)" },
  subscriptions: { bg: "var(--paper-2)", color: "var(--ink)" },
  groceries:     { bg: "#d4f0e8", color: "var(--teal)" },
  entertainment: { bg: "#fef0d6", color: "var(--marigold-ink)" },
  utilities:     { bg: "var(--paper-2)", color: "var(--muted)" },
  health:        { bg: "#fde8e3", color: "var(--coral)" },
  other:         { bg: "var(--paper-2)", color: "var(--muted)" },
};

export default function CategoryBadge({ category }) {
  const style = CAT_CHIP_STYLE[category] || CAT_CHIP_STYLE.other;
  const label = CATEGORY_LABELS[category] || category;

  return (
    <span
      className="pill"
      style={{ background: style.bg, color: style.color, fontWeight: 700 }}
    >
      {label}
    </span>
  );
}
