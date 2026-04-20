import React, { useState } from "react";
import { useDialog } from "./DialogProvider";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function PersonList({ persons, feedbacks, setFeedbacks }) {
  const [loadingMap, setLoadingMap] = useState({});
  const [selectedMap, setSelectedMap] = useState({});
  const { showDialog } = useDialog();

  const toggleAssign = async (feedbackId, personId, assign) => {
    setLoadingMap((p) => ({ ...p, [feedbackId + personId]: true }));

    // 🔁 OPTIMISTIC UI UPDATE
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb._id === feedbackId
          ? {
              ...fb,
              assignedTo: assign
                ? [...(fb.assignedTo || []), personId]
                : (fb.assignedTo || []).filter((id) => id !== personId),
            }
          : fb
      )
    );

    try {
      await fetch(`${BACKENDURL}/api/admin/assignFeedbackPerson`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          feedbackId,
          personId,
          assign: assign,
        }),
      });
    } catch (err) {
      showDialog("Failed to update assignment");
    } finally {
      setLoadingMap((p) => ({ ...p, [feedbackId + personId]: false }));
    }
  };

  const handleSelectPerson = (feedbackId, personId) => {
    setSelectedMap(prev => ({ ...prev, [feedbackId]: personId }));
  };

  const handleAddPerson = (feedbackId) => {
    const personId = selectedMap[feedbackId];
    if (!personId) return showDialog("Please select an employee first");
    toggleAssign(feedbackId, personId, true);
    setSelectedMap(prev => ({ ...prev, [feedbackId]: "" }));
  };

  return (
    <div className="best-design-grid">
      {feedbacks.map((fb, index) => {
        const assignedPersons = persons.filter(p => fb.assignedTo?.includes(p._id));
        const unassignedPersons = persons.filter(p => !fb.assignedTo?.includes(p._id));
        const selectedPersonId = selectedMap[fb._id] || "";

        return (
          <div 
            key={fb._id} 
            className="modern-assign-card" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Card Left: Form Identity */}
            <div className="card-column-identity">
               <div className="identity-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
               </div>
               <div className="identity-text">
                  <span className="mini-label">Feedback Form</span>
                  <p className="main-title">{fb.feedback_name}</p>
               </div>
            </div>

            {/* Card Middle: Team Flow */}
            <div className="card-column-team">
               <span className="mini-label">Team Members</span>
               <div className="pill-container">
                  {assignedPersons.length === 0 ? (
                    <span className="empty-placeholder">Waiting for assignment...</span>
                  ) : (
                    assignedPersons.map((p) => (
                      <div key={p._id} className="modern-pill">
                        <span className="pill-text">{p.name}</span>
                        <button 
                          className="pill-close" 
                          onClick={() => toggleAssign(fb._id, p._id, false)}
                          disabled={loadingMap[fb._id + p._id]}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
               </div>
            </div>

            {/* Card Right: Action Zone */}
            <div className="card-column-action">
               <div className="selection-wrapper">
                  <select 
                    className="best-select"
                    value={selectedPersonId}
                    onChange={(e) => handleSelectPerson(fb._id, e.target.value)}
                  >
                    <option value="" disabled>Select Employee</option>
                    {unassignedPersons.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  <button 
                    className="glow-add-btn" 
                    onClick={() => handleAddPerson(fb._id)}
                    disabled={!selectedPersonId}
                  >
                    ＋
                  </button>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}