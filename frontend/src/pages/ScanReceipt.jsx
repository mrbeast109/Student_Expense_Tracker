import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload } from "lucide-react";
import api from "../services/api";
import { CATEGORY_LABELS } from "../components/CategoryBadge";

const CATEGORIES = [
  "food", "travel", "stationery", "rent", "subscriptions",
  "groceries", "entertainment", "utilities", "health", "other",
];

export default function ScanReceipt() {
  const navigate = useNavigate();
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile,    setImageFile]    = useState(null);
  const [scanning,     setScanning]     = useState(false);
  const [scanResult,   setScanResult]   = useState(null);
  const [draft,        setDraft]        = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
    setScanResult(null); setDraft(null); setError("");
  };

  const handleScan = async () => {
    if (!imageFile) return;
    setScanning(true); setError("");
    try {
      const fd = new FormData();
      fd.append("receipt", imageFile);
      const { data } = await api.post("/ocr/scan", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setScanResult(data);
      setDraft({
        merchant: data.merchant || "",
        date: data.date ? normalizeDate(data.date) : new Date().toISOString().slice(0, 10),
        totalAmount: data.totalAmount ?? "",
        tax: data.tax ?? 0,
        category: data.category || "other",
        items: data.items?.length ? data.items : [{ name: "", price: "", quantity: 1 }],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to scan receipt. Try manual entry instead.");
    } finally { setScanning(false); }
  };

  const updateDraft = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const updateItem  = (i, field, value) => setDraft((d) => { const items = [...d.items]; items[i] = { ...items[i], [field]: value }; return { ...d, items }; });
  const addItem     = () => setDraft((d) => ({ ...d, items: [...d.items, { name: "", price: "", quantity: 1 }] }));
  const removeItem  = (i) => setDraft((d) => ({ ...d, items: d.items.filter((_, idx) => idx !== i) }));

  const itemsTotal = draft?.items?.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseFloat(i.quantity) || 1), 0) || 0;

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const wasManuallyCorrected =
        draft.merchant !== scanResult?.merchant ||
        Number(draft.totalAmount) !== scanResult?.totalAmount ||
        draft.category !== scanResult?.category ||
        JSON.stringify(draft.items) !== JSON.stringify(scanResult?.items);
      await api.post("/expenses", {
        merchant: draft.merchant, date: draft.date, totalAmount: parseFloat(draft.totalAmount),
        tax: parseFloat(draft.tax) || 0, category: draft.category,
        items: draft.items.filter((i) => i.name && i.price).map((i) => ({ name: i.name, price: parseFloat(i.price), quantity: parseFloat(i.quantity) || 1 })),
        source: "ocr", wasManuallyCorrected,
      });
      navigate("/expenses");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save expense");
    } finally { setSaving(false); }
  };

  const reset = () => { setImageFile(null); setImagePreview(null); setScanResult(null); setDraft(null); setError(""); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 660 }}>
      <div>
        <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ink)", margin: 0 }}>Scan a receipt</h1>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 3 }}>
          We'll auto-extract the details — you can fix anything the OCR gets wrong before saving.
        </p>
      </div>

      {!imagePreview && (
        <div
          className="card"
          style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", background: "var(--paper-2)", border: "1.5px dashed var(--line)", cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--card)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera size={20} color="var(--muted)" strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)", maxWidth: 260, margin: 0, lineHeight: 1.5 }}>
            Take a photo of your receipt, or upload one from your gallery.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 240 }}>
            <button onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }} className="btn gold">
              <Camera size={14} /> Use camera
            </button>
            <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="btn ghost">
              <Upload size={14} /> Upload image
            </button>
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileSelect} />
          <input ref={fileInputRef}   type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />
        </div>
      )}

      {imagePreview && !scanResult && (
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="scanline-wrapper" style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
            <img src={imagePreview} alt="Receipt preview" style={{ width: "100%", maxHeight: 300, objectFit: "contain", background: "var(--paper-2)", display: "block" }} />
            {scanning && <div className="scanline" />}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{scanning ? "Reading receipt…" : "Ready to scan"}</span>
            <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.75rem" }}>Remove</button>
          </div>
          {error && <div className="form-error"><span>{error}</span></div>}
          <button onClick={handleScan} disabled={scanning} className="btn gold" style={{ width: "100%" }}>
            {scanning ? "Scanning…" : "Extract details"}
          </button>
        </div>
      )}

      {draft && (
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Review &amp; correct</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {scanResult?.ocrConfidence != null && (
                <span className="badge ai">{Math.round(scanResult.ocrConfidence * 100)}% OCR</span>
              )}
              {scanResult?.isDuplicate && <span className="badge duplicate">Duplicate</span>}
            </div>
          </div>

          {scanResult?.isDuplicate && (
            <div className="form-error" style={{ background: "#fde8e3", border: "1px solid var(--coral)", color: "var(--coral)" }}>
              <span>{scanResult.duplicateWarning}</span>
            </div>
          )}

          <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>
            OCR isn't always perfect — double-check every field, especially the total.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <div>
              <label className="label" htmlFor="ocr-merchant">Merchant</label>
              <input id="ocr-merchant" className="input" value={draft.merchant} onChange={(e) => updateDraft("merchant", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="ocr-date">Date</label>
              <input id="ocr-date" type="date" className="input" value={draft.date} onChange={(e) => updateDraft("date", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="ocr-total">Total (₹)</label>
              <input id="ocr-total" type="number" step="0.01" className="input mono-input" value={draft.totalAmount} onChange={(e) => updateDraft("totalAmount", e.target.value)} />
              {itemsTotal > 0 && Math.abs(itemsTotal + (parseFloat(draft.tax) || 0) - parseFloat(draft.totalAmount || 0)) > 0.5 && (
                <p style={{ fontSize: "0.68rem", color: "var(--coral)", marginTop: 3 }}>
                  Items + Tax = ₹{(itemsTotal + (parseFloat(draft.tax) || 0)).toFixed(2)} — doesn't match total.
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="ocr-tax">Tax / GST (₹)</label>
              <input id="ocr-tax" type="number" step="0.01" className="input mono-input" value={draft.tax} onChange={(e) => updateDraft("tax", e.target.value)} />
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 8 }}>Category</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} type="button" onClick={() => updateDraft("category", cat)}
                  className={`chip${draft.category === cat ? " active" : ""}`}>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p className="label" style={{ margin: 0 }}>Itemized list</p>
              <button onClick={addItem} type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", fontSize: "0.75rem", fontWeight: 700 }}>
                + Add item
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {draft.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input className="input" placeholder="Item name" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} style={{ flex: 1 }} />
                  <input type="number" className="input mono-input" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} style={{ width: 58 }} />
                  <input type="number" step="0.01" className="input mono-input" placeholder="Price" value={item.price} onChange={(e) => updateItem(i, "price", e.target.value)} style={{ width: 82 }} />
                  <button onClick={() => removeItem(i)} type="button"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--coral)", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0, padding: "0 4px" }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="form-error"><span>{error}</span></div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={reset} type="button" className="btn ghost" style={{ flex: 1 }}>Rescan</button>
            <button onClick={handleSave} disabled={saving || !draft.merchant || !draft.totalAmount} className="btn gold" style={{ flex: 2 }}>
              {saving ? "Saving…" : "Save expense"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeDate(rawDate) {
  const parts = rawDate.split(/[\/\-\.]/);
  if (parts.length === 3) {
    let [a, b, c] = parts;
    if (a.length === 4) return `${a}-${b.padStart(2, "0")}-${c.padStart(2, "0")}`;
    if (c.length === 4) return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
  }
  return new Date().toISOString().slice(0, 10);
}
