import React from "react";
import "./Home.css";
import qrLogo from "../assets/qr_imave.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">


      <div className="home-content">
        <div className="brand-header">
          <div className="brand-icon" style={{ background: 'transparent', boxShadow: 'none', transform: 'none' }}>
            <svg viewBox="0 0 24 24" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
              <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
              <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
            </svg>
          </div>
          <h1 className="brand-title">PatientTalkback</h1>
          <p className="brand-subtitle">Automating Feedback Through Innovation</p>
        </div>

        <div className="glass-card">
          <h2 className="card-title">Welcome Back</h2>
          <p className="card-desc">Choose your portal to continue</p>

          <div className="action-stack">
            <button className="primary-glass-btn" onClick={() => navigate("/login")}>
              <span className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </span>
              Hospital Admin
            </button>

            <div className="custom-divider">
              <span></span>
              <p>OR</p>
              <span></span>
            </div>

            <button className="secondary-glass-btn" onClick={() => navigate("/use/scanQR")}>
              <div className="btn-content">
                <span className="btn-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg>
                </span>
                <span>Open Scanner</span>
              </div>
              <div className="qr-thumbnail">
                <img src={qrLogo} alt="QR Code" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
