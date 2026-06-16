import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin_Login.css";
import "./AdminLayout.css";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function ContactPersonLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKENDURL}/api/contact/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials");
        return;
      }
      navigate("/contact/dashboard", { replace: true });
    } catch {
      setError("Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="login-page">
      {/* Navbar */}
      <nav className="admin-navbar" style={{ position: "absolute", top: 0, left: 0, right: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="admin-nav-left">
          <button className="admin-back-btn" onClick={() => navigate("/")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Home
          </button>
        </div>
        <div className="admin-nav-center">
          <div className="admin-brand">
            <span className="admin-brand-icon-svg">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
              </svg>
            </span>
            <span className="admin-brand-name">PatientTalkback</span>
          </div>
        </div>
        <div className="admin-nav-right" />
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <div className="login-card">
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div className="admin-header-badge" style={{ display: "inline-flex" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Contact Person Login
              </div>
              <h2 style={{ margin: "8px 0 4px", fontSize: "22px", fontWeight: 700, color: "var(--text-main)" }}>Welcome Back</h2>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Sign in to manage your assigned complaints</p>
            </div>

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />

            {error && (
              <p className="error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </p>
            )}

            <button
              type="button"
              className="login-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </div>
      </div>

      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}