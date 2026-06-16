import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

const STATUS_CONFIG = {
  "Pending":      { color: "#b45309", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  "Under Review": { color: "#1d4ed8", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  "Assigned":     { color: "#7c3aed", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)" },
  "In Progress":  { color: "#0369a1", bg: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.3)" },
  "Resolved":     { color: "#15803d", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)"  },
  "Closed":       { color: "#374151", bg: "rgba(107,114,128,0.12)",border: "rgba(107,114,128,0.3)"},
  "Rejected":     { color: "#dc2626", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)"  },
};

const PRIORITY_CONFIG = {
  "Low":    { color: "#15803d", bg: "rgba(34,197,94,0.1)"  },
  "Medium": { color: "#b45309", bg: "rgba(245,158,11,0.1)" },
  "High":   { color: "#dc2626", bg: "rgba(239,68,68,0.1)"  },
};

const ALLOWED_STATUSES = [
  "Pending", "Under Review", "Assigned",
  "In Progress", "Resolved", "Closed", "Rejected",
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 9999, fontSize: 11,
      fontWeight: 700, letterSpacing: "0.03em",
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`, whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
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

export default function ContactPersonDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [person, setPerson] = useState(null);
  const [assignedFeedbacks, setAssignedFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [selected, setSelected] = useState(null);
  const [modalStatus, setModalStatus] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKENDURL}/api/contact/myComplaints`, {
          credentials: "include",
        });
        if (res.status === 412 || res.status === 401) {
          navigate("/contact/login", { replace: true });
          return;
        }
        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Failed to load complaints");
          return;
        }
        setComplaints(data.data);
        setPerson(data.person);
        setAssignedFeedbacks(data.assignedFeedbacks || []);
      } catch {
        setError("Could not reach server");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  // Sync modal fields when complaint selected
  useEffect(() => {
    if (selected) {
      setModalStatus(selected.status || "Pending");
      setModalRemarks(selected.adminRemarks || "");
      setSaveMsg("");
    }
  }, [selected]);

  const handleLogout = async () => {
    await fetch(`${BACKENDURL}/api/contact/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/contact/login", { replace: true });
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(
        `${BACKENDURL}/api/contact/complaint/${selected.complaintId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: modalStatus, adminRemarks: modalRemarks }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveMsg(data.message || "Failed to update");
        return;
      }
      // Update locally
      setComplaints(prev =>
        prev.map(c =>
          c.complaintId === selected.complaintId
            ? { ...c, status: modalStatus, adminRemarks: modalRemarks }
            : c
        )
      );
      setSelected(prev => ({ ...prev, status: modalStatus, adminRemarks: modalRemarks }));
      setSaveMsg("Updated successfully");
    } catch {
      setSaveMsg("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Derived filter values
  const deptOptions = ["All", ...new Set(complaints.map(c => c.departmentAssigned).filter(Boolean))];

  const filtered = complaints.filter(c => {
    const statusMatch = filterStatus === "All" || c.status === filterStatus;
    const deptMatch = filterDept === "All" || c.departmentAssigned === filterDept;
    return statusMatch && deptMatch;
  });

  const ageHours = (c) => (new Date() - new Date(c.createdAt)) / (1000 * 60 * 60);
  const isOverdue = (c) => ageHours(c) > 48 && !["Resolved", "Closed", "Rejected"].includes(c.status);

  if (loading) return (
    <div className="admin-page">
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p className="admin-loading-text">Loading your complaints…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="admin-page">
      <div className="admin-loading">
        <p style={{ color: "var(--danger-color, #e55353)", fontWeight: 600 }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
            {person?.name || "Contact Person"}
          </div>
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
        <div className="admin-nav-right">
          <button
            className="admin-back-btn"
            onClick={handleLogout}
            style={{ color: "#e55353", borderColor: "rgba(229,83,83,0.2)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </nav>

      <div className="admin-content admin-content--wide">

        {/* Page Header */}
        <div className="admin-page-header">
          <div className="admin-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Contact Person
          </div>
          <h1 className="admin-page-title">My Assigned Complaints</h1>
          <p className="admin-page-subtitle">
            {assignedFeedbacks.length > 0
              ? `Assigned to: ${assignedFeedbacks.map(f => f.departmentName).join(", ")}`
              : "No feedback forms assigned yet"}
          </p>
        </div>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total", value: complaints.length },
            { label: "Pending", value: complaints.filter(c => c.status === "Pending").length },
            { label: "In Progress", value: complaints.filter(c => c.status === "In Progress").length },
            { label: "Resolved", value: complaints.filter(c => ["Resolved", "Closed"].includes(c.status)).length },
            { label: "Overdue", value: complaints.filter(isOverdue).length },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 14, padding: "16px 20px", backdropFilter: "blur(12px)",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-main)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setVisibleCount(10); }}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(28,110,115,0.15)",
              background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600,
              color: "var(--text-main)", outline: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <option value="All">All Statuses</option>
            {ALLOWED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterDept}
            onChange={e => { setFilterDept(e.target.value); setVisibleCount(10); }}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(28,110,115,0.15)",
              background: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600,
              color: "var(--text-main)", outline: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <span style={{ fontSize: 13, color: "var(--text-muted)", alignSelf: "center" }}>
            {filtered.length} complaint{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Complaints List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: 16, margin: 0 }}>No complaints match your filters</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.slice(0, visibleCount).map((complaint) => {
              const overdue = isOverdue(complaint);
              return (
                <div
                  key={complaint._id}
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderLeft: overdue ? "3px solid #dc2626" : "1px solid var(--glass-border)",
                    borderRadius: 16,
                    padding: "18px 22px",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-main)", fontFamily: "monospace" }}>
                        {complaint.complaintId}
                      </span>
                      {overdue && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: "#dc2626",
                          background: "rgba(239,68,68,0.1)", padding: "2px 6px",
                          borderRadius: 4, letterSpacing: "0.04em",
                        }}>
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {complaint.departmentAssigned} · {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {complaint.adminRemarks && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                        Remarks: {complaint.adminRemarks}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(complaint)}
                    style={{
                      padding: "9px 18px", borderRadius: 10, border: "none",
                      background: "var(--primary-color)", color: "#fff",
                      fontWeight: 700, fontSize: 13, cursor: "pointer",
                      fontFamily: "inherit", flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(28,110,115,0.2)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.filter = "none"}
                  >
                    Manage
                  </button>
                </div>
              );
            })}

            {/* View more / less */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              {filtered.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount(v => v + 10)}
                  style={{
                    flex: 2, padding: "14px", background: "#f1f5f9",
                    color: "var(--primary-color)", border: "2px dashed #cbd5e1",
                    borderRadius: 14, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                  }}
                >
                  View More ({filtered.length - visibleCount} left)
                </button>
              )}
              {visibleCount > 10 && (
                <button
                  onClick={() => setVisibleCount(10)}
                  style={{
                    flex: 1, padding: "14px", background: "#fff1f2",
                    color: "#e11d48", border: "2px solid #fee2e2",
                    borderRadius: 14, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  View Less
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Manage Modal ── */}
      {selected && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, padding: 20,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 24, width: "100%", maxWidth: 500,
              boxShadow: "0 40px 100px -20px rgba(0,0,0,0.3)",
              overflow: "hidden",
              animation: "none",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
                  Manage Complaint
                </h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, fontFamily: "monospace" }}>
                    {selected.complaintId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  width: 32, height: 32, borderRadius: "50%", border: "none",
                  background: "#f1f5f9", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "#64748b",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                Submitted: {new Date(selected.createdAt).toLocaleString()} · {selected.departmentAssigned}
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                  Status
                </label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "2px solid rgba(28,110,115,0.15)",
                    borderRadius: 10, fontSize: 14, fontWeight: 600,
                    background: "#fff", outline: "none",
                    color: "#1e293b", fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  {ALLOWED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                  Remarks
                </label>
                <textarea
                  value={modalRemarks}
                  onChange={e => setModalRemarks(e.target.value)}
                  placeholder="Add remarks visible to the patient…"
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "2px solid rgba(28,110,115,0.15)",
                    borderRadius: 10, fontSize: 14,
                    background: "#fff", outline: "none",
                    color: "#1e293b", fontFamily: "inherit",
                    resize: "vertical", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--primary-color, #1c6e73)"}
                  onBlur={e => e.target.style.borderColor = "rgba(28,110,115,0.15)"}
                />
              </div>

              {saveMsg && (
                <p style={{
                  margin: 0, fontSize: 13, fontWeight: 600, textAlign: "center",
                  color: saveMsg.includes("success") ? "#15803d" : "#dc2626",
                }}>
                  {saveMsg}
                </p>
              )}

              <button
                onClick={handleUpdateStatus}
                disabled={saving}
                style={{
                  padding: "13px", borderRadius: 12, border: "none",
                  background: "var(--primary-color, #1c6e73)", color: "#fff",
                  fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1, fontFamily: "inherit",
                  boxShadow: "0 4px 12px rgba(28,110,115,0.2)",
                }}
              >
                {saving ? "Saving…" : "Save Update"}
              </button>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9" }}>
              <button
                onClick={() => setSelected(null)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12,
                  border: "none", background: "#f1f5f9", color: "#475569",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}