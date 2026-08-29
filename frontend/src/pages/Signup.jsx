import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper)",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: "center", marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: "var(--marigold)", fontSize: "0.9rem" }}>₹</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>Tally+</span>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--ink)", margin: "0 0 4px" }}>Create your account</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>Free for students. Takes a minute.</p>

          {error && (
            <div className="form-error" style={{ marginTop: 14 }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="label" htmlFor="signup-name">Full name</label>
              <input id="signup-name" required className="input" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="Aditi Sharma" />
            </div>
            <div>
              <label className="label" htmlFor="signup-email">Email</label>
              <input id="signup-email" type="email" required className="input" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
            </div>
            <div>
              <label className="label" htmlFor="signup-password">Password</label>
              <input id="signup-password" type="password" required minLength={6} className="input" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <button id="signup-submit" type="submit" disabled={loading} className="btn gold" style={{ width: "100%", marginTop: 4 }}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", marginTop: 14 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
