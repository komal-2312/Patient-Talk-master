import React, { useEffect, useState } from "react";
import "./EditFeedback.css";
import "./AdminLayout.css";
import { useNavigate, useParams } from "react-router-dom";
import { useDialog } from "../components/DialogProvider";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

// ── Status / Priority config (frontend only, no schema change) ──
const STATUS_CONFIG = {
  "Pending":      { color: "#b45309", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
  "Under Review": { color: "#1d4ed8", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)"  },
  "Assigned":     { color: "#7c3aed", bg: "rgba(124,58,237,0.12)",  border: "rgba(124,58,237,0.3)"  },
  "In Progress":  { color: "#0369a1", bg: "rgba(14,165,233,0.12)",  border: "rgba(14,165,233,0.3)"  },
  "Resolved":     { color: "#15803d", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)"   },
  "Closed":       { color: "#374151", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)" },
  "Rejected":     { color: "#dc2626", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   },
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

// ── Small reusable status badge ──
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 9999, fontSize: 11,
      fontWeight: 700, letterSpacing: "0.03em",
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      whiteSpace: "nowrap",
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
      fontWeight: 700, letterSpacing: "0.03em",
      color: cfg.color, background: cfg.bg,
    }}>
      {priority}
    </span>
  );
}

export default function EditFeedback() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showDialog } = useDialog();

    const [feedback, setFeedback] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [questionError, setQuestionError] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [escalatedCount, setEscalatedCount] = useState(0);

    // Modal status update state — lives here, not in a separate page
    const [modalStatus, setModalStatus] = useState("");
    const [modalRemarks, setModalRemarks] = useState("");
    const [statusSaving, setStatusSaving] = useState(false);

    // ── Load feedback form ──
    useEffect(() => {
        fetch(`${BACKENDURL}/api/admin/getfeedbackform/${id}`, {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFeedback(data.data);
                    setQuestions(data.data.questions || []);
                    setIsActive(data.data.isActive);
                }
                setLoading(false);
            });
    }, [id]);

    // ── Load complaints ──
    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await fetch(
                    `${BACKENDURL}/api/admin/feedbackResponces/${id}`,
                    { credentials: "include" }
                );

                if (res.status === 401 || res.status === 412) {
                    showDialog("Session expired. Please log in again.", () => {
                        navigate("/login", { replace: true });
                    });
                    return;
                }

                const data = await res.json();
                if (data.success) {
                    setComplaints(data.data);
                    // Show escalation notice if backend auto-upgraded any priorities
                    if (data.escalated && data.escalated > 0) {
                        setEscalatedCount(data.escalated);
                    }
                }
            } catch (err) {
                console.error("Failed to load complaints", err);
            }
        };

        fetchComplaints();
    }, [id, navigate]);

    // Sync modal state when a complaint is selected
    useEffect(() => {
        if (selectedComplaint) {
            setModalStatus(selectedComplaint.status || "Pending");
            setModalRemarks(selectedComplaint.adminRemarks || "");
        }
    }, [selectedComplaint]);

    // ── Update complaint status from inside the modal ──
    const updateComplaintStatus = async () => {
        if (!selectedComplaint) return;
        setStatusSaving(true);
        try {
            const res = await fetch(
                `${BACKENDURL}/api/admin/complaint/${selectedComplaint.complaintId}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status: modalStatus, adminRemarks: modalRemarks }),
                }
            );
            const data = await res.json();

            if (!res.ok || !data.success) {
                showDialog(data.message || "Failed to update complaint");
                return;
            }

            // Update the complaint in the local list without a refetch
            setComplaints(prev =>
                prev.map(c =>
                    c._id === selectedComplaint._id
                        ? { ...c, status: data.data.status, adminRemarks: data.data.adminRemarks }
                        : c
                )
            );
            // Keep modal open with updated data
            setSelectedComplaint(prev => ({
                ...prev,
                status: data.data.status,
                adminRemarks: data.data.adminRemarks,
            }));
            showDialog("Complaint status updated successfully");
        } catch (err) {
            showDialog("Server error while updating complaint");
        } finally {
            setStatusSaving(false);
        }
    };

    // ── Delete a complaint response ──
    const deleteComplaint = async (responseId) => {
        const confirm = window.confirm("Delete this complaint permanently?");
        if (!confirm) return;

        try {
            const res = await fetch(
                `${BACKENDURL}/api/admin/deletefeedbackresponse/${responseId}`,
                { method: "DELETE", credentials: "include" }
            );

            const data = await res.json();
            if (!res.ok) {
                return showDialog(data.message || "Failed to delete complaint");
            }

            setComplaints(prev => prev.filter(c => c._id !== responseId));
            if (selectedComplaint?._id === responseId) setSelectedComplaint(null);
            showDialog("Complaint deleted");
        } catch (err) {
            showDialog("Server error while deleting complaint");
        }
    };

    const addQuestion = () => {
        if (!newQuestion.trim()) {
            setQuestionError("Question cannot be empty");
            return;
        }
        setQuestions([...questions, { text: newQuestion }]);
        setNewQuestion("");
        setQuestionError("");
        setHasUnsavedChanges(true);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
        setHasUnsavedChanges(true);
    };

    const saveChanges = async () => {
        if (questions.length === 0) {
            return showDialog("At least one question is required");
        }
        const res = await fetch(`${BACKENDURL}/api/admin/updatefeedbackform/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions, isActive }),
        });
        if (!res.ok) {
            const data = await res.json();
            return showDialog(data.message || "Update failed");
        }
        if (res.status === 200) {
            setHasUnsavedChanges(false);
            showDialog("Feedback updated", () => {
                navigate("/admin/dashboard", { replace: true });
            });
        }
    };

    const deleteFeedback = async () => {
        if (!window.confirm("Delete this feedback permanently?")) return;
        await fetch(`${BACKENDURL}/api/admin/deletefeedbackform/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        navigate("/admin/dashboard");
    };

    const downloadQR = async () => {
        const res = await fetch(
            `${BACKENDURL}/api/admin/feedback/${id}/qr`,
            { credentials: "include" }
        );
        if (res.status === 412) {
            const data = await res.json();
            showDialog(data.message || "Invalid or expired token", () => {
                navigate("/login", { replace: true });
            });
            return;
        }
        if (res.status !== 200) {
            const data = await res.json();
            return showDialog(data.message || "Failed to generate QR code");
        }
        const data = await res.json();
        const link = document.createElement("a");
        link.href = data.qr;
        link.download = "feedback-qr.png";
        link.click();
    };

    if (loading) return <p className="center">Loading...</p>;

    return (
        <div className="admin-page">
            {/* ── Navbar ── */}
            <nav className="admin-navbar">
                <div className="admin-nav-left">
                    <button className="admin-back-btn" onClick={() => navigate('/admin/dashboard')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Dashboard
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Edit Form
                    </div>
                    <h1 className="admin-page-title">{feedback?.feedback_name || "Edit Feedback"}</h1>
                </div>

                {/* ── Escalation Notice Banner ── */}
                {escalatedCount > 0 && (
                    <div style={{
                        maxWidth: 900, margin: "0 auto 20px",
                        padding: "12px 20px", borderRadius: 12,
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        display: "flex", alignItems: "center", gap: 10,
                        fontSize: 14, fontWeight: 600, color: "#dc2626",
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        {escalatedCount} complaint{escalatedCount > 1 ? "s were" : " was"} auto-escalated to High priority (pending &gt;48 hours)
                    </div>
                )}

                <div className="form-container">
                    {/* ── EXISTING QUESTIONS ── */}
                    <div className="section">
                        <h4>Form Questions</h4>
                        <div className="questions-list">
                            {questions.length === 0 ? (
                                <p className="muted">No questions available</p>
                            ) : (
                                questions.map((q, i) => (
                                    <div key={i} className="question-row">
                                        <span className="q-number">{i + 1}.</span>
                                        <span className="q-text">{q.text}</span>
                                        <button className="remove-q-btn" onClick={() => removeQuestion(i)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="divider">Add New Question</div>

                    {/* ── ADD QUESTION ── */}
                    <div className="section add-question-section">
                        <div className="input-group-vertical">
                            <input
                                placeholder="Enter question text"
                                value={newQuestion}
                                onChange={(e) => { setNewQuestion(e.target.value); setQuestionError(""); }}
                                onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                                style={questionError ? { borderColor: '#ef4444' } : {}}
                            />
                            <button className="add-btn-full" onClick={addQuestion}>Add Question</button>
                        </div>
                        {questionError && (
                            <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', marginTop: '6px', display: 'block' }}>
                                {questionError}
                            </span>
                        )}
                    </div>

                    {/* ── COMPLAINTS / FEEDBACK RESPONSES ── */}
                    <div className="section complaints-section">
                        <h4 className="complaints-title">
                            Feedback Responses
                            {complaints.length > 0 && (
                                <span style={{
                                    marginLeft: 10, padding: "3px 10px",
                                    borderRadius: 9999, fontSize: 12,
                                    background: "rgba(28,110,115,0.1)",
                                    color: "var(--primary-color)",
                                    fontWeight: 700,
                                }}>
                                    {complaints.length}
                                </span>
                            )}
                        </h4>
                        <div className="complaint-list">
                            {complaints.length === 0 ? (
                                <p className="muted">No responses yet</p>
                            ) : (
                                <>
                                    {complaints.slice(0, visibleCount).map((complaint, idx) => {
                                        const ageHours = (new Date() - new Date(complaint.createdAt)) / (1000 * 60 * 60);
                                        const isOverdue = ageHours > 48 && !["Resolved", "Closed", "Rejected"].includes(complaint.status);

                                        return (
                                            <div
                                                key={complaint._id}
                                                className="complaint-list-item"
                                                style={isOverdue ? { borderLeft: "3px solid #dc2626" } : {}}
                                            >
                                                <div className="complaint-info">
                                                    {/* Complaint ID + overdue indicator */}
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                        <span className="complaint-id">
                                                            {complaint.complaintId || `#${complaints.length - idx}`}
                                                        </span>
                                                        {isOverdue && (
                                                            <span style={{
                                                                fontSize: 10, fontWeight: 700,
                                                                color: "#dc2626", background: "rgba(239,68,68,0.1)",
                                                                padding: "2px 6px", borderRadius: 4,
                                                                letterSpacing: "0.04em",
                                                            }}>
                                                                OVERDUE
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Status + Priority row */}
                                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                                                        <StatusBadge status={complaint.status} />
                                                        <PriorityBadge priority={complaint.priority} />
                                                    </div>

                                                    <span className="complaint-date">
                                                        {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="complaint-actions">
                                                    <button
                                                        className="view-details-btn"
                                                        onClick={() => setSelectedComplaint(complaint)}
                                                    >
                                                        Manage
                                                    </button>
                                                    <button
                                                        className="delete-icon-btn"
                                                        onClick={() => deleteComplaint(complaint._id)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="view-more-row">
                                        {complaints.length > visibleCount && (
                                            <button className="view-more-btn" onClick={() => setVisibleCount(prev => prev + 5)}>
                                                View More ({complaints.length - visibleCount} left)
                                            </button>
                                        )}
                                        {visibleCount > 3 && (
                                            <button className="view-less-btn" onClick={() => setVisibleCount(3)}>
                                                View Less
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── FORM ACTIONS ── */}
                    <div className="section actions-section">
                        <div className="toggle-row">
                            <span>Form Status</span>
                            <div className="status-toggle">
                                <span className={isActive ? "status-active" : "status-closed"}>
                                    {isActive ? "Active" : "Closed"}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={!isActive}
                                    onChange={() => { setIsActive(!isActive); setHasUnsavedChanges(true); }}
                                    title={isActive ? "Close Form" : "Open Form"}
                                />
                            </div>
                        </div>
                        {hasUnsavedChanges && (
                            <div style={{ color: '#d97706', backgroundColor: '#fef3c7', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontWeight: '500', fontSize: '14px' }}>
                                Note: click save to apply changes
                            </div>
                        )}
                        <div className="form-actions-grid">
                            <button className="save-btn-large" onClick={saveChanges}>Save Changes</button>
                            <button className="qr-btn-large" onClick={downloadQR}>Download QR</button>
                            <button className="delete-btn-large" onClick={deleteFeedback}>Delete Form</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                COMPLAINT MANAGEMENT MODAL
                Full status update lives here — correct place
            ══════════════════════════════════════════ */}
            {selectedComplaint && (
                <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="modal-header">
                            <div>
                                <h3 style={{ margin: "0 0 6px" }}>Complaint Details</h3>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <StatusBadge status={selectedComplaint.status} />
                                    <PriorityBadge priority={selectedComplaint.priority} />
                                    {selectedComplaint.complaintId && (
                                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, fontFamily: "monospace" }}>
                                            {selectedComplaint.complaintId}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="close-modal-btn" onClick={() => setSelectedComplaint(null)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Modal Body — scrollable */}
                        <div className="modal-body">
                            <div className="modal-meta-info">
                                <span>Submitted: {new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                                <span>Dept: {selectedComplaint.departmentAssigned || "—"}</span>
                            </div>

                            {/* ── Answer cards ── */}
                            <div className="responses-grid">
                                {selectedComplaint.responses.map((r, qIdx) => (
                                    <div key={qIdx} className="response-card">
                                        <p className="response-question">
                                            <span className="q-label">Q:</span>{" "}
                                            {questions.find(q => String(q._id) === String(r.questionId))?.text || r.questionText || "Question deleted"}
                                        </p>
                                        <div className="response-answer">
                                            <span className="a-label">A:</span>
                                            {r.answerType === "text" && <div className="ans-text">{r.answerText || "—"}</div>}
                                            {r.answerType === "rating" && (
                                                <div className="ans-rating" style={{ display: 'flex', gap: '2px' }}>
                                                    {Array.from({ length: r.ratingValue || 0 }).map((_, i) => (
                                                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                    ))}
                                                    <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 4 }}>{r.ratingValue}/5</span>
                                                </div>
                                            )}
                                            {r.answerType === "image" && r.mediaUrl && (
                                                <img src={`${BACKENDURL}${r.mediaUrl}`} alt="Feedback" className="ans-media" onClick={() => window.open(`${BACKENDURL}${r.mediaUrl}`, "_blank")} />
                                            )}
                                            {r.answerType === "video" && r.mediaUrl && (
                                                <video controls src={`${BACKENDURL}${r.mediaUrl}`} className="ans-media" />
                                            )}
                                            {r.answerType === "audio" && r.mediaUrl && (
                                                <audio controls src={`${BACKENDURL}${r.mediaUrl}`} className="ans-audio" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── Status Update Panel ── */}
                            <div style={{
                                marginTop: 24, padding: "20px", borderRadius: 14,
                                background: "rgba(28,110,115,0.04)",
                                border: "1px solid rgba(28,110,115,0.12)",
                            }}>
                                <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                                    Update Complaint
                                </h4>

                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {/* Status selector */}
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
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
                                                color: "#1e293b", fontFamily: "inherit",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {ALLOWED_STATUSES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Admin remarks */}
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                                            Admin Remarks
                                        </label>
                                        <textarea
                                            value={modalRemarks}
                                            onChange={e => setModalRemarks(e.target.value)}
                                            placeholder="Add remarks visible to the patient when they track this complaint…"
                                            rows={3}
                                            style={{
                                                width: "100%", padding: "10px 14px",
                                                border: "2px solid rgba(28,110,115,0.15)",
                                                borderRadius: 10, fontSize: 14,
                                                background: "#fff", outline: "none",
                                                color: "#1e293b", fontFamily: "inherit",
                                                resize: "vertical", boxSizing: "border-box",
                                                transition: "border-color 0.2s",
                                            }}
                                            onFocus={e => e.target.style.borderColor = "var(--primary-color, #1c6e73)"}
                                            onBlur={e => e.target.style.borderColor = "rgba(28,110,115,0.15)"}
                                        />
                                    </div>

                                    <button
                                        onClick={updateComplaintStatus}
                                        disabled={statusSaving}
                                        style={{
                                            padding: "12px 20px", borderRadius: 10, border: "none",
                                            background: "var(--primary-color, #1c6e73)", color: "#fff",
                                            fontWeight: 700, fontSize: 14, cursor: statusSaving ? "not-allowed" : "pointer",
                                            opacity: statusSaving ? 0.7 : 1, fontFamily: "inherit",
                                            boxShadow: "0 4px 12px rgba(28,110,115,0.2)",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        {statusSaving ? "Saving…" : "Save Status Update"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer">
                            <button className="modal-close-btn" onClick={() => setSelectedComplaint(null)}>
                                Close
                            </button>
                            <button className="modal-delete-btn" onClick={() => deleteComplaint(selectedComplaint._id)}>
                                Delete Response
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