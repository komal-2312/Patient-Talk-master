import React, { useState } from "react";
import "./Admin_Login.css";
import "./AdminLayout.css";
import { replace, useNavigate } from "react-router-dom";
import { resetToDefaultTheme } from "../themeUtils";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function Login() {
  const navigate = useNavigate();

  React.useEffect(() => {
    resetToDefaultTheme();
    
    // Check if user already has valid authentication cookie
    const checkAuthStatus = async () => {
      try {
        // Try to verify token by making an authenticated request
        const res = await fetch(`${BACKENDURL}/api/auth/verify`, {
          method: "GET",
          credentials: "include", // Include cookies
        });
        
        if (res.status === 200) {
          // User is already authenticated
          const data = await res.json();
          // Redirect based on user type
          if (data.isSuperAdmin) {
            navigate("/superadmin/dashboard", { replace: true });
          } else {
            navigate("/admin/dashboard", { replace: true });
          }
        }
      } catch (err) {
        // Not authenticated, stay on login page
        console.log("Not authenticated");
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  const [form, setForm] = useState({
    hospital_email: "",
    hospital_password: "",
    superAdmin: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    if (!form.hospital_email || !form.hospital_password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);


if (!form.superAdmin) {
    try {
      const res = await fetch(`${BACKENDURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",                                  //allow cookie
        body: JSON.stringify({
          hospital_email: form.hospital_email,
          hospital_password: form.hospital_password,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        setError(data.message || "Invalid credentials");
        throw new Error(data.message || "Invalid credentials");
      }
      if (res.status !== 200) {
        throw new Error(data.message || "Login failed");
      }
      if (!data.token) {
        setError("Server ERROR 505");
        throw new Error("No token received");
      }
      if(res.status === 200){
        navigate("/admin/dashboard", { replace: true });
      }
                                                              // ✅ JWT is now stored in HttpOnly cookie
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }else{
    try {
      const res = await fetch(`${BACKENDURL}/api/auth/superadmin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",                                  //allow cookie
        body: JSON.stringify({
          hospital_email: form.hospital_email,
          hospital_password: form.hospital_password,
        }),
      });
      setLoading(false);
      if (res.status === 401) {
        const data = await res.json();
        setError(data.message || "Invalid credentials");
        throw new Error(data.message || "Invalid credentials");
      }
      if (res.status !== 200) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }
      const data = await res.json();
      if (!data.token) {
        setError("Server ERROR 505");
        throw new Error("No token received");
      }
      if(res.status === 200){
        navigate("/superadmin/dashboard", { replace: true });
      }
      
    return;
  } catch (err) {
    setError(err.message);
  } finally {    setLoading(false);}
}
  };

  return (
    <div className="login-page">
      {/* Navbar */}
      <nav className="admin-navbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', boxSizing: 'border-box' }}>
        <div className="admin-nav-left">
          <button className="admin-back-btn" onClick={() => navigate('/')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Home
          </button>
        </div>
        <div className="admin-nav-center">
          <div className="admin-brand">
            <span className="admin-brand-icon-svg">
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
              </svg>
            </span>
            <span className="admin-brand-name">PatientTalkback</span>
          </div>
        </div>
        <div className="admin-nav-right"></div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="login-card">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="admin-header-badge" style={{ display: 'inline-flex' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Hospital Login
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--text-main)' }}>Welcome Back</h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Sign in to your admin portal</p>
            </div>

            <label>Email</label>
            <input
              type="email"
              name="hospital_email"
              placeholder="Email"
              value={form.hospital_email}
              onChange={handleChange}
            />

            <label>Password</label>
            <input
              type="password"
              name="hospital_password"
              placeholder="Password"
              value={form.hospital_password}
              onChange={handleChange}
            />

            <div className="options">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="superAdmin"
                  checked={form.superAdmin}
                  onChange={handleChange}
                />
                <span>Super Admin</span>
              </label>

              <span
                style={{marginLeft:"30px"}}
                className="register"
                onClick={() => navigate("/admin/register")}
              >
                new here? Register
              </span>
            </div>

            {error && <p className="error">{error}</p>}

            <button
              className="login-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
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
