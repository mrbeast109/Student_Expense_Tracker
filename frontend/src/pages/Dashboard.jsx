import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import api from "../services/api";
import StatCard from "../components/StatCard";
import BudgetAlert from "../components/BudgetAlert";
import { CATEGORY_LABELS } from "../components/CategoryBadge";
import { useAuth } from "../context/AuthContext";

const PIE_COLORS = [
  "#1F8A70", "#F2A93B", "#E2583E", "#16262A",
  "#6B7472", "#DAD4C4", "#EFEBDF", "#7A4E0C",
];

export default function Dashboard() {
  const { profile } = useAuth();
  const [summary, setSummary]               = useState(null);
  const [suggestions, setSuggestions]       = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, suggestionsRes, expensesRes] = await Promise.all([
          api.get("/expenses/summary?period=monthly"),
          api.get("/expenses/savings-suggestions"),
          api.get("/expenses"),
        ]);
        setSummary(summaryRes.data);
        setSuggestions(suggestionsRes.data.suggestions);
        setRecentExpenses(expensesRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pieData = summary
    ? Object.entries(summary.byCategory).map(([category, amount]) => ({
        name: CATEGORY_LABELS[category] || category,
        value: amount,
      }))
    : [];

  const topCategory = pieData.length
    ? pieData.reduce((a, b) => (a.value > b.value ? a : b))
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ink)", margin: 0 }}>
          Hi {profile?.name?.split(" ")[0] || "there"}
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 3 }}>
          Here's how your spending looks this month.
        </p>
      </div>

      {loading ? (
        <SkeletonDashboard />
      ) : (
        <>
          {summary?.alerts?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {summary.alerts.map((alert, i) => <BudgetAlert key={i} alert={alert} />)}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            <StatCard
              label="This month"
              value={`₹${summary.total.toLocaleString("en-IN")}`}
              sublabel="total spend"
              accent="ink"
            />
            <StatCard
              label="Budget used"
              value={profile?.monthlyBudget ? `${Math.round((summary.total / profile.monthlyBudget) * 100)}%` : "—"}
              sublabel={profile?.monthlyBudget ? `of ₹${profile.monthlyBudget.toLocaleString("en-IN")}` : "no budget set"}
              accent="marigold"
            />
            <StatCard
              label="Top category"
              value={topCategory ? topCategory.name : "—"}
              sublabel="highest spend area"
              accent="teal"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,3fr)", gap: 14 }} className="dash-two-col">
            <div className="card" style={{ padding: 18 }}>
              <h2 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                By category
              </h2>
              {pieData.length === 0 ? (
                <EmptyState text="No expenses logged this month yet." />
              ) : (
                <>
                  <div style={{ height: 190 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]}
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--line)",
                            borderRadius: 8,
                            fontFamily: "Space Mono, monospace",
                            fontSize: "0.72rem",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 12px", marginTop: 6 }}>
                    {pieData.map((entry, i) => (
                      <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.68rem", color: "var(--muted)" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block" }} />
                        {entry.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h2 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Savings suggestions
                </h2>
                <span className="badge ai">AI</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {suggestions.length === 0 ? (
                  <EmptyState text="Keep logging expenses for personalised tips." />
                ) : (
                  suggestions.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--ink)",
                        background: "var(--paper-2)",
                        borderRadius: 8,
                        padding: "9px 12px",
                        lineHeight: 1.55,
                        borderLeft: "2px solid var(--marigold)",
                      }}
                    >
                      {s}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <h2 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Recent expenses
              </h2>
              <a href="/expenses" style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textDecoration: "none" }}>
                View all
              </a>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="card" style={{ padding: 18 }}>
                <EmptyState text="Nothing logged yet — scan a receipt or add one manually." />
              </div>
            ) : (
              <div className="receipt" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)" }}>
                {recentExpenses.map((e) => (
                  <div key={e._id} className="receipt-row">
                    <div className="receipt-meta">
                      <p className="receipt-meta-title">{e.merchant}</p>
                      <p className="receipt-meta-sub">
                        {new Date(e.date).toLocaleDateString("en-IN")}
                        {e.source === "ocr"   && " · scanned"}
                        {e.source === "voice" && " · voice"}
                      </p>
                    </div>
                    <span className="receipt-amount">₹{e.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`@media (max-width: 700px) { .dash-two-col { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function EmptyState({ text }) {
  return <p style={{ fontSize: "0.8rem", color: "var(--muted)", textAlign: "center", padding: "20px 0", margin: 0 }}>{text}</p>;
}

function SkeletonDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 84, borderRadius: "var(--radius)" }} />)}
      </div>
      <div className="skeleton" style={{ height: 210, borderRadius: "var(--radius)" }} />
    </div>
  );
}
