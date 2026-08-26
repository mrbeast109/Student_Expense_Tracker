import { useEffect, useState, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import api from "../services/api";
import CategoryBadge, { CATEGORY_LABELS } from "../components/CategoryBadge";

const CATEGORIES = [
  "food", "travel", "stationery", "rent", "subscriptions",
  "groceries", "entertainment", "utilities", "health", "other",
];

export default function Expenses() {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(emptyForm());
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get("/expenses");
    setExpenses(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNewForm = () => { setForm(emptyForm()); setEditingId(null); setShowForm(true); };
  const openEditForm = (e) => {
    setForm({ merchant: e.merchant, date: e.date.slice(0, 10), totalAmount: e.totalAmount, category: e.category });
    setEditingId(e._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { merchant: form.merchant, date: form.date, totalAmount: parseFloat(form.totalAmount), category: form.category, source: editingId ? undefined : "manual" };
    if (editingId) await api.put(`/expenses/${editingId}`, payload);
    else           await api.post("/expenses", payload);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    load();
  };

  const startVoiceEntry = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice entry isn't supported in this browser. Try Chrome on desktop or Android."); return; }
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onresult = (event) => {
      const t = event.results[0][0].transcript;
      setVoiceNote(t);
      const parsed = parseVoiceExpense(t);
      setForm({ merchant: parsed.merchant, date: new Date().toISOString().slice(0, 10), totalAmount: parsed.amount || "", category: parsed.category });
      setEditingId(null);
      setShowForm(true);
    };
    r.start();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ink)", margin: 0 }}>Expenses</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 3 }}>Every personal expense you've logged.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            id="voice-entry-btn"
            onClick={startVoiceEntry}
            className={`btn ghost mic-btn${listening ? " live" : ""}`}
          >
            {listening ? <MicOff size={14} /> : <Mic size={14} />}
            <span className="hidden-mobile">{listening ? "Listening…" : "Voice"}</span>
          </button>
          <button id="add-expense-btn" onClick={openNewForm} className="btn gold">
            + Add expense
          </button>
        </div>
      </div>

      {voiceNote && (
        <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontStyle: "italic" }}>
          Heard: "{voiceNote}"
        </p>
      )}

      {showForm && (
        <div className="card" style={{ padding: 18 }}>
          <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 14px" }}>
            {editingId ? "Edit expense" : "New expense"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 14 }}>
              <div>
                <label className="label" htmlFor="exp-merchant">Merchant / description</label>
                <input id="exp-merchant" required className="input" value={form.merchant}
                  onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))} />
              </div>
              <div>
                <label className="label" htmlFor="exp-date">Date</label>
                <input id="exp-date" type="date" required className="input" value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label" htmlFor="exp-amount">Amount (₹)</label>
                <input id="exp-amount" type="number" step="0.01" required className="input mono-input"
                  value={form.totalAmount} onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))} />
              </div>
              <div>
                <label className="label" htmlFor="exp-category">Category</label>
                <select id="exp-category" className="input" value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn gold" style={{ flex: 2 }}>{editingId ? "Save changes" : "Add expense"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 9 }} />)}
        </div>
      ) : expenses.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: "0.82rem", margin: 0 }}>No expenses yet. Scan a receipt or add one manually.</p>
        </div>
      ) : (
        <div className="receipt" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)" }}>
          {expenses.map((e) => (
            <div key={e._id} className="receipt-row">
              <div className="receipt-meta">
                <p className="receipt-meta-title">{e.merchant}</p>
                <p className="receipt-meta-sub">
                  {new Date(e.date).toLocaleDateString("en-IN")}
                  {e.source === "ocr"   && " · scanned"}
                  {e.source === "voice" && " · voice"}
                </p>
              </div>
              <CategoryBadge category={e.category} />
              <span className="receipt-amount" style={{ minWidth: "5.5rem" }}>
                ₹{e.totalAmount.toLocaleString("en-IN")}
              </span>
              <div style={{ display: "flex", gap: 2 }}>
                <button onClick={() => openEditForm(e)} title="Edit"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "3px 5px", borderRadius: 5, fontSize: "0.75rem" }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(e._id)} title="Delete"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--coral)", padding: "3px 5px", borderRadius: 5, fontSize: "0.75rem" }}>
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@media (max-width: 480px) { .hidden-mobile { display: none; } }`}</style>
    </div>
  );
}

function emptyForm() {
  return { merchant: "", date: new Date().toISOString().slice(0, 10), totalAmount: "", category: "other" };
}

function parseVoiceExpense(transcript) {
  const amountMatch = transcript.match(/(\d+(\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
  const merchant = transcript
    .replace(/rupees?|rs\.?|₹/gi, "")
    .replace(amountMatch ? amountMatch[0] : "", "")
    .replace(/\bon\b|\bfor\b|\bat\b/gi, "")
    .trim() || "Voice entry";
  let category = "other";
  const lower = transcript.toLowerCase();
  if (/food|chai|tea|lunch|dinner|canteen|snack/.test(lower)) category = "food";
  else if (/auto|cab|bus|metro|travel|taxi/.test(lower))       category = "travel";
  else if (/book|pen|print|stationery/.test(lower))            category = "stationery";
  return { amount, merchant, category };
}
