import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_LABELS } from "../components/CategoryBadge";

const CATEGORIES = Object.keys(CATEGORY_LABELS).filter((c) => c !== "other");

export default function Budgets() {
  const { profile, refreshProfile } = useAuth();
  const [monthlyBudget,   setMonthlyBudget]   = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    if (profile) {
      setMonthlyBudget(profile.monthlyBudget || "");
      setCategoryBudgets(profile.categoryBudgets || {});
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      await api.put("/users/me", {
        monthlyBudget: parseFloat(monthlyBudget) || 0,
        categoryBudgets: Object.fromEntries(Object.entries(categoryBudgets).filter(([, v]) => v !== "" && v != null)),
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 520 }}>
      <div>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ink)", margin: 0 }}>Budgets</h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 3 }}>
          Set spending limits and we'll alert you when you're getting close.
        </p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label className="label" htmlFor="budget-monthly">Overall monthly budget (₹)</label>
          <input id="budget-monthly" type="number" className="input mono-input" value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)} placeholder="e.g. 8000" />
        </div>

        <hr className="divider" />

        <div>
          <p className="label" style={{ marginBottom: 10 }}>Per-category limits (₹ / month)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)", width: 130, flexShrink: 0 }}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <input type="number" className="input mono-input" style={{ flex: 1 }}
                  value={categoryBudgets[cat] ?? ""}
                  onChange={(e) => setCategoryBudgets((b) => ({ ...b, [cat]: e.target.value }))}
                  placeholder="No limit" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn gold" style={{ width: "100%" }}>
          {saving ? "Saving…" : saved ? "Saved" : "Save budgets"}
        </button>
      </form>
    </div>
  );
}
