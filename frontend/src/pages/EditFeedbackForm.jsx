import React, { useEffect, useState } from "react";
import "./EditFeedback.css";
import "./AdminLayout.css";
import { useNavigate, useParams } from "react-router-dom";
import { useDialog } from "../components/DialogProvider";


const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function EditFeedback() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showDialog } = useDialog();

    const [feedback, setFeedback] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [questionError, setQuestionError] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [complaints, setComplaints] = useState([]); // future
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // 🔹 Load feedback
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

    // 🔹 Load complaints (responses)
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
                }
            } catch (err) {
                console.error("Failed to load complaints", err);
            }
        };

        fetchComplaints();
    }, [id, navigate]);

    const deleteComplaint = async (responseId) => {
        const confirm = window.confirm("Delete this complaint permanently?");
        if (!confirm) return;

        try {
            const res = await fetch(
                `${BACKENDURL}/api/admin/deletefeedbackresponse/${responseId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                return showDialog(data.message || "Failed to delete complaint");
            }

            // 🔄 Remove from UI immediately
            setComplaints((prev) =>
                prev.filter((c) => c._id !== responseId)
            );
            
            if (selectedComplaint?._id === responseId) {
                setSelectedComplaint(null);
            }

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
            body: JSON.stringify({
                questions,
                isActive,
            }),
        });
        if (!res.ok) {
            const data = await res.json();
            return showDialog(data.message || "Update failed");
        }
        if (res.status === 412) {
            const data = await res.json();
            return showDialog(data.message || "Invalid or expired token");
        }

        if (res.status === 200) {
            setHasUnsavedChanges(false);
            showDialog("Feedback updated", () => {
                navigate("/admin/dashboard", { replace: true });
            });
        } else {
            showDialog("Update failed");
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
            {/* Navbar */}
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

                <div className="form-container">
                    {/* EXISTING QUESTIONS */}
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

                    {/* ADD QUESTION */}
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
                        {questionError && <span style={{color: '#ef4444', fontSize: '12px', fontWeight: '600', marginTop: '6px', display: 'block'}}>{questionError}</span>}
                    </div>

                    {/* COMPLAINTS / FEEDBACK RESPONSES */}
                    <div className="section complaints-section">
                        <h4 className="complaints-title">Feedback Responses</h4>
                        <div className="complaint-list">
                            {complaints.length === 0 ? (
                                <p className="muted">No responses yet</p>
                            ) : (
                                <>
                                    {complaints.slice(0, visibleCount).map((complaint, idx) => (
                                        <div key={complaint._id} className="complaint-list-item">
                                            <div className="complaint-info">
                                                <span className="complaint-id">#{complaints.length - idx}</span>
                                                <span className="complaint-date">
                                                    {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="complaint-actions">
                                                <button 
                                                    className="view-details-btn" 
                                                    onClick={() => setSelectedComplaint(complaint)}
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    className="delete-icon-btn" 
                                                    onClick={() => deleteComplaint(complaint._id)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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

                    {/* ACTIONS */}
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
                                    onChange={() => {
                                        setIsActive(!isActive);
                                        setHasUnsavedChanges(true);
                                    }}
                                    title={isActive ? "Close Form" : "Open Form"}
                                />
                            </div>
                        </div>
                        {hasUnsavedChanges && (
                            <div style={{ color: '#d97706', backgroundColor: '#fef3c7', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontWeight: '500', fontSize: '14px' }}>
                                Note: click on save button for save changes
                            </div>
                        )}
                        <div className="form-actions-grid">
                            <button className="save-btn-large" onClick={saveChanges}>
                                Save Changes
                            </button>
                            <button className="qr-btn-large" onClick={downloadQR}>
                                Download QR
                            </button>
                            <button className="delete-btn-large" onClick={deleteFeedback}>
                                Delete Form
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL OVERLAY */}
            {selectedComplaint && (
                <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Feedback Details</h3>
                            <button className="close-modal-btn" onClick={() => setSelectedComplaint(null)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-meta-info">
                                <span>Date: {new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                                <span>ID: {selectedComplaint._id}</span>
                            </div>
                            <div className="responses-grid">
                                {selectedComplaint.responses.map((r, qIdx) => (
                                    <div key={qIdx} className="response-card">
                                        <p className="response-question">
                                            <span className="q-label">Q:</span> {questions.find(q => String(q._id) === String(r.questionId))?.text || "Question deleted"}
                                        </p>
                                        <div className="response-answer">
                                            <span className="a-label">A:</span>
                                            {r.answerType === "text" && <div className="ans-text">{r.answerText}</div>}
                                            {r.answerType === "rating" && (
                                                <div className="ans-rating" style={{ display: 'flex', gap: '2px' }}>
                                                    {Array.from({ length: r.ratingValue || 0 }).map((_, i) => (
                                                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                    ))}
                                                </div>
                                            )}
                                            {r.answerType === "image" && (
                                                <img src={`${BACKENDURL}${r.mediaUrl}`} alt="Feedback" className="ans-media" onClick={() => window.open(`${BACKENDURL}${r.mediaUrl}`, "_blank")} />
                                            )}
                                            {r.answerType === "video" && (
                                                <video controls src={`${BACKENDURL}${r.mediaUrl}`} className="ans-media" />
                                            )}
                                            {r.answerType === "audio" && (
                                                <audio controls src={`${BACKENDURL}${r.mediaUrl}`} className="ans-audio" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-close-btn" onClick={() => setSelectedComplaint(null)}>Close</button>
                            <button className="modal-delete-btn" onClick={() => deleteComplaint(selectedComplaint._id)}>Delete Response</button>
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
