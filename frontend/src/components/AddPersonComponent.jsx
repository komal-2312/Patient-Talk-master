import React, { useState } from "react";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function AddPersonModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  const submit = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim())) newErrors.mobile = "Invalid mobile number";
    
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = "Invalid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await fetch(`${BACKENDURL}/api/admin/addFeedbackPerson`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setErrors({ global: data.message || "Failed to add person" });
      return;
    }

    onAdd(data.data);
  };

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div className="modern-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div className="modal-icon-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
          </div>
          <h3>Add Team Member</h3>
          <p className="modal-subtitle">Create a new contact for feedback assignment</p>
        </div>

        <div className="modal-inputs-group">
          {errors.global && <div style={{color: '#ef4444', fontSize: '13px', fontWeight: '600', textAlign: 'center', marginBottom: '8px'}}>{errors.global}</div>}
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <div className={`modern-input-wrapper ${errors.name ? 'has-error' : ''}`}>
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }) }}
                style={errors.name ? { borderColor: '#ef4444' } : {}}
              />
            </div>
            {errors.name && <span style={{color: '#ef4444', fontSize: '12px', fontWeight: '600', marginLeft: '12px'}}>{errors.name}</span>}
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <div className={`modern-input-wrapper ${errors.mobile ? 'has-error' : ''}`}>
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <input
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) => { setForm({ ...form, mobile: e.target.value }); setErrors({ ...errors, mobile: "" }) }}
                style={errors.mobile ? { borderColor: '#ef4444' } : {}}
              />
            </div>
            {errors.mobile && <span style={{color: '#ef4444', fontSize: '12px', fontWeight: '600', marginLeft: '12px'}}>{errors.mobile}</span>}
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <div className={`modern-input-wrapper ${errors.email ? 'has-error' : ''}`}>
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }) }}
                style={errors.email ? { borderColor: '#ef4444' } : {}}
              />
            </div>
            {errors.email && <span style={{color: '#ef4444', fontSize: '12px', fontWeight: '600', marginLeft: '12px'}}>{errors.email}</span>}
          </div>
        </div>

        <div className="modal-footer-actions">
          <button onClick={onClose} className="modern-btn-secondary">
            Cancel
          </button>
          <button onClick={submit} disabled={loading} className="modern-btn-primary">
            {loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}