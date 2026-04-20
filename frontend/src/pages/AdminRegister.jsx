import React, { useState } from "react";
import "./Register.css";
import "./AdminLayout.css";
import { useNavigate } from "react-router-dom";
import { resetToDefaultTheme } from "../themeUtils";
import { useDialog } from "../components/DialogProvider";
import Select from "react-select";
import { indianCities } from "../components/indianCities";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

export default function AdminRegister() {
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  React.useEffect(() => {
    resetToDefaultTheme();
  }, []);

  const [form, setForm] = useState({
    hospital_name: "",
    hospital_email: "",
    hospital_password: "",
    hospital_phno: "",
    hospital_logo: null,
    location: "",
  });

  const [errors, setErrors] = useState({});

  // Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const indianPhoneRegex = /^[6-9]\d{9}$/;

  const validate = () => {
    const newErrors = {};

    if (!form.hospital_name.trim()) {
      newErrors.hospital_name = "Hospital name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(form.hospital_name)) {
      newErrors.hospital_name = "Name must contain only letters and spaces";
    }

    if (!emailRegex.test(form.hospital_email)) {
      newErrors.hospital_email = "Please enter a valid email format";
    }

    if (form.hospital_password.length < 8) {
      newErrors.hospital_password = "Password is minimum 8 digit";
    }

    if (!indianPhoneRegex.test(form.hospital_phno)) {
      newErrors.hospital_phno = "Enter a valid 10-digit phone number";
    }

    if (!form.hospital_logo) {
      newErrors.hospital_logo = "Hospital logo is required";
    } else if (form.hospital_logo.size > 3 * 1024 * 1024) {
      newErrors.hospital_logo = "Hospital logo maximum size is 3MB";
    }

    if (!form.location) {
      newErrors.location = "Hospital location is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
            ? files[0]
            : value,
    });
  };
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();

    formData.append("hospital_name", form.hospital_name);
    formData.append("hospital_email", form.hospital_email);
    formData.append("hospital_password", form.hospital_password);
    formData.append("hospital_phno", form.hospital_phno);

    // ✅ Convert logo to Base64

    const base64Logo = await fileToBase64(form.hospital_logo);

    // REMOVE data:image/...;base64,
    const pureBase64 = base64Logo.split(",")[1];


    const normalizedPhone = form.hospital_phno.replace(/\D/g, "");
    formData.append("hospital_phno", normalizedPhone);

    formData.append("hospital_logo", pureBase64);

    const payload = {
      hospital_name: form.hospital_name,
      hospital_email: form.hospital_email,
      hospital_password: form.hospital_password,
      hospital_phno: normalizedPhone,
      hospital_logo: pureBase64, // base64 string only
      location: form.location?.value || ""
    };




    try {
      const res = await fetch(`${BACKENDURL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });
      if (res.status === 409) {
        setErrors({ global: "Email already exists!" });
        return;
      }
      if (res.status === 401) {
        setErrors({ global: "Invalid input data!" });
        return;
      }
      if (!res.ok) {
        setErrors({ global: "Registration failed! Please try again." });
        return;
      } else {
        showDialog("Registration successful!", () => {
          navigate("/admin/login", { replace: true });
        });
      }

    } catch (err) {
      setErrors({ global: "Network block or server error. Please try again later." });
    }
  };


  return (
    <div className="login-page">
      {/* Navbar */}
      <nav className="admin-navbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', boxSizing: 'border-box' }}>
        <div className="admin-nav-left">
          <button className="admin-back-btn" onClick={() => navigate('/login')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Login
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

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <form className="login-card" onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div className="admin-header-badge" style={{ display: 'inline-flex' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                New Registration
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--text-main)' }}>Register Hospital</h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Create your hospital admin account</p>
            </div>

            <label>Hospital Name</label>
            <input type="text" name="hospital_name" placeholder="Enter hospital name" value={form.hospital_name} onChange={handleChange} />
            {errors.hospital_name && <p className="error">{errors.hospital_name}</p>}

            <label>Hospital Logo</label>
            <input type="file" name="hospital_logo" accept="image/*" onChange={handleChange} />
            {errors.hospital_logo && <p className="error">{errors.hospital_logo}</p>}

            <label>Email</label>
            <input type="email" name="hospital_email" placeholder="Email" value={form.hospital_email} onChange={handleChange} />
            {errors.hospital_email && <p className="error">{errors.hospital_email}</p>}

            <label>Password</label>
            <input type="password" name="hospital_password" placeholder="Password" value={form.hospital_password} onChange={handleChange} />
            {errors.hospital_password && <p className="error">{errors.hospital_password}</p>}

            <label>Phone Number</label>
            <input type="tel" name="hospital_phno" placeholder="Enter 10-digit mobile number" value={form.hospital_phno}
            onChange={(e) => { const value = e.target.value.replace(/\D/g, "").slice(0, 10);
            setForm({ ...form, hospital_phno: value });}}/>
            {errors.hospital_phno && <p className="error">{errors.hospital_phno}</p>}

            <label>Hospital Location</label>
            <Select className="pt-select" classNamePrefix="pt-select" options={indianCities} placeholder="Select city" value={form.location} onChange={(selected) => setForm({ ...form, location: selected })} menuPlacement="top" menuPortalTarget={document.body} styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} />
            {errors.location && <p className="error">{errors.location}</p>}

            {errors.global && <p className="error global-error">{errors.global}</p>}

            <button style={{ marginTop: '18px' }} className="login-btn" type="submit">Register</button>
          </form>
        </div>
      </div>

      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}
