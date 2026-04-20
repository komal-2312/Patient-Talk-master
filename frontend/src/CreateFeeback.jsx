import React, { useState } from "react";
import "./CreateFeedback.css";
import "./pages/AdminLayout.css";
import { useNavigate } from "react-router-dom";
import { useDialog } from "./components/DialogProvider";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function CreateFeedback() {
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const [department, setDepartment] = useState("");
  const [image, setImage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size must be less than 3MB" }));
        e.target.value = "";
        return;
      }
      setErrors((prev) => ({ ...prev, image: "" }));
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addQuestion = () => {
    if (!questionText.trim()) return;
    setQuestions([...questions, { text: questionText }]);
    setQuestionText("");
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!department.trim()) {
      newErrors.department = "Department name is required";
    } else if (!/^[A-Za-z\s]+$/.test(department)) {
      newErrors.department = "Department name must contain only letters";
    }

    if (!image) {
      newErrors.image = "Hospital logo is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const res = await fetch(`${BACKENDURL}/api/admin/hospital/createFeedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        department_name: department,
        logo_png: image,
        questions,
      }),
    });
    if (res.status === 412) {
      showDialog("Session expired. Please log in again.", () => {
        navigate("/login", { replace: true });
      });
      return;
    }


    const data = await res.json();
    setLoading(false);
    if (res.status === 401) {
      setErrors({ global: `ERROR: ${data.message || "Unauthorized"}` });
      return;
    }


    if (data.success) {
      navigate("/admin/dashboard");
    } else {
      setErrors({ global: data.message || "Failed to create feedback" });
    }
  };

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

      <div className="admin-content admin-content--narrow">
        <div className="admin-page-header">
          <div className="admin-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Form
          </div>
          <h1 className="admin-page-title">Create Feedback</h1>
          <p className="admin-page-subtitle">Set up a new feedback form for your department</p>
        </div>

        <div className="form-container">
          {errors.global && <div style={{color: '#ef4444', fontSize: '14px', fontWeight: '600', textAlign: 'center', marginBottom: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px'}}>{errors.global}</div>}

          <div className="form-group">
            <label htmlFor="department">Department Name</label>
            <input 
              id="department" 
              className="input" 
              placeholder="Enter department name" 
              value={department} 
              onChange={(e) => { setDepartment(e.target.value); setErrors((prev) => ({ ...prev, department: "" })) }} 
              style={errors.department ? { borderColor: '#ef4444' } : {}}
            />
            {errors.department && <span style={{color: '#ef4444', fontSize: '12px', fontWeight: '600', marginTop: '4px', display: 'block'}}>{errors.department}</span>}
          </div>

          <div className="form-group">
            <label>Logo Image</label>
            <label className="upload-btn" style={errors.image ? { borderColor: '#ef4444', color: '#ef4444' } : {}}>Select Image<input type="file" accept="image/*" onChange={handleImage} /></label>
            {errors.image && <span style={{color: '#ef4444', fontSize: '12px', fontWeight: '600', marginTop: '4px', display: 'block'}}>{errors.image}</span>}
            {image && !errors.image && (<div className="image-preview"><img src={image} alt="Preview" /></div>)}
          </div>

          <div className="question-section">
            <h4>Add Questions</h4>
            <div className="form-group">
              <input className="input" placeholder="Enter question text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addQuestion()} />
            </div>
            <button className="btn" onClick={addQuestion}>Add Question</button>

            {questions.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                {questions.map((q, i) => (
                  <div key={i} className="question-item">
                    <span>{i + 1}. {q.text}</span>
                    <span onClick={() => removeQuestion(i)}>❌</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Create Feedback"}
          </button>
        </div>
      </div>

      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}

