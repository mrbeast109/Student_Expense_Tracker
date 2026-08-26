import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SPLIT_TYPES = [
  { value: "equal",      label: "Equal" },
  { value: "custom",     label: "Custom amounts" },
  { value: "percentage", label: "Percentage" },
  { value: "itemized",   label: "Itemized" },
];

export default function GroupDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { profile } = useAuth();
  const [group,        setGroup]        = useState(null);
  const [bills,        setBills]        = useState([]);
  const [settlements,  setSettlements]  = useState(null);
  const [tab,          setTab]          = useState("bills");
  const [showBillForm, setShowBillForm] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [gr, br, sr] = await Promise.all([
      api.get(`/groups/${id}`),
      api.get(`/groups/${id}/bills`),
      api.get(`/groups/${id}/settlements`),
    ]);
    setGroup(gr.data); setBills(br.data); setSettlements(sr.data);
    setLoading(false);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Delete "${group.name}"? This will remove all bills and cannot be undone.`)) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/groups/${id}`);
      navigate("/groups");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete group");
      setDeleting(false);
    }
  };

  useEffect(() => { load(); }, [load]);

  if (loading || !group) {
    return <div style={{ color: "var(--muted)", padding: 24, fontSize: "0.82rem" }}>Loading group…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ink)", margin: 0 }}>{group.name}</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 3, textTransform: "capitalize" }}>
            {group.type} · {group.members.length} members
          </p>
        </div>
        <button onClick={() => setShowBillForm(true)} className="btn gold">+ Add bill</button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn warn"
          style={{ opacity: deleting ? 0.5 : 1 }}
        >
          {deleting ? "Deleting…" : "Delete group"}
        </button>
      </div>

      {deleteError && (
        <div className="form-error">
          <span>{deleteError}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
        <TabBtn active={tab === "bills"}  onClick={() => setTab("bills")}>Bills</TabBtn>
        <TabBtn active={tab === "settle"} onClick={() => setTab("settle")}>Settle up</TabBtn>
      </div>

      {showBillForm && (
        <AddBillForm group={group} onClose={() => setShowBillForm(false)} onCreated={() => { setShowBillForm(false); load(); }} />
      )}

      {tab === "bills"  && <BillsList bills={bills} />}
      {tab === "settle" && <SettleUp group={group} settlements={settlements} currentUserId={profile?._id} onSettled={load} />}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        borderBottom: active ? "2px solid var(--marigold)" : "2px solid transparent",
        marginBottom: -1, padding: "9px 16px",
        fontSize: "0.82rem", fontWeight: 700,
        color: active ? "var(--ink)" : "var(--muted)",
        transition: "color 120ms, border-color 120ms",
      }}>
      {children}
    </button>
  );
}

