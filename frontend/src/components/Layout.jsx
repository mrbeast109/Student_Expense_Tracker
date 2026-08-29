import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LayoutGrid, ScanLine, Receipt, Users, Wallet, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { to: "/",         label: "Dashboard",    Icon: LayoutGrid, end: true },
  { to: "/scan",     label: "Scan Receipt", Icon: ScanLine },
  { to: "/expenses", label: "Expenses",     Icon: Receipt },
  { to: "/groups",   label: "Groups",       Icon: Users },
  { to: "/budgets",  label: "Budgets",      Icon: Wallet },
  { to: "/settings", label: "Settings",     Icon: Settings },
];

export default function Layout({ children }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--paper)" }}>
      <aside
        className="hidden lg:flex"
        style={{
          width: 230,
          flexDirection: "column",
          borderRight: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          padding: "24px 16px",
          flexShrink: 0,
        }}
      >
        <Brand />
        <nav style={{ marginTop: 28, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
        <UserFooter profile={profile} onLogout={handleLogout} />
      </aside>

      {/* Mobile top header bar with hamburger menu - strictly hidden on desktop */}
      <div
        className="flex lg:hidden"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          borderBottom: "1px solid var(--glass-border)",
          padding: "0 16px",
          height: 50,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Brand compact />
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          style={{
            background: "none",
            border: "1px solid var(--line)",
            borderRadius: 7,
            padding: "5px 9px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "var(--muted)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(22,38,42,0.35)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            style={{
              position: "relative",
              width: 248,
              background: "var(--card)",
              height: "100%",
              padding: "20px 12px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", lineHeight: 1, padding: 4 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_ITEMS.map((item) => <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />)}
            </nav>
            <UserFooter profile={profile} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <main style={{ flex: 1, minWidth: 0, paddingTop: 50 }} className="lg:pt-0">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 20px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function Brand({ compact }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 4 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: "var(--marigold)", fontSize: "0.85rem", lineHeight: 1 }}>₹</span>
      </div>
      {!compact && (
        <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>
          Tally+
        </span>
      )}
    </div>
  );
}

function NavItem({ to, label, Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px",
        borderRadius: 12,
        fontSize: "0.84rem",
        fontWeight: isActive ? 700 : 600,
        textDecoration: "none",
        transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        background: isActive ? "var(--ink)" : "transparent",
        color: isActive ? "#ffffff" : "var(--muted)",
        boxShadow: isActive ? "0 4px 12px rgba(15, 23, 42, 0.15)" : "none",
      })}
    >
      <Icon size={15} strokeWidth={isActive => isActive ? 2.5 : 2} />
      {label}
    </NavLink>
  );
}

function UserFooter({ profile, onLogout }) {
  const initials = profile?.name?.[0]?.toUpperCase() || "U";
  return (
    <div style={{ paddingTop: 14, marginTop: 14, borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 4 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--paper-2)",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "0.72rem",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.name || "Student"}
          </p>
          <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          title="Log out"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
