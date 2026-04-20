import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminLayout.css';

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function SuperAdminComplaintList() {
    const navigate = useNavigate();
    const { hospitalId, formId } = useParams();
    const [formData, setFormData] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFormAndResponses = async () => {
            try {
                setLoading(true);
                // Fetch Form details
                const formRes = await fetch(`${BACKENDURL}/api/superadmin/feedbacks/${formId}`, { credentials: 'include' });
                const formDataPayload = await formRes.json();
                if (formDataPayload.success) {
                    setFormData(formDataPayload.data);
                } else {
                    if (formRes.status === 412) return navigate("/login");
                }

                // Fetch Responses
                const responsesRes = await fetch(`${BACKENDURL}/api/superadmin/feedbacks/${formId}/responses`, { credentials: 'include' });
                const responsesPayload = await responsesRes.json();
                if (responsesPayload.success) {
                    setFeedbacks(responsesPayload.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFormAndResponses();
        
        // Ensure consistent SuperAdmin theme
        document.documentElement.style.setProperty('--primary-color', '#1c6e73');
        document.documentElement.style.setProperty('--secondary-color', '#9ed6df');
        document.body.style.background = '#9ed6df';
    }, [formId, navigate]);

    const handleViewComplaint = (response) => {
        setSelectedResponse(response);
    };

    return (
        <div className="admin-page">
            {/* Navbar */}
            <nav className="admin-navbar">
              <div className="admin-nav-left">
                <button className="admin-back-btn" onClick={() => navigate(`/super-admin/hospital/${hospitalId}/complaints`, { replace: true })}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  Back to Forms List
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
              </div>
            </nav>

            {/* Content Container */}
            <div className="admin-content admin-content--wide">
            
              <div className="admin-page-header">
                <div className="admin-header-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Form Responses Overview
                </div>
                <h1 className="admin-page-title">{formData ? formData.feedback_name : 'Loading...'}</h1>
                <p className="admin-page-subtitle">View user feedback submissions and form details</p>
              </div>

              {formData && (
                <div className="admin-glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    {formData.isDeleted && (
                        <div style={{ background: '#ffebee', color: '#c62828', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em' }}>
                            THIS FORM HAS BEEN DELETED
                        </div>
                    )}
                    <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontWeight: 600 }}>Form Questions Preview ({formData.questions?.length || 0})</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        {formData.questions?.map((q, idx) => (
                            <div key={q._id || idx} style={{ 
                              background: 'rgba(28, 110, 115, 0.06)', 
                              border: '1px solid rgba(28, 110, 115, 0.15)',
                              padding: '8px 12px', 
                              borderRadius: '8px', 
                              fontSize: '13px', 
                              color: 'var(--text-main)' 
                            }}>
                                <span style={{ fontWeight: 700, color: 'var(--primary-color)', marginRight: '4px' }}>Q{idx + 1}:</span> 
                                {q.text}
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* Split View */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* Left Panel - Feedback List */}
                <div className="admin-glass-card" style={{ flex: '1 1 350px', padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(28,110,115,0.03)' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                      Submitted Responses ({feedbacks.length})
                    </h2>
                  </div>
                  
                  {loading ? (
                    <div className="admin-loading" style={{ padding: '40px' }}><div className="admin-spinner"></div></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
                        {feedbacks.length === 0 ? <p style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', margin: 0 }}>No responses match this form.</p> : null}
                        {feedbacks.map((f, i) => {
                          const isSelected = selectedResponse?._id === f._id;
                          return (
                            <div 
                              key={f._id} 
                              onClick={() => handleViewComplaint(f)}
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 24px',
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isSelected ? 'var(--primary-color)' : 'transparent',
                                color: isSelected ? '#fff' : 'var(--text-main)'
                              }}
                              onMouseEnter={(e) => { 
                                if(!isSelected) e.currentTarget.style.background = 'rgba(28, 110, 115, 0.05)'; 
                              }}
                              onMouseLeave={(e) => { 
                                if(!isSelected) e.currentTarget.style.background = 'transparent'; 
                              }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '15px', color: f.isDeleted && !isSelected ? '#d32f2f' : 'inherit' }}>
                                      {f.isDeleted ? "Response (Deleted)" : `Response #${i + 1}`}
                                    </div>
                                    <div style={{ fontSize: '12px', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                                      {new Date(f.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ 
                                  width: '32px', height: '32px', 
                                  borderRadius: '50%', 
                                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(28,110,115,0.1)', 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: isSelected ? '#fff' : 'var(--primary-color)'
                                }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>

                {/* Right Panel - Feedback Details */}
                <div className="admin-glass-card" style={{ flex: '2 1 500px', padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(28,110,115,0.03)' }}>
                      <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Detailed Answers
                      </h2>
                    </div>

                    {selectedResponse ? (
                        <div style={{ padding: '24px', maxHeight: '600px', overflowY: 'auto' }}>
                            {selectedResponse.responses && selectedResponse.responses.map((r, i) => {
                                // Find corresponding question
                                const questionData = formData?.questions?.find(q => String(q._id) === String(r.questionId));
                                const questionText = questionData?.text || r.questionText || `Question ${i + 1}`;

                                return (
                                    <div key={i} style={{ marginBottom: '24px' }}>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-main)', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                            <span style={{ color: 'var(--primary-color)', background: 'rgba(28,110,115,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Q{i+1}</span>
                                            {questionText}
                                        </p>
                                        
                                        {r.answerType === 'text' && (
                                            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', padding: '16px', borderRadius: '12px', color: 'var(--text-main)', fontSize: '14px', lineHeight: 1.5, marginLeft: '32px' }}>
                                                {r.answerText || <span style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>No text provided</span>}
                                            </div>
                                        )}
                                        {r.answerType === 'voice' && (
                                            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid rgba(0,0,0,0.05)', padding: '12px 16px', borderRadius: '30px', gap: '12px', marginLeft: '32px' }}>
                                                {r.mediaUrl ? (
                                                  <>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                    </div>
                                                    <div style={{ flex: 1, height: '4px', background: 'rgba(28,110,115,0.2)', borderRadius: '2px', position: 'relative' }}>
                                                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '30%', background: 'var(--primary-color)', borderRadius: '2px' }}></div>
                                                    </div>
                                                    <a href={BACKENDURL + r.mediaUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none', padding: '6px 12px', background: 'rgba(28,110,115,0.1)', borderRadius: '16px' }}>Open Audio</a>
                                                  </>
                                                ) : <span style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>No Audio Provided</span>}
                                            </div>
                                        )}
                                        {r.answerType === 'rating' && (
                                            <div style={{ display: 'flex', gap: '4px', marginLeft: '32px' }}>
                                              {[1,2,3,4,5].map(star => (
                                                <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill={star <= r.ratingValue ? "#ffeb3b" : "none"} stroke={star <= r.ratingValue ? "#fbc02d" : "rgba(0,0,0,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                              ))}
                                              <span style={{ marginLeft: '8px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>{r.ratingValue}/5</span>
                                            </div>
                                        )}
                                        {r.answerType === 'emoji' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1px solid rgba(0,0,0,0.05)', padding: '16px', borderRadius: '12px', width: 'fit-content', marginLeft: '32px' }}>
                                                <span style={{ fontSize: '32px' }}>
                                                  {Number(r.ratingValue) <= 2 ? '😞' : Number(r.ratingValue) >= 4 ? '😃' : '😐'}
                                                </span>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Satisfaction Level</span>
                                                  <span style={{ fontWeight: 600 }}>{r.ratingValue} / 5</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(28, 110, 115, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>Select a response from the left panel<br/>to view the full detailed answers</p>
                        </div>
                    )}
                </div>

              </div>
            </div>

            <footer className="admin-footer">
                <p className="admin-footer-text">Powered by PatientTalkback</p>
            </footer>
        </div>
    );
}
