import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PublicFeedbackHome.css";
import { applyTheme, loadThemeFromStorage } from "../themeUtils";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function PublicFeedbackHome() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Instant load theme from storage to avoid flash
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  // Load hospital info
  useEffect(() => {
    fetch(`${BACKENDURL}/api/user/getHospitalProfileForUser/${hospitalId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHospital(data.data);
          // Apply hospital-specific theme
          const OLD_DEFAULT = "#94D8E2";
          const rawP = data.data.adminColor;
          const rawS = data.data.userColor;
          const primary = (!rawP || rawP.toUpperCase() === OLD_DEFAULT) ? "#1c6e73" : rawP;
          const secondary = (!rawS || rawS.toUpperCase() === OLD_DEFAULT) ? "#9ed6df" : rawS;
          applyTheme(primary, secondary);
        }
      });
  }, [hospitalId]);

  // Load feedback forms
  useEffect(() => {
    fetch(`${BACKENDURL}/api/user/getHospitalFeedbacksFormForUser/${hospitalId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setFeedbacks(data.data);
        setLoading(false);
      });
  }, [hospitalId]);

  const getHospitalLogoSrc = () => {
    if (!hospital?.hospital_logo) return null;

    // Case 1: already base64 string
    if (typeof hospital.hospital_logo === "string") {
      return hospital.hospital_logo.startsWith("data:")
        ? hospital.hospital_logo
        : `data:image/png;base64,${hospital.hospital_logo}`;
    }

    // Case 2: Mongo Buffer
    if (hospital.hospital_logo?.data?.data) {
      const byteArray = new Uint8Array(hospital.hospital_logo.data.data);
      const binaryString = byteArray.reduce(
        (acc, byte) => acc + String.fromCharCode(byte),
        ""
      );
      const base64 = btoa(binaryString);
      return `data:${hospital.hospital_logo.contentType};base64,${base64}`;
    }

    return null;
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="pfh-page">
        <nav className="pfh-navbar">
          <div className="pfh-nav-left"></div>
          <div className="pfh-nav-center">
            <div className="pfh-brand">
              <span className="pfh-brand-icon-svg">
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                  <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                  <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
                </svg>
              </span>
              <span className="pfh-brand-name">PatientTalkback</span>
            </div>
          </div>
          <div className="pfh-nav-right"></div>
        </nav>
        <div className="pfh-content">
          <div className="pfh-loading">
            <div className="pfh-spinner"></div>
            <p className="pfh-loading-text">Loading feedback forms…</p>
          </div>
        </div>
      </div>
    );
  }

  const logoSrc = getHospitalLogoSrc();

  return (
    <div className="pfh-page">
      {/* ─── Navbar ─── */}
      <nav className="pfh-navbar">
        <div className="pfh-nav-left"></div>
        <div className="pfh-nav-center">
          <div className="pfh-brand">
            <span className="pfh-brand-icon-svg">
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
              </svg>
            </span>
            <span className="pfh-brand-name">PatientTalkback</span>
          </div>
        </div>
        <div className="pfh-nav-right"></div>
      </nav>

      {/* ─── Main Content ─── */}
      <div className="pfh-content">
        {/* ─── Hospital Profile Hero ─── */}
        <section className="pfh-hospital-hero">
          <div className="pfh-hospital-logo-wrapper">
            <div className="pfh-hospital-logo-ring"></div>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={hospital?.hospital_name || "Hospital"}
                className="pfh-hospital-logo"
              />
            ) : (
              <div className="pfh-hospital-logo-placeholder">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <path d="M9 9h1" />
                  <path d="M9 13h1" />
                  <path d="M9 17h1" />
                </svg>
              </div>
            )}
          </div>

          <h1 className="pfh-hospital-name">
            {hospital?.hospital_name || "Hospital"}
          </h1>
          <p className="pfh-hospital-subtitle">
            Share your experience — your feedback helps us improve
          </p>

          {feedbacks.length > 0 && (
            <div className="pfh-cta-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 15l-2 5L9 9l11 4-5 2z" />
                <path d="M22 22l-5-5" />
              </svg>
              Select a feedback form to begin
            </div>
          )}
        </section>

        {/* ─── Feedback Cards Grid ─── */}
        {feedbacks.length === 0 ? (
          <div className="pfh-empty">
            <div className="pfh-empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="pfh-empty-title">No Feedback Forms Yet</h3>
            <p className="pfh-empty-desc">
              This hospital hasn't published any feedback forms yet. Please check back later.
            </p>
          </div>
        ) : (
          <div className="pfh-grid">
            {feedbacks.map((f) => (
              <div
                key={f._id}
                className="pfh-card"
                onClick={() => navigate(`/feedback/${f._id}`, { replace: true })}
              >
                <div className="pfh-card-img-wrapper">
                  <img
                    src={f.logo_png}
                    alt={f.feedback_name}
                    className="pfh-card-img"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                </div>
                <p className="pfh-card-name">{f.feedback_name}</p>
                <div className="pfh-card-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="pfh-footer">
        <p className="pfh-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}
