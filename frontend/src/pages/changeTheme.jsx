import React, { useState, useEffect } from "react";
import "./AdminThemeSettings.css";
import "./AdminLayout.css";
import { applyTheme } from "../themeUtils";
import { useDialog } from "../components/DialogProvider";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

const PRESET_THEMES = [
  { name: "Ocean Teal (Default)", primary: "#1c6e73", secondary: "#9ed6df", description: "Trustworthy & Professional" },
  { name: "Royal Blue", primary: "#2563eb", secondary: "#eff6ff", description: "Clean & Modern" },
  { name: "Modern Indigo", primary: "#4f46e5", secondary: "#f5f3ff", description: "Creative & Premium" },
  { name: "Emerald Health", primary: "#059669", secondary: "#ecfdf5", description: "Calm & Natural" },
  { name: "Soft Rose", primary: "#e11d48", secondary: "#fff1f2", description: "Warm & Compassionate" },
  { name: "Sunset Orange", primary: "#ea580c", secondary: "#fff7ed", description: "Friendly & Energetic" },
  { name: "Deep Slate", primary: "#334155", secondary: "#f8fafc", description: "Sophisticated & Minimal" },
  { name: "Vibrant Violet", primary: "#7c3aed", secondary: "#f5f3ff", description: "Luxurious & Unique" },
  { name: "Golden Amber", primary: "#d97706", secondary: "#fffbeb", description: "Optimistic & Bright" },
  { name: "Mint Fresh", primary: "#0891b2", secondary: "#ecfeff", description: "Crisp & Clinical" },
];

export default function ChangeTheme() {
  const [colors, setColors] = useState({
    primaryColor: "#1c6e73",
    secondaryColor: "#9ed6df",
  });
  const { showDialog } = useDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load current theme from backend
    const loadCurrentTheme = async () => {
      try {
        const res = await fetch(`${BACKENDURL}/api/admin/hospital/profile`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          const OLD_DEFAULT = "#94D8E2";
          const rawP = data.data.adminColor;
          const rawS = data.data.userColor;
          const primary = (!rawP || rawP.toUpperCase() === OLD_DEFAULT) ? "#1c6e73" : rawP;
          const secondary = (!rawS || rawS.toUpperCase() === OLD_DEFAULT) ? "#9ed6df" : rawS;
          setColors({
            primaryColor: primary,
            secondaryColor: secondary,
          });
          // Apply current theme to the page
          applyTheme(primary, secondary);
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCurrentTheme();
  }, []);

  const saveTheme = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKENDURL}/api/admin/changeTheme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          primaryColor: colors.primaryColor,
          secondaryColor: colors.secondaryColor,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showDialog(data.message || "Failed to save theme");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Apply the saved theme
      applyTheme(colors.primaryColor, colors.secondaryColor);
    } catch (err) {
      showDialog("Server error");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultColors = {
      primaryColor: "#1c6e73",
      secondaryColor: "#9ed6df",
    };
    setColors(defaultColors);
    setSuccess(false);
    applyTheme(defaultColors.primaryColor, defaultColors.secondaryColor);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">
          <div>Loading theme settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <button className="admin-back-btn" onClick={() => window.history.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
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

      <div className="admin-content">
        <div className="admin-page-header">
          <div className="admin-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 0 0 20" /><path d="M2 12h20" /></svg>
            Customization
          </div>
          <h1 className="admin-page-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}><path d="M12 21a9 9 0 0 1-8.6-6.1C3 13.6 4.3 12 6 12h2.5c.8 0 1.5.7 1.5 1.5v1a1.5 1.5 0 0 0 1.5 1.5h1a6 6 0 0 0 6-6C18.5 6 15.6 3 12 3a9 9 0 1 0 0 18z"/><circle cx="7" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/><circle cx="16" cy="10" r="1.5" fill="currentColor"/></svg>
            Theme Settings
          </h1>
          <p className="admin-page-subtitle">Choose a beautifully curated theme for your hospital's interfaces</p>
        </div>

        <div className="theme-content-full">
          <div className="color-customizer">
            <h3>Choose a Theme Options</h3>
            <div className="preset-grid">
              {PRESET_THEMES.map((preset, idx) => (
                <div
                  key={idx}
                  className={`preset-card ${colors.primaryColor === preset.primary && colors.secondaryColor === preset.secondary ? 'active' : ''}`}
                  onClick={() => {
                    setColors({ primaryColor: preset.primary, secondaryColor: preset.secondary });
                    applyTheme(preset.primary, preset.secondary);
                  }}
                >
                  <div className="preset-preview" style={{ background: preset.secondary }}>
                    <div className="preset-preview-inner" style={{ background: preset.primary }}></div>
                  </div>
                  <div className="preset-info">
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-desc">{preset.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="preview-section-horizontal">
            <h3>Live Preview</h3>
            <div className="preview-card-horizontal">
              <div className="preview-element">
                <p className="preview-label">Primary Button</p>
                <button className="preview-btn primary">Action Button</button>
              </div>
              <div className="preview-element">
                <p className="preview-label">Secondary Button</p>
                <button className="preview-btn secondary">Cancel Button</button>
              </div>
              <div className="preview-element">
                <p className="preview-label">Typography</p>
                <div className="preview-brand">Hospital Brand Name</div>
              </div>
            </div>
          </div>
        </div>

        <div className="button-row">
          <button className="reset-btn" onClick={resetToDefault} disabled={loading || saving}>Restore Defaults</button>
          <button className="save-btn" onClick={saveTheme} disabled={loading || saving} style={{display: 'flex', alignItems: 'center'}}>
            {saving ? (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Saving...</>
            ) : success ? (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Theme Applied!</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save & Apply Theme</>
            )}
          </button>
        </div>
      </div>

      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}