function BillsList({ bills }) {
  if (bills.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: "0.82rem", margin: 0 }}>
          No bills yet. Add one to start splitting expenses in this group.
        </p>
      </div>
    );
  }
  return (
    <div className="receipt" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)" }}>
      {bills.map((bill) => (
        <div key={bill._id} className="receipt-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ minWidth: 0 }}>
              <p className="receipt-meta-title">{bill.description}</p>
              <p className="receipt-meta-sub">
                Paid by {bill.paidBy?.name} · {new Date(bill.date).toLocaleDateString("en-IN")} ·{" "}
                <span style={{ textTransform: "capitalize" }}>{bill.splitType} split</span>
              </p>
            </div>
            <span className="receipt-amount">₹{bill.totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px" }}>
            {bill.splits.map((s, i) => (
              <span key={i} style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                {s.user?.name}: <span className="amount" style={{ fontWeight: 700, color: "var(--ink)" }}>₹{s.amount.toFixed(2)}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddBillForm({ group, onClose, onCreated }) {
  const [description,   setDescription]   = useState("");
  const [totalAmount,   setTotalAmount]   = useState("");
  const [paidBy,        setPaidBy]        = useState(group.members[0]?._id || "");
  const [splitType,     setSplitType]     = useState("equal");
  const [customAmounts, setCustomAmounts] = useState(group.members.map((m) => ({ user: m._id, amount: "" })));
  const [percentages,   setPercentages]   = useState(group.members.map((m) => ({ user: m._id, percent: "" })));
  const [items,         setItems]         = useState([]);
  const [tax,           setTax]           = useState(0);
  const [scanning,      setScanning]      = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [receiptHash,   setReceiptHash]   = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState("");

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true); setError("");
    try {
      const fd = new FormData();
      fd.append("receipt", file); fd.append("groupId", group._id);
      const { data } = await api.post("/ocr/scan", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setDescription(data.merchant || "Group bill"); setTotalAmount(data.totalAmount || "");
      setTax(data.tax || 0); setReceiptHash(data.receiptHash); setDuplicateWarning(data.duplicateWarning);
      setItems((data.items || []).map((i) => ({ name: i.name, price: i.price, quantity: i.quantity || 1, claimedBy: [] })));
      setSplitType("itemized");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to scan receipt");
    } finally { setScanning(false); }
  };

  const toggleClaim = (itemIndex, userId) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[itemIndex] };
      item.claimedBy = item.claimedBy.includes(userId)
        ? item.claimedBy.filter((id) => id !== userId)
        : [...item.claimedBy, userId];
      next[itemIndex] = item;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const payload = { description, totalAmount: parseFloat(totalAmount), paidBy, splitType };
      if (splitType === "custom")     payload.customAmounts = customAmounts.filter((c) => c.amount).map((c) => ({ user: c.user, amount: parseFloat(c.amount) }));
      if (splitType === "percentage") payload.percentages   = percentages.filter((p) => p.percent).map((p) => ({ user: p.user, percent: parseFloat(p.percent) }));
      if (splitType === "itemized")   { payload.items = items.map((i) => ({ ...i, price: parseFloat(i.price) })); payload.tax = parseFloat(tax) || 0; payload.receiptHash = receiptHash; }
      await api.post(`/groups/${group._id}/bills`, payload);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create bill");
    } finally { setSubmitting(false); }
  };

  const pctTotal = percentages.reduce((s, p) => s + (parseFloat(p.percent) || 0), 0);
  const pctError = splitType === "percentage" && pctTotal > 0 && Math.abs(pctTotal - 100) > 0.1;

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Add a group bill</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.75rem" }}>Close</button>
      </div>

      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--muted)", fontWeight: 600, fontSize: "0.78rem", marginBottom: 14 }}>
        {scanning ? "Scanning…" : "Scan a receipt to auto-fill (enables itemized split)"}
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleReceiptUpload} disabled={scanning} />
      </label>

      {duplicateWarning && (
        <div className="form-error" style={{ marginBottom: 12, background: "#fde8e3", border: "1px solid var(--coral)", color: "var(--coral)" }}>
          <span className="badge duplicate" style={{ flexShrink: 0 }}>Duplicate</span>
          <span>{duplicateWarning}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="label" htmlFor="bill-desc">Description</label>
            <input id="bill-desc" required className="input" value={description}
              onChange={(e) => setDescription(e.target.value)} placeholder="Dinner at Cafe X" />
          </div>
          <div>
            <label className="label" htmlFor="bill-amount">Total (₹)</label>
            <input id="bill-amount" type="number" step="0.01" required className="input mono-input"
              value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="bill-paid-by">Paid by</label>
          <select id="bill-paid-by" className="input" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {group.members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>

        <div>
          <p className="label" style={{ marginBottom: 8 }}>Split method</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SPLIT_TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => setSplitType(t.value)}
                disabled={t.value === "itemized" && items.length === 0}
                className={`chip${splitType === t.value ? " active" : ""}`}
                style={{ opacity: t.value === "itemized" && items.length === 0 ? 0.4 : 1 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {splitType === "custom" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p className="label">Custom amounts (₹)</p>
            {group.members.map((m, i) => (
              <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--ink)", fontWeight: 600, width: 110, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                <input type="number" step="0.01" className="input mono-input" style={{ flex: 1 }}
                  value={customAmounts[i].amount}
                  onChange={(e) => { const next = [...customAmounts]; next[i] = { ...next[i], amount: e.target.value }; setCustomAmounts(next); }} />
              </div>
            ))}
          </div>
        )}

        {splitType === "percentage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p className="label">Percentages (must total 100)</p>
            {group.members.map((m, i) => (
              <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--ink)", fontWeight: 600, width: 110, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                <input type="number" step="0.1" className="input mono-input" style={{ flex: 1 }}
                  value={percentages[i].percent}
                  onChange={(e) => { const next = [...percentages]; next[i] = { ...next[i], percent: e.target.value }; setPercentages(next); }} />
                <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>%</span>
              </div>
            ))}
            {pctError && (
              <p style={{ fontSize: "0.7rem", color: "var(--coral)", margin: 0 }}>
                Percentages add up to {pctTotal.toFixed(1)}% — they need to total 100%.
              </p>
            )}
          </div>
        )}

        {splitType === "itemized" && items.length > 0 && (
          <div>
            <p className="label" style={{ marginBottom: 4 }}>Tag who ordered what</p>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 8 }}>
              Tap a name under each item to split its cost between whoever claims it.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((item, i) => (
                <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)" }}>{item.name}</span>
                    <span className="amount" style={{ fontSize: "0.78rem", color: "var(--muted)" }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
                    {group.members.map((m) => (
                      <button key={m._id} type="button" onClick={() => toggleClaim(i, m._id)}
                        className={`chip${item.claimedBy.includes(m._id) ? " active" : ""}`}
                        style={{ fontSize: "0.68rem", padding: "3px 9px" }}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="form-error"><span>{error}</span></div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onClose} className="btn ghost" style={{ flex: 1 }}>Cancel</button>
          <button type="submit" disabled={submitting || pctError} className="btn gold" style={{ flex: 2 }}>
            {submitting ? "Saving…" : "Add bill"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SettleUp({ group, settlements, onSettled }) {
  const [recording, setRecording] = useState(null);

  const markPaid = async (t) => {
    setRecording(`${t.from._id}-${t.to._id}`);
    try {
      await api.post(`/groups/${group._id}/settlements`, { from: t.from._id, to: t.to._id, amount: t.amount, status: "paid" });
      onSettled();
    } finally { setRecording(null); }
  };

  if (!settlements || settlements.transactions.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--teal)", fontWeight: 700, margin: "0 0 4px" }}>Everyone's settled up</p>
        <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0 }}>No pending transactions.</p>
      </div>
    );
  }

  return (
    <div className="receipt" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)" }}>
      {settlements.transactions.map((t, i) => (
        <div key={i} className="receipt-row">
          <div className="receipt-meta">
            <p className="receipt-meta-title">
              <span style={{ color: "var(--coral)" }}>{t.from.name}</span>
              <span style={{ color: "var(--muted)", margin: "0 5px" }}>→</span>
              <span style={{ color: "var(--teal)" }}>{t.to.name}</span>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span className="receipt-amount" style={{ minWidth: "auto" }}>₹{t.amount.toFixed(2)}</span>
            {t.upiLink && (
              <a href={t.upiLink} className="btn ghost" style={{ padding: "4px 10px", fontSize: "0.7rem" }}>Pay via UPI</a>
            )}
            <button onClick={() => markPaid(t)} disabled={recording === `${t.from._id}-${t.to._id}`}
              className="btn gold" style={{ padding: "4px 10px", fontSize: "0.7rem" }}>
              Mark paid
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
