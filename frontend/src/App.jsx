import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import HospitalLanding from './pages/HospitalLanding'
import FeedbackForm from './pages/FeedbackForm'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminResponses from './pages/AdminResponses'
import AdminRegister from './pages/AdminRegister'
import SuperAdminLogin from './pages/SuperAdminLogin'
import HospitalLogin from './pages/HospitalLogin'
import UserLogin from './pages/UserLogin'
import ComplaintBoard from './pages/ComplaintBoard'
import ComplaintBuilder from './pages/ComplaintBuilder'
import ComplaintForm from './pages/ComplaintForm'
import ComplaintView from './pages/ComplaintView'
import ThemeSettings from './pages/ThemeSettings'
import UserFeedbackForm from './pages/UserFeedbackForm'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import SuperAdminComplaintBoard from './pages/SuperAdminComplaintBoard'
import SuperAdminComplaintList from './pages/SuperAdminComplaintList'
import CreateFeedback from './CreateFeeback'
import EditFeedback from './pages/EditFeedbackForm'
import PublicFeedbackForm from './pages/SubmitFeedbackResponce'
import PublicFeedbackHome from './pages/UserHomeforFeedbackkForm'
import AdminAssignPage from './pages/AdminAssignPerson'
import SecureFeedbackView from './pages/ResponceViewer'
import changeTheme from './pages/changeTheme'
import ChangeTheme from './pages/changeTheme'
import QRScanner from './pages/QRScanner'

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

function App() {
  useEffect(() => {
    // Theme is now loaded from localStorage in main.jsx for instant rendering
  }, []);

  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/hospital/:hospitalId" element={<HospitalLanding />} />
        <Route path="/hospital/:hospitalId/feedback" element={<FeedbackForm />} />
        <Route path="/super-admin/login" element={<SuperAdminLogin />} /> */}

        <Route path="/super-admin/hospital/:hospitalId/complaints" element={<SuperAdminComplaintBoard />} />
        <Route path="/super-admin/hospital/:hospitalId/form/:formId" element={<SuperAdminComplaintList />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/login" element={<AdminLogin />} />
        {/* <Route path="/hospital/login" element={<HospitalLogin />} /> */}
        {/* <Route path="/user/login" element={<UserLogin />} /> */}
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/createFeedback" element={<CreateFeedback />} />
        <Route path="/feedback/:id" element={<PublicFeedbackForm />} />
        <Route path="/user/HomeforFeedback/:hospitalId" element={<PublicFeedbackHome />} />
        <Route path='admin/feedback/edit/:id' element={<EditFeedback />} />
        <Route path="/admin/assignperson" element={<AdminAssignPage />} />
        <Route path='mailPerson/getFeedbackResponsesByToken/:token' element={<SecureFeedbackView />} />
        <Route path='/admin/changeHospitaltheme' element={<ChangeTheme />} />
        <Route path="/use/scanQR" element={<QRScanner />} />
        {/*<Route path="/complaints" element={<ComplaintBoard />} />
        <Route path="/complaints/new" element={<ComplaintBuilder />} />
        <Route path="/complaints/:categoryId" element={<ComplaintForm />} />
        <Route path="/complaints/:categoryId/view/:complaintId" element={<ComplaintView />} />
        <Route path="/user/feedback/:categoryId" element={<UserFeedbackForm />} />
        <Route path="/admin/responses" element={<AdminResponses />} />
        <Route path="/theme" element={<ThemeSettings />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
