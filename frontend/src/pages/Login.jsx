import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
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
          <h1 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--ink)", margin: "0 0 4px" }}>Welcome back</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>Log in to track expenses and split bills.</p>

          {error && (
            <div className="form-error" style={{ marginTop: 14 }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="label" htmlFor="login-email">Email</label>
              <input id="login-email" type="email" required className="input" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
            </div>
            <div>
              <label className="label" htmlFor="login-password">Password</label>
              <input id="login-password" type="password" required className="input" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button id="login-submit" type="submit" disabled={loading} className="btn gold" style={{ width: "100%", marginTop: 4 }}>
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <button id="login-google" onClick={handleGoogle} className="btn ghost" style={{ width: "100%" }}>
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", marginTop: 14 }}>
          New here?{" "}
          <Link to="/signup" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
