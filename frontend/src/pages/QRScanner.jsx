import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useDialog } from "../components/DialogProvider";
import "./QRScanner.css";

export default function QRScanner() {
  const navigate = useNavigate();
  const { showDialog } = useDialog();
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    // Configuration for the QR Scanner
    const scannerConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      rememberLastUsedCamera: true
    };

    const scanner = new Html5QrcodeScanner("reader", scannerConfig, false);

    const onScanSuccess = (decodedText, decodedResult) => {
      // Pause scanner so we don't scan multiple times rapidly
      scanner.pause(true);
      setScanResult(decodedText);
      console.log("Scan success:", decodedText);

      try {
        // Evaluate if the decoded text is a URL
        const urlToNav = new URL(decodedText);
        
        // If it's a PatientTalkback link (we verify by pathname pattern: /feedback/:id )
        if (urlToNav.pathname.startsWith('/feedback/') || urlToNav.pathname.startsWith('/user/HomeforFeedback/')) {
          showDialog(`Valid QR Found! Redirecting to ${urlToNav.pathname}...`, () => {
            scanner.clear();
            navigate(urlToNav.pathname);
          });
        } 
        // Fallback for internal app routing without full domain
        else if (decodedText.startsWith("/feedback/") || decodedText.startsWith("/user/")) {
           showDialog(`Internal QR Found! Redirecting...`, () => {
            scanner.clear();
            navigate(decodedText);
          });
        }
        else {
          // Some other external URL format
          showDialog("External or formatting unrecognized QR code detected. Open URL directly?", () => {
             window.location.href = decodedText;
          });
        }
        
      } catch (e) {
        // URL Parse Error (meaning the QR code is just raw text, not a link)
        showDialog("Scanned successfully but no valid patient link found in QR.", () => {
             scanner.resume();
        });
      }
    };

    const onScanFailure = (error) => {
      // html5-qrcode triggers this constantly when NO QR code is in frame
      // We do not want to alert the user here, just quietly ignore it.
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup on component unmount
    return () => {
      scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
    };
  }, [navigate, showDialog]);

  return (
    <div className="scanner-page">
      {/* Navbar */}
      <nav className="scanner-navbar">
        <div className="scanner-nav-left">
          <button className="scanner-back-btn" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Home
          </button>
        </div>
        <div className="scanner-nav-center">
          <div className="scanner-brand">
            <span className="scanner-brand-icon-svg">
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
              </svg>
            </span>
            <span className="scanner-brand-name">PatientTalkback</span>
          </div>
        </div>
        <div className="scanner-nav-right"></div>
      </nav>

      <div className="scanner-content">
        <div className="scanner-header">
          <div className="scanner-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '2px'}}>
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            </svg>
            QR Portal
          </div>
          <h1 className="scanner-title">Scan Feedback QR</h1>
          <p className="scanner-subtitle">
            Point your camera at the hospital's QR code to instantly access your feedback form.
          </p>
        </div>

        <div className="scanner-card">
          {/* HTML5 QR Scanner injects dom here */}
          <div id="reader"></div>

          {!scanResult && (
             <div className="scanner-status">
               <p><div className="scanner-loader"></div> Awaiting QR Code...</p>
             </div>
          )}
        </div>
      </div>

      <footer className="scanner-footer">
        Powered by PatientTalkback
      </footer>
    </div>
  );
}
