import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;
const HISTORY_KEY = "ptb_complaint_history";

// ─── Status / Priority config ───────────────────────────────
const STATUS_CONFIG = {
  "Pending":       { color: "#b45309", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
  "Under Review":  { color: "#1d4ed8", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)"  },
  "Assigned":      { color: "#7c3aed", bg: "rgba(124,58,237,0.12)",  border: "rgba(124,58,237,0.3)"  },
  "In Progress":   { color: "#0369a1", bg: "rgba(14,165,233,0.12)",  border: "rgba(14,165,233,0.3)"  },
  "Resolved":      { color: "#15803d", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)"   },
  "Closed":        { color: "#374151", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)" },
  "Rejected":      { color: "#dc2626", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   },
};

const PRIORITY_CONFIG = {
  "Low":    { color: "#15803d", bg: "rgba(34,197,94,0.1)"  },
  "Medium": { color: "#b45309", bg: "rgba(245,158,11,0.1)" },
  "High":   { color: "#dc2626", bg: "rgba(239,68,68,0.1)"  },
};

// ─── Reusable badges ────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 9999, fontSize: 11,
      fontWeight: 700, letterSpacing: "0.03em",
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`, whiteSpace: "nowrap",
    }}>
      {status || "Pending"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  if (!priority) return null;
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Medium"];
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 9999, fontSize: 11,
      fontWeight: 700, color: cfg.color, background: cfg.bg,
      whiteSpace: "nowrap",
    }}>
      {priority}
    </span>
  );
}

// ─── Detail row inside result card ──────────────────────────
function DetailRow({ label, value, mono }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", gap: 16,
      paddingBottom: 12, borderBottom: "1px solid rgba(0,0,0,0.05)",
    }}>
      <span style={{
        fontSize: 13, color: "rgba(11,28,40,0.5)",
        fontWeight: 500, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 14, fontWeight: 600,
        color: "var(--text-main, #0b1c28)",
        textAlign: "right",
        fontFamily: mono ? "monospace" : "inherit",
        letterSpacing: mono ? "0.02em" : "normal",
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Full detail card (shown after tracking) ─────────────────
function ComplaintDetailCard({ data, onClose }) {
  const cfg = STATUS_CONFIG[data.status] || STATUS_CONFIG["Pending"];
  return (
    <div style={{
      background: "rgba(255,255,255,0.95)",
      border: "1px solid rgba(255,255,255,0.9)",
      borderRadius: 18, overflow: "hidden",
      boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
      marginTop: 16,
      animation: "ptb-slide-up 0.35s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Status banner */}
      <div style={{
        padding: "16px 20px",
        background: cfg.bg,
        borderBottom: `1px solid ${cfg.border}`,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.08em", color: cfg.color, marginBottom: 3,
          }}>
            Current Status
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>
            {data.status}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <PriorityBadge priority={data.priority} />
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: "50%", border: "none",
              background: "rgba(0,0,0,0.08)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: cfg.color, transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.08)"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Detail rows */}
      <div style={{ padding: "20px 20px 4px", display: "flex", flexDirection: "column", gap: 0 }}>
        <DetailRow label="Complaint ID" value={data.complaintId} mono />
        {data.hospitalName && <DetailRow label="Hospital" value={data.hospitalName} />}
        {data.feedbackForm && <DetailRow label="Feedback Form" value={data.feedbackForm} />}
        {data.department && <DetailRow label="Department" value={data.department} />}
        <DetailRow
          label="Submitted On"
          value={data.submittedAt
            ? new Date(data.submittedAt).toLocaleString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: true,
              })
            : "—"}
        />
      </div>

      {/* Admin remarks */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{
          padding: "14px 16px", borderRadius: 12, marginTop: 8,
          background: data.adminRemarks ? "rgba(28,110,115,0.05)" : "rgba(0,0,0,0.02)",
          border: data.adminRemarks
            ? "1px solid rgba(28,110,115,0.15)"
            : "1px dashed rgba(0,0,0,0.08)",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.07em", color: "var(--primary-color, #1c6e73)",
            marginBottom: 6,
          }}>
            Admin Remarks
          </div>
          <div style={{
            fontSize: 14, lineHeight: 1.6,
            color: data.adminRemarks ? "var(--text-main, #0b1c28)" : "rgba(11,28,40,0.35)",
            fontStyle: data.adminRemarks ? "normal" : "italic",
          }}>
            {data.adminRemarks || "No remarks yet — your complaint is being reviewed."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single history card ─────────────────────────────────────
function HistoryCard({ entry, onRefresh, onRemove, isRefreshing }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.9)",
      borderRadius: 16, padding: "16px 18px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column", gap: 12,
      animation: "ptb-slide-up 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: "var(--text-main, #0b1c28)",
            fontFamily: "monospace", letterSpacing: "0.02em",
          }}>
            {entry.complaintId}
          </span>
          {entry.feedbackName && (
            <span style={{ fontSize: 12, color: "rgba(11,28,40,0.5)", fontWeight: 500 }}>
              {entry.feedbackName}
              {entry.hospitalName ? ` · ${entry.hospitalName}` : ""}
            </span>
          )}
          <span style={{ fontSize: 11, color: "rgba(11,28,40,0.35)" }}>
            Submitted {new Date(entry.submittedAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      {/* Action row */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onRefresh(entry.complaintId)}
          disabled={isRefreshing}
          style={{
            flex: 1, padding: "9px 14px", borderRadius: 10, border: "none",
            background: "var(--primary-color, #1c6e73)", color: "#fff",
            fontWeight: 700, fontSize: 13,
            cursor: isRefreshing ? "not-allowed" : "pointer",
            opacity: isRefreshing ? 0.7 : 1, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: "0 4px 10px rgba(28,110,115,0.2)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { if (!isRefreshing) e.currentTarget.style.filter = "brightness(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
        >
          {isRefreshing ? (
            <>
              <span style={{
                width: 12, height: 12,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff", borderRadius: "50%",
                display: "inline-block",
                animation: "ptb-spin 0.8s linear infinite",
              }} />
              Checking…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <polyline points="23 20 23 14 17 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Refresh Status
            </>
          )}
        </button>

        <button
          onClick={() => onRemove(entry.complaintId)}
          title="Remove from history"
          style={{
            width: 38, height: 38, borderRadius: 10, border: "none",
            background: "rgba(239,68,68,0.08)", color: "#dc2626",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function TrackComplaint() {
  const navigate = useNavigate();

  // Manual search
  const [searchId, setSearchId]           = useState("");
  const [searchResult, setSearchResult]   = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError]     = useState("");

  // History
  const [history, setHistory]       = useState([]);
  const [trackingId, setTrackingId] = useState(null); // which card is refreshing

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(Array.isArray(saved) ? saved : []);
    } catch {
      setHistory([]);
    }
  }, []);

  // ── Shared fetch helper ──
  const fetchStatus = async (complaintId) => {
    const res = await fetch(`${BACKENDURL}/api/user/trackComplaint/${complaintId}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Not found");
    return data.data;
  };

  // ── Manual search ──
  const handleSearch = async () => {
    const trimmed = searchId.trim();
    if (!trimmed) {
      setSearchError("Please enter a Complaint ID");
      return;
    }
    setSearchError("");
    setSearchResult(null);
    setSearchLoading(true);
    try {
      const data = await fetchStatus(trimmed);
      setSearchResult(data);
    } catch {
      setSearchError("Complaint not found. Please check the ID and try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // ── Refresh one history card ──
  const handleRefresh = async (complaintId) => {
    setTrackingId(complaintId);
    try {
      const data = await fetchStatus(complaintId);

      // Update status in history list + persist
      setHistory(prev => {
        const updated = prev.map(e =>
          e.complaintId === complaintId
            ? { ...e, status: data.status, priority: data.priority }
            : e
        );
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      });

      // Show full detail card
      setSearchResult(data);
      setSearchId(complaintId);
    } catch {
      // silently fail — card stays unchanged
    } finally {
      setTrackingId(null);
    }
  };

  // ── Remove one entry ──
  const handleRemove = (complaintId) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.complaintId !== complaintId);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (searchResult?.complaintId === complaintId) setSearchResult(null);
  };

  // ── Clear all history ──
  const handleClearAll = () => {
    if (!window.confirm("Remove all complaint history from this device?")) return;
    setHistory([]);
    setSearchResult(null);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      backgroundColor: "var(--secondary-color, #9ed6df)",
    }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "14px 24px",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}>
        <div>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 9999,
              border: "1px solid rgba(28,110,115,0.15)",
              background: "rgba(255,255,255,0.6)",
              color: "var(--primary-color, #1c6e73)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateX(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; e.currentTarget.style.transform = "none"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Home
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000"/>
            <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50"/>
            <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main, #0b1c28)", letterSpacing: "-0.01em" }}>
            PatientTalkback
          </span>
        </div>

        <div />
      </nav>

      {/* ── Page content ── */}
      <div style={{
        flex: 1, width: "100%", maxWidth: 620,
        margin: "0 auto", padding: "36px 20px 60px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 16px", borderRadius: 9999,
            background: "rgba(28,110,115,0.08)",
            color: "var(--primary-color, #1c6e73)",
            fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
            textTransform: "uppercase", marginBottom: 14,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Complaint Tracker
          </div>
          <h1 style={{
            margin: "0 0 8px", fontSize: 28, fontWeight: 700,
            color: "var(--text-main, #0b1c28)", letterSpacing: "-0.02em",
          }}>
            Track Your Complaint
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: "rgba(11,28,40,0.55)" }}>
            Check live status or view your recent submissions
          </p>
        </div>

        {/* ── Search card ── */}
        <div style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.8)",
          borderRadius: 20, padding: 24,
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
          marginBottom: 28,
        }}>
          <label style={{
            display: "block", fontSize: 12, fontWeight: 700,
            color: "rgba(11,28,40,0.5)",
            marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            Search by Complaint ID
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="e.g. CMP-1718123456789"
              value={searchId}
              onChange={e => {
                setSearchId(e.target.value);
                setSearchError("");
                setSearchResult(null);
              }}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1, padding: "12px 16px",
                border: searchError
                  ? "2px solid #ef4444"
                  : "2px solid rgba(28,110,115,0.15)",
                borderRadius: 12, fontSize: 14,
                background: "rgba(255,255,255,0.8)",
                color: "var(--text-main, #0b1c28)",
                outline: "none", fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={e => {
                if (!searchError) e.target.style.borderColor = "var(--primary-color, #1c6e73)";
              }}
              onBlur={e => {
                if (!searchError) e.target.style.borderColor = "rgba(28,110,115,0.15)";
              }}
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              style={{
                padding: "12px 22px", borderRadius: 12, border: "none",
                background: "var(--primary-color, #1c6e73)", color: "#fff",
                fontWeight: 700, fontSize: 14,
                cursor: searchLoading ? "not-allowed" : "pointer",
                opacity: searchLoading ? 0.7 : 1,
                fontFamily: "inherit",
                boxShadow: "0 4px 12px rgba(28,110,115,0.25)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (!searchLoading) e.currentTarget.style.filter = "brightness(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
            >
              {searchLoading ? (
                <span style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  display: "inline-block",
                  animation: "ptb-spin 0.8s linear infinite",
                }}/>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              )}
              Track
            </button>
          </div>

          {/* Error */}
          {searchError && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginTop: 10,
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#dc2626", fontSize: 13, fontWeight: 500,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {searchError}
            </div>
          )}

          {/* Detail card after search */}
          {searchResult && (
            <ComplaintDetailCard
              data={searchResult}
              onClose={() => setSearchResult(null)}
            />
          )}
        </div>

        {/* ── History section ── */}
        {history.length > 0 ? (
          <div>
            {/* Section header */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color, #1c6e73)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main, #0b1c28)" }}>
                  Recent Complaints
                </span>
                <span style={{
                  padding: "2px 9px", borderRadius: 9999, fontSize: 11, fontWeight: 700,
                  background: "rgba(28,110,115,0.1)",
                  color: "var(--primary-color, #1c6e73)",
                }}>
                  {history.length}
                </span>
              </div>
              <button
                onClick={handleClearAll}
                style={{
                  fontSize: 12, fontWeight: 600, color: "#dc2626",
                  background: "transparent", border: "none",
                  cursor: "pointer", padding: "4px 8px",
                  borderRadius: 6, fontFamily: "inherit",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Clear All
              </button>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map(entry => (
                <HistoryCard
                  key={entry.complaintId}
                  entry={entry}
                  onRefresh={handleRefresh}
                  onRemove={handleRemove}
                  isRefreshing={trackingId === entry.complaintId}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── Empty state ── */
          <div style={{
            textAlign: "center", padding: "40px 24px",
            animation: "ptb-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              margin: "0 auto 20px",
              background: "rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color, #1c6e73)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "var(--text-main, #0b1c28)" }}>
              No complaint history on this device
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(11,28,40,0.45)", lineHeight: 1.7, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
              Complaints you submit will appear here automatically. You can also search above using a Complaint ID.
            </p>
          </div>
        )}
      </div>

      <footer style={{ textAlign: "center", padding: 24 }}>
        <p style={{ fontSize: 12, color: "rgba(11,28,40,0.45)", margin: 0 }}>
          Powered by PatientTalkback
        </p>
      </footer>

      <style>{`
        @keyframes ptb-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ptb-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}