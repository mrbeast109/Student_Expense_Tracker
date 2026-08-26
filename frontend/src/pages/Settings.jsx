import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { profile, refreshProfile } = useAuth();
  const [name,     setName]     = useState("");
  const [upiId,    setUpiId]    = useState("");
  const [currency, setCurrency] = useState("INR");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setUpiId(profile.upiId || "");
      setCurrency(profile.currency || "INR");
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/users/me", { name, upiId, currency });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 520 }}>
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--ink)", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>Your profile and payment details.</p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label" htmlFor="settings-name">Full name</label>
          <input
            id="settings-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="settings-email">Email</label>
          <input
            id="settings-email"
            className="input"
            value={profile?.email || ""}
            disabled
            style={{ background: "var(--paper-2)", color: "var(--muted)", cursor: "not-allowed" }}
          />
        </div>
        <div>
          <label className="label" htmlFor="settings-upi">UPI ID</label>
          <input
            id="settings-upi"
            className="input mono-input"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@okhdfcbank"
          />
          <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
            Used to generate "Pay via UPI" links when group-mates settle up with you.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="settings-currency">Currency</label>
          <select
            id="settings-currency"
            className="input"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
          <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
            For study-abroad students tracking expenses in another currency.
          </p>
        </div>

        <hr className="divider" />

        <button type="submit" disabled={saving} className="btn gold" style={{ width: "100%" }}>
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
