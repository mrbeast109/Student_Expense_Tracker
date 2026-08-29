import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const TYPES = [
  { value: "roommates", label: "Roommates" },
  { value: "trip",      label: "Trip" },
  { value: "project",   label: "Project team" },
  { value: "mess",      label: "Mess fund" },
  { value: "other",     label: "Other" },
];

export default function Groups() {
  const navigate = useNavigate();
  const [groups,   setGroups]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState("");
  const [type,     setType]     = useState("roommates");
  const [emails,   setEmails]   = useState([""]);
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/groups");
    setGroups(data);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setError("");
    try {
      const { data } = await api.post("/groups", {
        name, type, memberEmails: emails.map((e) => e.trim()).filter(Boolean),
      });
      navigate(`/groups/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally { setCreating(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ink)", margin: 0 }}>Groups</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 3 }}>Roommates, trips, project teams — split bills together.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn gold">+ New group</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Create a group</h2>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.82rem" }}>
              Close
            </button>
          </div>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="label" htmlFor="grp-name">Group name</label>
              <input id="grp-name" required className="input" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="Room 204 / Manali Trip" />
            </div>
            <div>
              <p className="label" style={{ marginBottom: 8 }}>Type</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => setType(t.value)}
                    className={`chip${type === t.value ? " active" : ""}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Invite members (by email)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {emails.map((email, i) => (
                  <input key={i} type="email" className="input" placeholder="friend@university.edu" value={email}
                    onChange={(e) => { const next = [...emails]; next[i] = e.target.value; setEmails(next); }} />
                ))}
              </div>
              <button type="button" onClick={() => setEmails((e) => [...e, ""])}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", fontWeight: 700, fontSize: "0.75rem", marginTop: 6, padding: 0 }}>
                + Add another
              </button>
              <p style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 4 }}>
                They need to already have a Tally+ account.
              </p>
            </div>
            {error && <div className="form-error"><span>{error}</span></div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={creating} className="btn gold" style={{ flex: 2 }}>
                {creating ? "Creating…" : "Create group"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: "var(--radius)" }} />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)", maxWidth: 280, margin: "0 auto" }}>
            No groups yet. Create one for your roommates, a trip, or a project team to start splitting bills.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {groups.map((g) => (
            <Link key={g._id} to={`/groups/${g._id}`} className="card"
              style={{ padding: 18, textDecoration: "none", display: "block" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>{g.name}</h3>
                <span className="chip" style={{ fontSize: "0.65rem", padding: "2px 8px", textTransform: "capitalize" }}>{g.type}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex" }}>
                  {g.members.slice(0, 4).map((m, idx) => (
                    <div key={m._id} title={m.name}
                      style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: "var(--paper-2)", border: "1.5px solid var(--line)",
                        color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.6rem", fontWeight: 800, marginLeft: idx > 0 ? -6 : 0,
                        position: "relative", zIndex: 4 - idx,
                      }}>
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                  {g.members.length} member{g.members.length !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
