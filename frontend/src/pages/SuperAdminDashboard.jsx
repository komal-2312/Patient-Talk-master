import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hospitals'); // 'hospitals' or 'logs'
  const [searchQuery, setSearchQuery] = useState('');

  const [hospitals, setHospitals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Filtering state for Logs
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL', 'LOGIN', 'REGISTRATION', 'FORM_CREATED', 'FORM_EDITED', 'FEEDBACK_SUBMISSION', 'FEEDBACK_DELETED', 'ERROR'
  const [logSortOrder, setLogSortOrder] = useState('DESC'); // 'DESC' (Newest) or 'ASC' (Oldest)

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${BACKENDURL}/api/superadmin/hospitals`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
      } else {
        if (res.status === 412) navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BACKENDURL}/api/superadmin/logs`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await fetchHospitals();
      await fetchLogs();
      setLoading(false);
    };
    initFetch();

    // Set a consistent primary/secondary color for SuperAdmin if not set
    document.documentElement.style.setProperty('--primary-color', '#1c6e73');
    document.documentElement.style.setProperty('--secondary-color', '#9ed6df');
    document.body.style.background = '#9ed6df';
  }, [navigate]);

  const toggleHospitalStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`${BACKENDURL}/api/superadmin/hospitals/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchHospitals(); // refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKENDURL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      navigate("/login", { replace: true });
    }
  };

  const [selectedHospital, setSelectedHospital] = useState(null);

  const filteredHospitals = hospitals.filter((h) =>
    h.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAndSortedLogs = logs
    .filter((log) => logFilter === 'ALL' || log.type === logFilter)
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return logSortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="admin-page">
      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          {/* Empty left nav for symmetry */}
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
          <button className="admin-back-btn" onClick={handleLogout} style={{ color: '#e55353', borderColor: 'rgba(229,83,83,0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Hospital Details Modal Popup */}
      {selectedHospital && (
        <>
          <div className="admin-menu-overlay" onClick={() => setSelectedHospital(null)} style={{ zIndex: 1000 }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '500px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 1)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
            zIndex: 1001
          }}>
            <button 
              onClick={() => setSelectedHospital(null)} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(11,28,40,0.4)', transition: 'color 0.2s', padding: '4px' }}
              onMouseEnter={(e) => e.target.style.color = '#e55353'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(11,28,40,0.4)'}
            >✖</button>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Hospital Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', fontSize: '15px' }}>
              <p style={{ margin: 0, padding: '12px', background: 'rgba(28, 110, 115, 0.04)', borderRadius: '12px' }}><strong>Name:</strong><br/> <span style={{ color: 'var(--text-muted)' }}>{selectedHospital.hospital_name}</span></p>
              <p style={{ margin: 0, padding: '12px', background: 'rgba(28, 110, 115, 0.04)', borderRadius: '12px' }}><strong>Email:</strong><br/> <span style={{ color: 'var(--text-muted)' }}>{selectedHospital.hospital_email}</span></p>
              <p style={{ margin: 0, padding: '12px', background: 'rgba(28, 110, 115, 0.04)', borderRadius: '12px' }}><strong>Phone:</strong><br/> <span style={{ color: 'var(--text-muted)' }}>{selectedHospital.hospital_phno}</span></p>
              <p style={{ margin: 0, padding: '12px', background: 'rgba(28, 110, 115, 0.04)', borderRadius: '12px' }}><strong>Location:</strong><br/> <span style={{ color: 'var(--text-muted)' }}>{selectedHospital.location}</span></p>
              <p style={{ margin: 0, padding: '12px', background: 'rgba(28, 110, 115, 0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Status:</strong>
                <span style={{ 
                  display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  background: selectedHospital.isActive ? 'rgba(56, 142, 60, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                  color: selectedHospital.isActive ? '#388e3c' : '#d32f2f'
                }}>
                  {selectedHospital.isActive ? 'Active' : 'Deactivated'}
                </span>
              </p>
              <p style={{ margin: 0, padding: '12px', background: 'rgba(28, 110, 115, 0.04)', borderRadius: '12px' }}><strong>Created At:</strong><br/> <span style={{ color: 'var(--text-muted)' }}>{new Date(selectedHospital.createdAt).toLocaleString()}</span></p>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  style={{ background: '#f5f7f9', color: '#455a64', border: '1px solid #dce1e6', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', borderRadius: '8px', fontWeight: 600, transition: 'all 0.2s' }}
                  onClick={() => setSelectedHospital(null)}
                  onMouseEnter={(e) => { e.target.style.background = '#eef1f5'; e.target.style.borderColor = '#c6cdd4'; }}
                  onMouseLeave={(e) => { e.target.style.background = '#f5f7f9'; e.target.style.borderColor = '#dce1e6'; }}
                >
                  Close
                </button>
            </div>
          </div>
        </>
      )}

      {/* Content Container */}
      <div className="admin-content admin-content--wide">

        <div className="admin-page-header">
          <div className="admin-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            System Operations
          </div>
          <h1 className="admin-page-title">SuperAdmin Dashboard</h1>
          <p className="admin-page-subtitle">Manage registered hospitals and view global system logs</p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('hospitals')}
            style={{
              padding: '10px 24px',
              borderRadius: '9999px',
              border: activeTab === 'hospitals' ? 'none' : '1px solid rgba(28, 110, 115, 0.15)',
              background: activeTab === 'hospitals' ? 'var(--primary-color)' : 'rgba(255,255,255,0.7)',
              color: activeTab === 'hospitals' ? '#fff' : 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'hospitals' ? '0 4px 12px rgba(28, 110, 115, 0.2)' : 'none'
            }}>
            List of Hospitals
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '10px 24px',
              borderRadius: '9999px',
              border: activeTab === 'logs' ? 'none' : '1px solid rgba(28, 110, 115, 0.15)',
              background: activeTab === 'logs' ? 'var(--primary-color)' : 'rgba(255,255,255,0.7)',
              color: activeTab === 'logs' ? '#fff' : 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'logs' ? '0 4px 12px rgba(28, 110, 115, 0.2)' : 'none'
            }}>
            System Logs
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-loading-text">Loading operations...</p>
          </div>
        ) : (
          <div className="admin-glass-card" style={{ padding: '32px' }}>
            {activeTab === 'hospitals' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(11,28,40,0.4)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input
                    type="text"
                    placeholder="Search by Name or City/Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: '2px solid rgba(28,110,115,0.1)',
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: '12px',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(28,110,115,0.1)'}
                  />
                </div>



                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredHospitals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No hospitals match your search.
                    </div>
                  )}
                  {filteredHospitals.map(h => (
                    <div key={h._id} style={{
                      background: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(28,110,115,0.06)',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: h.isActive ? 1 : 0.6,
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h3
                          style={{ margin: 0, fontSize: '16px', fontWeight: 600, cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
                          onClick={() => setSelectedHospital(h)}
                          title="View details"
                        >
                          {h.hospital_name}
                          {!h.isActive && <span style={{ fontSize: '11px', color: '#d32f2f', fontWeight: 500, background: 'rgba(211,47,47,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Deactivated</span>}
                        </h3>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{h.location}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          style={{ background: '#f5f7f9', color: '#455a64', border: '1px solid #dce1e6', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', borderRadius: '8px', fontWeight: 500, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => navigate(`/super-admin/hospital/${h._id}/complaints`)}
                          onMouseEnter={(e) => { e.target.style.background = '#eef1f5'; e.target.style.borderColor = '#c6cdd4'; }}
                          onMouseLeave={(e) => { e.target.style.background = '#f5f7f9'; e.target.style.borderColor = '#dce1e6'; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          View Forms
                        </button>
                        <button
                          style={{
                            background: h.isActive ? 'rgba(211, 47, 47, 0.05)' : 'rgba(56, 142, 60, 0.05)',
                            color: h.isActive ? '#d32f2f' : '#388e3c',
                            border: `1px solid ${h.isActive ? 'rgba(211, 47, 47, 0.2)' : 'rgba(56, 142, 60, 0.2)'}`,
                            padding: '8px 14px', cursor: 'pointer', fontSize: '13px', borderRadius: '8px', fontWeight: 600, transition: 'all 0.2s'
                          }}
                          onClick={() => toggleHospitalStatus(h._id, h.isActive)}
                          onMouseEnter={(e) => { e.target.style.background = h.isActive ? 'rgba(211,47,47,0.1)' : 'rgba(56,142,60,0.1)'; }}
                          onMouseLeave={(e) => { e.target.style.background = h.isActive ? 'rgba(211,47,47,0.05)' : 'rgba(56,142,60,0.05)'; }}
                        >
                          {h.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(28,110,115,0.1)', paddingBottom: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  System Operation Logs
                </h3>

                {/* Log Controls */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Filter:</span>
                    <select 
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(28, 110, 115, 0.2)',
                        background: '#fff',
                        fontSize: '13px',
                        outline: 'none',
                        color: 'var(--text-main)',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ALL">All Activities</option>
                      <option value="LOGIN">Logins Only</option>
                      <option value="FEEDBACK_SUBMISSION">Feedback Submissions</option>
                      <option value="FORM_CREATED">Forms Created</option>
                      <option value="FORM_EDITED">Forms Edited</option>
                      <option value="REGISTRATION">New Registrations</option>
                      <option value="FEEDBACK_DELETED">Form Deletions</option>
                      <option value="ERROR">System Errors</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => setLogSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(28, 110, 115, 0.2)',
                      background: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--primary-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {logSortOrder === 'DESC' ? <path d="M12 5v14M5 12l7 7 7-7"/> : <path d="M12 19V5M5 12l7-7 7 7"/>}
                    </svg>
                    {logSortOrder === 'DESC' ? 'Newest First' : 'Oldest First'}
                  </button>
                </div>

                <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                  {filteredAndSortedLogs.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No logs found matching your criteria.</div> : null}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredAndSortedLogs.map((log, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        borderLeft: log.type === 'ERROR' ? '4px solid #d32f2f' : (log.type === 'REGISTRATION' ? '4px solid #388e3c' : '4px solid var(--primary-color)')
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '12px', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                            {log.type}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                            {new Date(log.timestamp).toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </span>
                        </div>
                        <div style={{ color: '#455a64' }}>
                          {log.type === 'LOGIN' && `Hospital ${log.hospital_name || log.hospital_email} logged in.`}
                          {log.type === 'REGISTRATION' && `New hospital "${log.hospital_name}" registered.`}
                          {log.type === 'FORM_CREATED' && `Feedback form "${log.department_name}" created.`}
                          {log.type === 'FORM_EDITED' && `Feedback form ${log.feedbackId} edited.`}
                          {log.type === 'FEEDBACK_SUBMISSION' && `Feedback submitted for form ${log.feedbackId}.`}
                          {log.type === 'FEEDBACK_DELETED' && `Feedback form deleted.`}
                          {log.type === 'ERROR' && `Error: ${log.message}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}

