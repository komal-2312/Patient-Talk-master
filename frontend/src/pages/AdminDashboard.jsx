import React, { useEffect, useState } from "react";
import "./AdminFeedback.css";
import "./AdminLayout.css";
import { useNavigate } from "react-router-dom";
import { useDialog } from "../components/DialogProvider";
import { resetToDefaultTheme } from "../themeUtils";
const editIcon = "/editIcon.png";
const placeholder = "../src/assets/placeholder.jpg";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hospitalName, setHospitalName] = useState("");
  const [hospitalLogo, setHospitalLogo] = useState("");
  const [editingName, setEditingName] = useState(false);







  const [menuOpen, setMenuOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem("theme") === "dark"
  );


  const handleLogout = async () => {
    try {
      await fetch(`${BACKENDURL}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // 🔥 REQUIRED
      });

      // Clear frontend-only storage
      localStorage.clear();
      sessionStorage.clear();
      resetToDefaultTheme();

      navigate("/login", { replace: true });

    } catch (error) {
      console.error("Logout failed:", error);
      // You might still want to navigate them away even if the API fails
      navigate("/login", { replace: true });
    }
  };

  const toggleTheme = () => {
    const nextTheme = !darkTheme;
    setDarkTheme(nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
    document.body.classList.toggle("dark-theme", nextTheme);
  };


  // 🔹 Load hospital header info

  useEffect(() => {
    fetch(`${BACKENDURL}/api/admin/hospital/profile`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHospitalName(data.data.hospital_name);
          setHospitalLogo(data.data.hospital_logo);
          const OLD_DEFAULT = "#94D8E2";
          const rawPrimary = data.data.adminColor;
          const rawSecondary = data.data.userColor;
          const primary = (!rawPrimary || rawPrimary.toUpperCase() === OLD_DEFAULT) ? "#1c6e73" : rawPrimary;
          const secondary = (!rawSecondary || rawSecondary.toUpperCase() === OLD_DEFAULT) ? "#9ed6df" : rawSecondary;
          import("../themeUtils").then(m => m.applyTheme(primary, secondary));

        }
      });
  }, []);

  // 🔹 Load feedback forms
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(`${BACKENDURL}/api/admin/getFeedbackForms`, {
          credentials: "include",
        });
        if (res.status === 314) {
          return;
        }
        if (res.status === 412 || res.status === 401) {
          showDialog("Session expired. Please log in again.", () => {
            navigate("/login", { replace: true });
          });
          return;
        }

        const data = await res.json();

        if (data.success) {
          setFeedbacks(data.data);
        }
      } catch (err) {
        console.error("Failed to load feedbacks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [navigate]);


  async function saveHospitalName() {
    const res = await fetch(`${BACKENDURL}/api/admin/hospital/changeHospitalName`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newHospital_name: hospitalName }),

    });
    if (res.status === 412 || res.status === 401) {
      showDialog("Session expired. Please log in again.", () => {
        navigate("/login", { replace: true });
      });
      return;
    }
    if (res.status === 200) {
      setEditingName(false);
    } else {
      showDialog("Failed to update hospital name");
    }
  };

  if (loading) return <p className="center">Loading...</p>;

  return (
    <div className="admin-page">
      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <button className="admin-menu-btn" onClick={() => setMenuOpen((prev) => !prev)}>
            ☰
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

        <div className="admin-nav-right">
          {hospitalLogo ? (
            <img src={hospitalLogo} alt="Hospital Logo" className="admin-hospital-avatar" />
          ) : (
            <div className="admin-hospital-avatar-placeholder"></div>
          )}
        </div>
      </nav>

      {/* Menu Dialog */}
      {menuOpen && (
        <>
          <div className="admin-menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="admin-menu-dialog">
            <button onClick={() => { navigate("/admin/assignperson"); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Contact Person
            </button>
            <button onClick={() => { navigate("/admin/changeHospitaltheme"); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M12 21a9 9 0 0 1-8.6-6.1C3 13.6 4.3 12 6 12h2.5c.8 0 1.5.7 1.5 1.5v1a1.5 1.5 0 0 0 1.5 1.5h1a6 6 0 0 0 6-6C18.5 6 15.6 3 12 3a9 9 0 1 0 0 18z" /><circle cx="7" cy="8" r="1.5" fill="currentColor" /><circle cx="12" cy="7" r="1.5" fill="currentColor" /><circle cx="16" cy="10" r="1.5" fill="currentColor" /></svg>
              Theme Change
            </button>
            <button className="admin-danger-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Logout
            </button>
          </div>
        </>
      )}

      {/* Content */}
      <div className="admin-content admin-content--wide">
        <div className="admin-page-header">
          {/* <div className="admin-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
            Dashboard
          </div> */}

          {/* Hospital Name */}
          {editingName ? (
            <div className="dash-name-editor">
              <input
                className="dash-name-input"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                autoFocus
              />
              <div className="dash-name-actions">
                <button className="dash-name-save" onClick={saveHospitalName}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Save
                </button>
                <button className="dash-name-cancel" onClick={() => setEditingName(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <h1 className="admin-page-title" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }} onClick={() => setEditingName(true)}>
              {hospitalName}
              <span className="dash-edit-btn" title="Edit hospital name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </span>
            </h1>
          )}

          <p className="admin-page-subtitle">Available Feedback Forms</p>
        </div>

        {/* Feedback Grid */}
        {feedbacks.length === 0 ? (
          <p className="center">No feedback form available</p>
        ) : (
          <div className="feedback-grid">
            {feedbacks.map((item) => (
              <div key={item._id} className="feedback-card" onClick={() => navigate(`/admin/feedback/edit/${item._id}`)}>
                <img className="feedbackimage" src={item.logo_png || placeholder} alt={item.feedback_name || "Feedback Logo"} />
                <p>{item.feedback_name || "Unnamed Feedback Form"}</p>
                <span><img src={editIcon} className="edit-icon" alt="Edit" /></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="admin-fab" onClick={() => navigate("/admin/createFeedback")}>+</button>

      {/* Footer */}
      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}
