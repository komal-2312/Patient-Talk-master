import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminLayout.css';

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function SuperAdminComplaintBoard() {
    const navigate = useNavigate();
    const { hospitalId } = useParams();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const res = await fetch(`${BACKENDURL}/api/superadmin/hospitals/${hospitalId}/feedbacks`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    setForms(data.data);
                } else {
                    if (res.status === 412) navigate("/login");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchForms();
        
        // Ensure consistent SuperAdmin theme
        document.documentElement.style.setProperty('--primary-color', '#1c6e73');
        document.documentElement.style.setProperty('--secondary-color', '#9ed6df');
        document.body.style.background = '#9ed6df';
    }, [hospitalId, navigate]);

    return (
        <div className="admin-page">
            {/* Navbar */}
            <nav className="admin-navbar">
              <div className="admin-nav-left">
                <button className="admin-back-btn" onClick={() => navigate('/superadmin/dashboard', { replace: true })}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  Back to Dashboard
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

            <main className="admin-content admin-content--wide">
                <div className="admin-page-header">
                  <div className="admin-header-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Hospital View
                  </div>
                  <h1 className="admin-page-title">Existing Feedback Forms</h1>
                  <p className="admin-page-subtitle">View and manage feedback forms assigned to this hospital</p>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-spinner"></div>
                        <p className="admin-loading-text">Loading forms...</p>
                    </div>
                ) : (
                    <div className="admin-glass-card">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {forms.map((form) => (
                                <div
                                    key={form._id}
                                    onClick={() => navigate(`/super-admin/hospital/${hospitalId}/form/${form._id}`)}
                                    style={{ 
                                        background: form.isActive ? '#fff' : 'rgba(255,255,255,0.6)', 
                                        border: '1px solid rgba(28, 110, 115, 0.1)',
                                        padding: '24px', 
                                        borderRadius: '16px', 
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        filter: form.isDeleted ? 'grayscale(0.8)' : 'none'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(28, 110, 115, 0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                                >
                                    {form.isDeleted && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ffebee', color: '#c62828', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                                            DELETED
                                        </div>
                                    )}
                                    
                                    <div style={{ 
                                        width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(28, 110, 115, 0.05)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                                        overflow: 'hidden', border: '2px solid rgba(28, 110, 115, 0.1)'
                                    }}>
                                        {form.logo_png ? (
                                            <img src={form.logo_png} alt={form.feedback_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.5}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        )}
                                    </div>
                                    <h3 style={{
                                            margin: '0 0 8px 0',
                                            fontWeight: 700,
                                            fontSize: '18px',
                                            color: form.isDeleted ? 'var(--text-muted)' : 'var(--text-main)',
                                            textDecoration: form.isDeleted ? 'line-through' : 'none',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {form.feedback_name || 'Unnamed Form'}
                                    </h3>
                                    
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                            {form.questions?.length || 0}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: form.isActive ? '#388e3c' : '#d32f2f' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{form.isActive ? <polyline points="20 6 9 17 4 12"></polyline> : <circle cx="12" cy="12" r="10"></circle>}</svg>
                                            {form.isActive ? 'Active' : 'Archived'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {forms.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.3, marginBottom: '16px'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                <p style={{ fontSize: '16px', margin: 0 }}>No feedback forms have been created yet by this hospital.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            <footer className="admin-footer">
                <p className="admin-footer-text">Powered by PatientTalkback</p>
            </footer>
        </div>
    )
}
