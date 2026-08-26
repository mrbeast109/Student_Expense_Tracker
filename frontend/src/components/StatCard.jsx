const ACCENT_COLORS = {
  ink:      { bg: "var(--ink)",      color: "#fff" },
  marigold: { bg: "var(--marigold)", color: "var(--marigold-ink)" },
  teal:     { bg: "var(--teal)",     color: "#fff" },
  coral:    { bg: "var(--coral)",    color: "#fff" },
};

export default function StatCard({ label, value, sublabel, accent = "ink" }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <p className="stat-label">{label}</p>
      <p className="big" style={{ marginTop: 6 }}>{value}</p>
      {sublabel && <p className="sub">{sublabel}</p>}
      <div style={{ marginTop: 14, height: 3, borderRadius: 2, background: ACCENT_COLORS[accent]?.bg || "var(--line)" }} />
    </div>
  );
}
