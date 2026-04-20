import React, { useEffect, useState } from "react";
import "./AdminAssignPerson.css";
import "./AdminLayout.css";
import { useNavigate } from "react-router-dom";
import AddPersonModal from "../components/AddPersonComponent";
import PersonList from "../components/ViewAssignPerson";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function AdminAssignPage() {
  const navigate = useNavigate();

  const [persons, setPersons] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          fetch(`${BACKENDURL}/api/admin/getFeedbackPersons`, {
            credentials: "include",
          }),
          fetch(`${BACKENDURL}/api/admin/getFeedbackForms`, {
            credentials: "include",
          }),
        ]);

        if (pRes.status === 412 || fRes.status === 412) {
          navigate("/login", { replace: true });
          return;
        }

        const pData = await pRes.json();
        const fData = await fRes.json();

        if (pData.success) setPersons(pData.data || []);
        if (fData.success) setFeedbacks(fData.data || []);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) return <p className="center">Loading...</p>;
  if (error) return <p className="center error">{error}</p>;

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Manage Team
          </div>
          <h1 className="admin-page-title">Contact Persons</h1>
          <p className="admin-page-subtitle">Assign feedback responsibility to team members</p>
        </div>
        <div className="content-container">

          <PersonList persons={persons} feedbacks={feedbacks} setFeedbacks={setFeedbacks} />
        </div>
      </div>

      {/* FAB */}
      <button className="admin-fab" onClick={() => setShowAddModal(true)} title="Add Person">＋</button>

      {/* Modal */}
      {showAddModal && (
        <AddPersonModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newPerson) => {
            setPersons((prev) => [newPerson, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}

      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}